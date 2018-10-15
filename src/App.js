import React, { Component, Fragment } from 'react'
import get from 'lodash/get'
import size from 'lodash/size'
import random from 'lodash/random'
import axios from 'axios'
import Word from './Word'
import Speech from 'speak-tts'
import './App.css'

const loadLetterJson = letter => axios.get(`${process.env.PUBLIC_URL}/stresses/json/${letter.toUpperCase()}.json`)

const loadLettersJson = () => {
  const alphabet = 'abcdefghijklmnopqrstuvwxyz'.split('')
  return Promise.all(alphabet.map(letter => loadLetterJson(letter) ))
}

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
    letterWords:{},
    currentWordIndex: null
  }
  componentDidMount = () => {
    speech.init().then(() => {
      this.setState({
        ttsReady: true
      })
    })
    loadLettersJson().then(results => {
      const letterWords = results.reduce((memo, res) => {
        return {
          ...memo,
          ...get(res, 'data', {})
        }
      }, {})
      this.setState({
        letterWords,
        currentWordIndex: pickRandomWordIndex(letterWords)
      })
    }).catch(e => {
      console.log("an error occured:", e)
    })
  }
  render() {
    const { letterWords, currentWordIndex } = this.state
    const currentWordSyllables = get(letterWords, currentWordIndex)
    return (
      <div className="App">
        {currentWordIndex
          ? <Fragment>
              <div className="Instructions">Click on the primary stressed syllable</div>
              <Word speak={this.speak} key={currentWordIndex} text={currentWordIndex} syllables={currentWordSyllables} onNext={this.next} />
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
    const { letterWords } = this.state
    this.setState({
      currentWordIndex: pickRandomWordIndex(letterWords)
    })
  }
}

export default App;
