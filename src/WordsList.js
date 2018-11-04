import React from 'react'

const WordsList = ({ words = [], currentWordIndex = 0}) => {
  const surroundingWords = words.splice(0, 10)
  console.log("debug surroundingWords", {
    currentWordIndex,
    surroundingWords
  })
  return (
    <ul className="Wordslist">
    {surroundingWords.map(word => <li className="Wordlist_word" key={word.text}>{word.text}</li>)}
  </ul>
  )
}


export default WordsList
