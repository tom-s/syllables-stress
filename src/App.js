import React, { Component } from 'react'
import get from 'lodash/get'
import isEmpty from 'lodash/isEmpty'
import axios from 'axios'
import Session from './Session'
import './App.css'

const MODES = {
  STRESSES: 'stresses'
}

const loadLetterJson = letter => axios.get(`${process.env.PUBLIC_URL}/stresses/json/${letter.toUpperCase()}.json`)

const loadLettersJson = () => {
  const alphabet =  'abcde'.split('')
  //const alphabet =  'abcdefghijklmnopqrstuvwxyz'.split('')
  return Promise.all(alphabet.map(letter => loadLetterJson(letter) ))
}

class App extends Component {
  state = {
    words:[],
    mode: null
  }
  componentDidMount = () => {
    loadLettersJson().then(results => {
      const words = results.reduce((memo, res) => {
        Object.entries(get(res, 'data', {})).forEach(([ word, syllables ])=> {
          memo = [
            ...memo,
            {
              'text': word,
              'syllables': syllables
            }
          ]
        })
        return memo
      }, [])
      this.setState({
        words
      })
    }).catch(e => {
      console.log("an error occured loading data:", e)
    })
  }
  render() {
    const { words, mode } = this.state
    console.log("debug mode", mode)
    return (
      <div className="App">
        {isEmpty(words)
          ?  <div className="Loading">Loading</div>
          : <div>
              <div className="Options">
                <button onClick={() => this.setState({ mode: MODES.STRESSES })}>
                  Session stresses
                </button>
                <button onClick={() => this.setState({ mode: null })}>
                  Autre
                </button>
              </div>
              {mode === MODES.STRESSES && <Session words={words} />}
            </div>
        }
      </div>
    )
  }
}

export default App
