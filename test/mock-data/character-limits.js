const oneHundredCharacters =
  'XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX'

let oneHundredThousandCharacters = ''
for (let i = 0; i < 100000 / 100; i++) {
  oneHundredThousandCharacters = oneHundredThousandCharacters += oneHundredCharacters
}

let fourThousandCharacters = ''
for (let i = 0; i < 4000 / 100; i++) {
  fourThousandCharacters = fourThousandCharacters += oneHundredCharacters
}

const CharacterLimits = {
  fourThousandCharacters,
  oneHundredThousandCharacters
}

export { CharacterLimits }; // New ES6
export default CharacterLimits;
