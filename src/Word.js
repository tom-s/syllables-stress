import React, { Component } from 'react'

class Syllable extends Component {
  state = {
    correct: null
  }
  render() {
    const { syllable } = this.props
    const { correct } = this.state
    console.log("debug syllable" , syllable)
    return <span className={`Syllable ${correct === true ? 'Syllable-correct':''} ${correct === false ? 'Syllable-incorrect':''}`} dangerouslySetInnerHTML={{__html: syllable.syllable}} onClick={this.onClick} />
  }
  onClick = () => {
    console.log("onClick !")
    const { syllable } = this.props
    this.setState({
      correct: syllable.primaryStress
    })
  }
}

class Word extends Component {
  render() {
    const { syllables } = this.props
    return (
      <div className="Word">
        {syllables.map((syllable, i) => <Syllable key={i} syllable={syllable} />)}
      </div>
    )
  }
}

export default Word