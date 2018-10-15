import React, { Component } from 'react'
import get from 'lodash/get'
import size from 'lodash/size'
import random from 'lodash/random'
import axios from 'axios'
import Word from './Word'
import './App.css'

const loadLetterJson = letter => axios.get(`${process.env.PUBLIC_URL}/stresses/json/${letter.toUpperCase()}.json`)

const pickRandomLetter = () => String.fromCharCode(97 + random(0, 25))

const pickRandomWordIndex = words => {
  const wordsIndexes = Object.keys(words)
  const max = size(wordsIndexes) - 1
  const index = random(0, max)
  return get(wordsIndexes, index)
}

class App extends Component {
  state = {
    letterWords:{},
    currentWordIndex: null
  }
  componentDidMount = () => {
    loadLetterJson(pickRandomLetter()).then(res => {
      const letterWords = get(res, 'data', {})
      this.setState({
        letterWords,
        currentWordIndex: pickRandomWordIndex(letterWords)
      })
    }).catch(e => {
      console.log("debug e", e)
    })
  }
  render() {
    const { letterWords, currentWordIndex } = this.state
    const currentWordSyllables = get(letterWords, currentWordIndex)
    return (
      <div className="App">
        {currentWordIndex && <Word text={currentWordIndex} syllables={currentWordSyllables} />}
      </div>
    );
  }
}

export default App;
