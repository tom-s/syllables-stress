import React, { Component, createRef } from 'react'
import nlp from 'compromise'

class NlpSandbox extends Component {
  textboxRef = createRef()
  state = {
    res: []
  }
  onChange = e => {
    const { transformations } = this.props
    const value = e.target.value
    this.setState({
      res: Object.keys(transformations).map(key => {
        const transform = transformations[key]
        return {
          name: key,
          res: transform(value)
        }
      })
    })
  }
  render() {
    const { res } = this.state
    return (
      <div>
        <textarea ref={this.textboxRef} onChange={this.onChange} />
        {res.map(({ name, res }, i) => {
          return (
            <div key={i}>
              <div>{name}</div>
              <div>{res}</div>
            </div>
          )
        })}
      </div>
    )
  }
}

const pastTense = text => nlp(text).sentences().toPastTense().out()
const presentTense = text => nlp(text).sentences().toPresentTense().out()
const futureTense = text => nlp(text).sentences().toFutureTense().out()
const conjugate = text => {
  const sentences = nlp(text).sentences()
  console.log("debug verbs", sentences.verbs())
  const conjugate =  sentences.verbs().conjugate()
  return conjugate.reduce((memo, conj) => {
    console.log("debug test", conj)
    const verb = Object.keys(conj).map(tense => `${tense}: ${conj[tense]}`).join(' - ')
    return `${memo} | ${verb}`
  }, '')
}

const plural = text => {
  const sentences =  nlp(text).sentences()
  sentences.nouns().toPlural()
  return sentences.out()
}
const negation = text => {
  const sentences =  nlp(text).sentences()
  sentences.verbs().toNegative()
  return sentences.out()
}

const transformations = {
  "Past tense": pastTense,
  "Present Tense": presentTense,
  "Future tense": futureTense,
  "Conjuguaison": conjugate,
  "Negation": negation,
  "Plural": plural,
}


class Repeat extends Component {
  render() {
    return(
      <NlpSandbox transformations={transformations} />
    )
  }
}

export default Repeat
