const fs = require('fs')
const splitHtml = require('split-html')
const compact = require('lodash/compact')
const isEmpty = require('lodash/isEmpty')
const PATH = 'public/stresses/'
const JSON_PATH = 'public/stresses/json/'
const REGEX = /<\/{0,1}[0-2]>/gi


let letterResult = {}
let currentLetter = null
let fullResult = {}

const data = fs.readFileSync(`${PATH}stresses.txt`)
const splitList = data.toString().split(/\n/)

const DEBUG_START = 45220 //letter H

for (var i = 0; i < splitList.length; i++) {
//for (var i = DEBUG_START; i < DEBUG_START + 10; i++) { //for debug
  const line = splitList[i]
  const word = line.replace(REGEX, '')
  const stresses = line
  const firstLetter = word.charAt(0)
  if(currentLetter && firstLetter !== currentLetter && !isEmpty(letterResult)) {
    // Write previous file
    const fileLetterContent = JSON.stringify(letterResult)
    fs.writeFileSync(`${JSON_PATH}${currentLetter}.json`, fileLetterContent)
    letterResult = {}
  }
  const fragments = compact(splitHtml(stresses, '0,1,2').filter(frag => frag !== '<0></0>' && frag !== '<1></1>' && frag !== '<2></2>'))
   // Only add words with several syllables
   if(fragments.length > 1) {
    const stressesArray = fragments.map(frag => {
      return {
        syllable: frag.replace(REGEX, ''),
        primaryStress: frag.includes('<1>') || fragments.length === 1,
        secondaryStress: frag.includes('<2>')
      }
    })
    currentLetter = firstLetter
    letterResult[word] = stressesArray
    fullResult[word] = stressesArray
  }
}

// Write last letter file
const fileLetterContent = JSON.stringify(letterResult)
fs.writeFileSync(`${JSON_PATH}${currentLetter}.json`, fileLetterContent)

/* Write json with all data
const fileContent = JSON.stringify(fullResult)
fs.writeFileSync(`${PATH}all.json`, fileContent)
 */