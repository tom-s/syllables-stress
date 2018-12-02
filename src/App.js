import React, { Component } from 'react'
import axios from 'axios'
import get from 'lodash/get'
import Stress from './stress'
import Repeat from './repeat'

const EXERCISES_TYPES = {
  'stress': {
    name: 'stress exercise',
    Component: Stress
  },
  'repeat': {
    name: 'repeat exercise',
    Component: Repeat
  },
}

const loadLetterJson = letter => axios.get(`${process.env.PUBLIC_URL}/stresses/json/${letter.toUpperCase()}.json`)

const loadLettersJson = () => {
  const alphabet = 'abcdefghijklmnopqrstuvwxyz'.split('')
  return Promise.all(alphabet.map(letter => loadLetterJson(letter) ))
}

class App extends Component {
  state = {
    currentExercise: 'repeat',
    words: {}
  }
  componentDidMount = () => {
    loadLettersJson().then(results => {
      const words = results.reduce((memo, res) => {
        return {
          ...memo,
          ...get(res, 'data', {})
        }
      }, {})
      this.setState({
        words,
      })
    }).catch(e => {
      console.log("an error occured:", e)
    })
  }
  render() {
    const { currentExercise, words } = this.state
    const Exercise = EXERCISES_TYPES[currentExercise].Component
    return (
      <div className="App">
        <div className="Exercise_types">
          {Object.keys(EXERCISES_TYPES).map(exerciseTypeKey => {
            const exerciseType = EXERCISES_TYPES[exerciseTypeKey]
            return <button key={exerciseTypeKey} className="Exercise_type" onClick={() => this.changeExerciseType(exerciseTypeKey)}>{exerciseType.name} </button>
          })}
        </div>
        <Exercise words={words} />
      </div>
    )
  }
  changeExerciseType = (exerciseTypeKey) => {
    this.setState({
      currentExercise: exerciseTypeKey
    })
  }
}

export default App
