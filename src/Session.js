import React, { Component, Fragment } from 'react'
import get from 'lodash/get'
import size from 'lodash/size'
import random from 'lodash/random'
import Word from './Word'
import Speech from 'speak-tts'

const pickRandomWordIndex = words => {
  const wordsIndexes = size(words)
  const max = size(wordsIndexes) - 1
  return random(0, max)
}

const speech = new Speech()
speech.setLanguage('en-GB')

class Session extends Component {
  state = {
    ttsReady: false,
    prevPropsWords: null,
    currentWordIndex: null
  }

  static getDerivedStateFromProps(props, state) {
    return (props.words !== state.prevPropsWords)
      ? {
        prevPropsWords: props.words,
        currentWordIndex: pickRandomWordIndex(props.words)
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
    const { currentWordIndex } = this.state
    const currentWord = get(words, currentWordIndex)
    console.log("debug currentWord", currentWord)
    return (
      <div className="App">
        {currentWord && <Fragment>
          <div className="Instructions">Click on the primary stressed syllable</div>
          <Word speak={this.speak} key={currentWord.text} word={currentWord} onNext={this.next} />
        </Fragment>}
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

  next = () => {
    const { words } = this.props
    this.setState({
      currentWordIndex: pickRandomWordIndex(words)
    })
  }
}

export default Session
