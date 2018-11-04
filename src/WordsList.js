import React from 'react'
import slice from 'lodash/slice'

const WordsList = ({ words = [], currentWordIndex = 0}) => {
  const surroundingWords = slice(words, currentWordIndex, currentWordIndex + 20)
  return (
    <ul className="Wordslist">
    {surroundingWords.map((word, i) => <li className={`Wordlist_word ${i===0 ? 'Wordlist_word-current':''}`} key={word.text}>{word.text}</li>)}
  </ul>
  )
}


export default WordsList
