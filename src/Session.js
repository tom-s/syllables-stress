import React, { Component } from 'react'
import get from 'lodash/get'
import Word from './Word'
import WordsList from './WordsList'
import Speech from 'speak-tts'

const speech = new Speech()
speech.setLanguage('en-GB')

class Session extends Component {
  state = {
    ttsReady: false,
    prevPropsWords: null,
    currentWordIndex: null,
    history: []
  }

  static getDerivedStateFromProps(props, state) {
    return (props.words !== state.prevPropsWords)
      ? {
        prevPropsWords: props.words,
        currentWordIndex: 0,
        history: []
      } : null
  }

  componentDidMount = () => {
    speech.init().then(() => {
      this.setState({
        ttsReady: true
      })
    }).catch(e => {
      console.log("tts not availale", e)
    })
  }

  render() {
    const { words } = this.props
    const { currentWordIndex, history, ttsReady } = this.state
    const currentWord = get(words, currentWordIndex)
    return (
      <div className="Session">
        <div className="Left_panel">
          <WordsList history={history} currentWordIndex={currentWordIndex} words={words} />
        </div>
        <div className="Main_panel">
          <div className="Instructions">Click on the primary stressed syllable</div>
          <Word speak={this.speak} key={currentWord.text} word={currentWord} onNext={this.next} />
        </div>
      </div>
    )
  }

  speak = (text) => {
    const { ttsReady } = this.state
    ttsReady && speech.speak({
      text,
      queue: false
    })
  }

  next = (data) => {
    this.setState(prevState => ({
      currentWordIndex: prevState.currentWordIndex + 1,
      history: [
        ...prevState.history,
        {wordIndex: prevState.currentWordIndex, ...data}
      ]
    }))
  }
}

export default Session
