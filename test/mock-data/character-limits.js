const oneHundredCharacters =
  'XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX'

let oneHundredThousandCharacters = ''
for (let i = 0; i < 100000 / 100; i++) {
  oneHundredThousandCharacters = oneHundredThousandCharacters += oneHundredCharacters
}

let twoHundredCharacters = ''
for (let i = 0; i < 200 / 100; i++) {
  twoHundredCharacters = twoHundredCharacters += oneHundredCharacters
}

let threeHundredCharacters = ''
for (let i = 0; i < 300 / 100; i++) {
  threeHundredCharacters = threeHundredCharacters += oneHundredCharacters
}

let fourThousandCharacters = ''
for (let i = 0; i < 4000 / 100; i++) {
  fourThousandCharacters = fourThousandCharacters += oneHundredCharacters
}

const CharacterLimits = {
  twoHundredCharacters,
  threeHundredCharacters,
  fourThousandCharacters,
  oneHundredThousandCharacters
}

module.exports = CharacterLimits
