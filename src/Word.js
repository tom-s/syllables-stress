import React, { Component, Fragment } from 'react'


class Tts extends Component {
  render() {
    const { onClick } = this.props
    return <Fragment>
      <button className="Tts_speak" onClick={onClick}>HEAR</button>
    </Fragment>
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
    const { onNext } = this.props
    this.setState({
      success: true
    })
    window.setTimeout(() => {
      onNext()
    }, 2000)
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
        {success && <div className="Success">Congratulations !</div>}
        {!success && <div className="Skip" onClick={onNext}>Skip</div>}
      </div>
    )
  }
}

export default Word