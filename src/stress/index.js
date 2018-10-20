import React, { Component, Fragment } from 'react'
import get from 'lodash/get'
import size from 'lodash/size'
import random from 'lodash/random'
import Word from './Word'
import Speech from 'speak-tts'
import './style.css'

//const pickRandomLetter = () => String.fromCharCode(97 + random(0, 25))

const pickRandomWordIndex = words => {
  const wordsIndexes = Object.keys(words)
  const max = size(wordsIndexes) - 1
  const index = random(0, max)
  return get(wordsIndexes, index)
}

const speech = new Speech() 
speech.setLanguage('en-GB')

class App extends Component {
  state = {
    ttsReady: false,
    currentWordIndex: null
  }
  componentDidMount = () => {
    const { words } = this.props
    speech.init().then(() => {
      this.setState({
        ttsReady: true
      })
    })
    this.setState({
      currentWordIndex: pickRandomWordIndex(words)
    })
  }
  componentDidUpdate(prevProps) {
    if (this.props.words !== prevProps.words) {
      this.setState({
        currentWordIndex: pickRandomWordIndex(this.props.words)
      })
    } 
  }
  render() {
    const { currentWordIndex } = this.state
    const { words } = this.props
    return (
      <div className="Stress">
        {currentWordIndex
          ? <Fragment>
              <div className="Instructions">Click on the primary stressed syllable</div>
              <Word speak={this.speak} key={currentWordIndex} text={currentWordIndex} syllables={get(words, currentWordIndex)} onNext={this.next} />
            </Fragment>
          : <div className="Loading">Loading</div>
        }
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

export default App;
