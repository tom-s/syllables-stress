import React, { Component } from 'react'
import Recorder from '@lls/lls-audio/lab/recorderWithPlayer'

class Tts extends Component {
  render() {
    const { onClick } = this.props
    return <div className="Tts_speak" onClick={onClick}>
      <img className="Tts_speak_ear" alt="hear" src={`${process.env.PUBLIC_URL}/ear.svg`} />
    </div>
  }
}

class Syllable extends Component {
  state = {
    correct: null
  }
  render() {
    const { syllable } = this.props
    const { correct } = this.state
    return <span className={`Syllable ${correct === true ? 'Syllable-correct':''} ${correct === false ? 'Syllable-incorrect':''}`} dangerouslySetInnerHTML={{__html: syllable.syllable}} onClick={this.onClick} />
  }
  onClick = () => {
    const { syllable, onCorrect } = this.props
    const correct = syllable.primaryStress
    this.setState({
      correct
    })
    correct && onCorrect()
  }
}

class Word extends Component {
  state = {
    success: false
  }
  onCorrect = () => {
    this.setState({
      success: true
    })
  }
  next = () => {
    const { onNext } = this.props
    onNext()
  }
  speak = () => {
    const { text, speak } = this.props
    speak(text)
  }
  render() {
    const { syllables, onNext } = this.props
    const { success } = this.state
    return (
      <div className="Word">
        <div className="Syllables">
          {syllables.map((syllable, i) => <Syllable key={i} syllable={syllable} onCorrect={this.onCorrect} />)}
        </div>
        <Tts onClick={this.speak} />
        {success && <div className="Success" onClick={this.next}>Congratulations ! Click to carry on</div>}
        {!success && <div className="Skip" onClick={onNext}>Skip</div>}
        <Recorder />
      </div>
    )
  }
}

export default Word