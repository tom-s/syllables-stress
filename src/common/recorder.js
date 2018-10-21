import React, { Component } from 'react'
import AudioContextSingleton from 'audio-context'
import getUserMedia from 'getusermedia'
import hark from 'hark'
import InlineWorker from 'inline-worker'
import AudioWorker from './AudioWorker'

const audioContext = AudioContextSingleton()


// make the volume a value between 0 and 100
const formatVolume = volume => Math.max(0, Math.min(100, volume + 100))

const initRecorder = ({stream, audioContext, onAudioProcess = () => {}}) => {
  const bufferSize = 4096
  const numberOfInputChannels = 1 // for google cloud Speech to text, we must have one (and only one) channel
  const numberOfOutputChannels = 1

  // creates an audio node from the microphone incoming stream
  const mediaStream = audioContext.createMediaStreamSource(stream)
  const recorder =  (audioContext.createScriptProcessor)
      ? audioContext.createScriptProcessor(bufferSize, numberOfInputChannels, numberOfOutputChannels)
      : audioContext.createJavaScriptNode(bufferSize, numberOfInputChannels, numberOfOutputChannels)

  recorder.onaudioprocess = onAudioProcess

  // we connect the recorder with the input stream
  mediaStream.connect(recorder)
  recorder.connect(audioContext.destination)

  return recorder
}

const initWorker = ({ onMessage = () => {} }) => {
  const worker = new InlineWorker(AudioWorker, {})
  worker.onmessage = onMessage
  return worker
}

const initSpeechEvents = ({stream, onSpeaking = () => {}, onStoppedSpeaking = () => {}, onVolumeChange = () => {}, debounce}) => {
  // Try hark
  const options = {
    interval: debounce,
    play: true // true: allow to hear the result for debug
  }
  const speechEvents = hark(stream, options)

  speechEvents.on('speaking', onSpeaking)
  speechEvents.on('stopped_speaking', onStoppedSpeaking)
  speechEvents.on('volume_change', onVolumeChange)

  return speechEvents
}

class Recorder {
  worker = null
  recorder = null
  speechEvent = null
  recordStart = null
  audioStream = null

  stop() {
    if (this.audioStream.getTracks) {
      const tracks = this.audioStream.getTracks()
      tracks.forEach(track => track.stop())
    }

    this.audioStream.stop && this.audioStream.stop()

    this.speechEvents.stop()
  }

  init = props => {
    const { debounce = 200, onVolumeChange = () => {}, onRecordComplete = () => {}}  = props
    return new Promise((resolve, reject) => {
      getUserMedia({audio: true})
        .then((stream) => {
          this.initStream({
            stream,
            onError,
            onVolumeChange,
            onRecordComplete,
            debounce
          })
          resolve()
        })
        .catch(err => {
          reject(err)
        })
      })
  }

  initStream = ({ stream, onError, onVolumeChange, onRecordComplete, debounce }) => {
    // Init worker that will do heavy calculation
    this.audioStream = stream
    this.worker = initWorker({onMessage: e => {
      switch (e.data.command) {
        case 'send_WAV':
          onRecordComplete(e.data.audioBlob)
          break
        default:
          break
      }
    }})

    // Init recorder
    this.recorder = initRecorder({
      stream,
      audioContext,
      onAudioProcess: (e) => {
        const inputBuffer = []
        for (var channel = 0; channel < e.inputBuffer.numberOfChannels; channel++) {
          inputBuffer.push(e.inputBuffer.getChannelData(channel))
        }
        this.worker.postMessage({command: 'append', timestamp: Date.now(), inputBuffer})
      },
      debounce
    })

    // Initialize hark for silence recognition
    this.speechEvents = initSpeechEvents({
      stream,
      onStoppedSpeaking: () => {
        try {
          this.worker.postMessage({command: 'exportWAV', beginning: this.recordStart, end: Date.now()})
        } catch(e) {
          onError(e)
        }
      },
      onSpeaking: () => {
        this.recordStart = Date.now() - debounce * 3 // give it a bit of extra time
      },
      onVolumeChange: (volume) => {
        onVolumeChange(formatVolume(volume))
      },
      debounce
    })

  }
}

export default Recorder