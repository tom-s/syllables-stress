import React, { Component } from 'react'


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
    isCorrect: null
  }
  render() {
    const { syllable } = this.props
    const { isCorrect } = this.state
    return <span className={`Syllable ${isCorrect === true ? 'Syllable-correct':''} ${isCorrect === false ? 'Syllable-incorrect':''}`} dangerouslySetInnerHTML={{__html: syllable.syllable}} onClick={this.onClick} />
  }
  onClick = () => {
    const { syllable, onClick } = this.props
    const isCorrect = syllable.primaryStress
    this.setState({
      isCorrect
    })
    onClick && onClick(isCorrect)
  }
}

class Word extends Component {
  state = {
    isCorrect: false,
    errorsCount: 0
  }

  onClick = isCorrect => {
    this.setState(prevState => ({
      isCorrect,
      errorsCount: isCorrect
        ? prevState.errorsCount
        : prevState.errorsCount + 1
    }))
  }

  onNext = (e, skipped = false) => {
    const { onNext } = this.props
    const { isCorrect, errorsCount } = this.state
    onNext && onNext({
      skipped,
      isCorrect,
      errorsCount
    })
  }
  onSkip = () => {
    this.onNext(null, true)
  }
  speak = () => {
    const { word, speak } = this.props
    speak(word.text)
  }
  render() {
    const { word } = this.props
    const { isCorrect } = this.state
    return (
      <div className="Word">
        <div className="Syllables">
          {word.syllables.map((syllable, i) => <Syllable key={i} syllable={syllable} onClick={this.onClick} />)}
        </div>
        <Tts onClick={this.speak} />
        {isCorrect && <div className="Success" onClick={this.onNext}>Congratulations ! Click to carry on</div>}
        {!isCorrect && <div className="Skip" onClick={this.onSkip}>Skip</div>}
      </div>
    )
  }
}

export default Word
