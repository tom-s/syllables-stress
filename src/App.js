import React, { Component } from 'react'
import get from 'lodash/get'
import isEmpty from 'lodash/isEmpty'
import axios from 'axios'
import Session from './Session'
import './App.css'

const loadLetterJson = letter => axios.get(`${process.env.PUBLIC_URL}/stresses/json/${letter.toUpperCase()}.json`)

const loadLettersJson = () => {
  const alphabet = ['z']//, 'b'] //'abcdefghijklmnopqrstuvwxyz'.split('')
  return Promise.all(alphabet.map(letter => loadLetterJson(letter) ))
}

class App extends Component {
  state = {
    words:[]
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
    const { words } = this.state
    return (
      <div className="App">
        {isEmpty(words)
          ? <div className="Loading">Loading</div>
          : <Session words={words} />
        }
      </div>
    )
  }
}

export default App;
