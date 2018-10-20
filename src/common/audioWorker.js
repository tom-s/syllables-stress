const AudioWorker = (self) => {
  let buffersToProcess = []
  let recBuffers = []

  const processBuffers = () => {
    buffersToProcess.forEach(({timestamp, inputBuffer}) => {
      appendBuffer(timestamp, inputBuffer)
    })
  }

  const mergeBuffers = (recBuffers, recLength) => {
    const result = new Float32Array(recLength)
    let offset = 0
    for (let i = 0; i < recBuffers.length; i++) {
      result.set(recBuffers[i], offset)
      offset += recBuffers[i].length
    }
    return result
  }

  const appendBuffer = (timestamp, inputBuffer) => {
    for (let channel = 0; channel < inputBuffer.length; channel++) {
      if (!recBuffers[channel]) recBuffers[channel] = []
      recBuffers[channel].push({timestamp, data: inputBuffer[channel], length: inputBuffer[channel].length})
    }
    return inputBuffer[0].length
  }

  const interleave = (inputL, inputR) => {
    let length = inputL.length + inputR.length
    let result = new Float32Array(length)

    let index = 0
    let inputIndex = 0

    while (index < length) {
      result[index++] = inputL[inputIndex]
      result[index++] = inputR[inputIndex]
      inputIndex++
    }
    return result
  }

  const writeString = (view, offset, string) => {
    for (let i = 0; i < string.length; i++) {
      view.setUint8(offset + i, string.charCodeAt(i))
    }
  }

  const floatTo16BitPCM = (output, offset, input) => {
    for (let i = 0; i < input.length; i++, offset += 2) {
      let s = Math.max(-1, Math.min(1, input[i]))
      output.setInt16(offset, s < 0 ? s * 0x8000 : s * 0x7FFF, true)
    }
  }

  const encodeWAV = (samples) => {
    const buffer = new ArrayBuffer(44 + samples.length * 2)
    const view = new DataView(buffer)

    /* RIFF identifier */
    writeString(view, 0, 'RIFF')
    /* RIFF chunk length */
    view.setUint32(4, 36 + samples.length * 2, true)
    /* RIFF type */
    writeString(view, 8, 'WAVE')
    /* format chunk identifier */
    writeString(view, 12, 'fmt ')
    /* format chunk length */
    view.setUint32(16, 16, true)
    /* sample format (raw) */
    view.setUint16(20, 1, true)
    /* channel count */
    view.setUint16(22, recBuffers.length, true)
    /* sample rate */
    view.setUint32(24, 44100, true)
    /* byte rate (sample rate * block align) */
    view.setUint32(28, 44100 * recBuffers.length * 2, true)
    /* block align (channel count * bytes per sample) */
    view.setUint16(32, recBuffers.length * 2, true)
    /* bits per sample */
    view.setUint16(34, 16, true)
    /* data chunk identifier */
    writeString(view, 36, 'data')
    /* data chunk length */
    view.setUint32(40, samples.length * 2, true)

    floatTo16BitPCM(view, 44, samples)

    return view
  }

  const exportWAV = (beginning, end) => {
    processBuffers() // append all buffers together

    const buffers = []
    for (let channel = 0; channel < recBuffers.length; channel++) {
      let length = 0
      const filtredRecBuffers = recBuffers[channel]
        .filter(buffer => buffer.timestamp >= (beginning - 1000) && buffer.timestamp <= end)
        .map(buffer => {
          length += buffer.length
          return buffer.data
        })
      buffers.push(mergeBuffers(filtredRecBuffers, length))
    }
    const interleaved = recBuffers.length === 2 ? interleave(buffers[0], buffers[1]) : buffers[0]
    const dataview = encodeWAV(interleaved)
    return new Blob([dataview], {type: 'audio/wav'})
  }


  self.onmessage = e => {
    switch (e.data.command) {
      case 'append':
        buffersToProcess.push({
          timestamp: e.data.timestamp,
          inputBuffer: e.data.inputBuffer
        })
        break
      case 'exportWAV':
        const audioBlob = exportWAV(e.data.beginning, e.data.end)
        postMessage({command: 'send_WAV', audioBlob})

        // Clean variables
        recBuffers = []
        buffersToProcess = []
        break
      default: 
        break
    }
  }
}

export default AudioWorker
