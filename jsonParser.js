let result
const nullParser = input => (result = input.match(/^null/)) && [null, input.slice(4)]
const trueParser = input => (result = input.match(/^true/)) && [true, input.slice(4)]
const falseParser = input => (result = input.match(/^false/)) && [false, input.slice(5)]
const numberParser = input => (result = input.match(/^-?(0|([1-9][0-9]*))(\.[0-9]+)?([E][+-]?[0-9]+)?/i)) && [result[0] * 1, input.slice(result[0].length)]
const spaceParser = input => input.replace(/^\s+/, '')
const stringParser = input => {
  if (input[0] !== '"') return null
  let str = ''; let i = 1; let isEscape = false
  let specialChars = { '\\': '\\', '/': '/', '"': '"', b: '\b', f: '\f', n: '\n', r: '\r', t: '\t', u: true }
  while (i <= input.length - 1) {
    if (input[i] === '"' && isEscape === false) return [str, input.slice(i + 1)]
    if (isEscape === false) {
      if (input[i] === '\\') isEscape = true; else str += input[i]
    } else {
      if (!specialChars[input[i]]) return null
      str += ((result = input.slice(i, i + 5).match(/^u[0-9A-Fa-f]{4}/))) ? (i = i + 4) && String.fromCharCode(parseInt(result[0].slice(1), 16)) : specialChars[input[i]]
      isEscape = false
    }
    i = i + 1
  }
}
const arrayParser = input => {
  if (input[0] !== '[') return null; else input = input.slice(1)
  let newArr = []
  input = spaceParser(input)
  while (input[0] !== ']') {
    if ((result = valueParser(input))) newArr.push(result[0]); else return null
    if ((input = spaceParser(result[1]))[0] === ',') {
      input = spaceParser(input.slice(1))
      if (input[0] === ']') return null
    } else if (input[0] !== ']') return null
  }
  return [newArr, input.slice(1)]
}
const objectParser = input => {
  if (input[0] !== '{') return null; else input = input.slice(1)
  let newObj = {}; let key
  input = spaceParser(input)
  while (input[0] !== '}') {
    if ((result = stringParser(input))) [key, input] = result; else return null
    input = spaceParser(input)
    if (input[0] === ':') input = input.slice(1); else return null
    input = spaceParser(input); result = valueParser(input)
    if (result) newObj[key] = result[0]; else return null
    if ((input = spaceParser(result[1]))[0] === ',') {
      input = spaceParser(input.slice(1))
      if (input[0] === '}') return null
    } else if (input[0] !== '}') return null
  }
  return [newObj, input.slice(1)]
}
const valueParser = input => stringParser(input) || nullParser(input) || trueParser(input) || falseParser(input) || numberParser(input) || arrayParser(input) || objectParser(input)

const main = path => {
  let fs = require('fs')
  fs.readFile(path, function read (err, data) {
    if (err) throw err
    let content = data.toString('utf8')
    content = spaceParser(content)
    let result = valueParser(content)
    if (!result) console.log('invalid json')
    else {
      let remainingStringCheck = spaceParser(result[1])
      if (remainingStringCheck.length >= 1) console.log('invalid json'); else console.log(JSON.stringify(result[0]))
    }
  })
}

main(`./test/pass1.json`)
