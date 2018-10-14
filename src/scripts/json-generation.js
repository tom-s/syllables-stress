const PATH = 'src/resources/stresses/'
const JSON_PATH = 'src/resources/stresses/json/'
const fs = require('fs')

const data = fs.readFileSync(`${PATH}stresses.txt`)
let letterResult = {}
let currentLetter = null
let fullResult = {}
const splitList = data.toString().split(/\n/)

for (var i = 0; i < splitList.length; i++) {
  const line = splitList[i].split(' 	')
  const word = line[0]
  const stresses = line[1]
  const firstLetter = word.charAt(0)
  if(currentLetter && firstLetter !== currentLetter) {
    // Write previous file
    const fileLetterContent = JSON.stringify(letterResult)
    fs.writeFileSync(`${JSON_PATH}${currentLetter}.json`, fileLetterContent)
    letterResult = {}
  }
  currentLetter = firstLetter
  letterResult[word] = stresses
  fullResult[word] = stresses
}

// Write last letter file
const fileLetterContent = JSON.stringify(letterResult)
fs.writeFileSync(`${JSON_PATH}${currentLetter}.json`, fileLetterContent)

/* Write json with all data
const fileContent = JSON.stringify(fullResult)
fs.writeFileSync(`${PATH}all.json`, fileContent)
 */