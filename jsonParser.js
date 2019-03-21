let result
const nullParser = input => (result = input.match(/^null/)) && [null, input.slice(4)]
const trueParser = input => (result = input.match(/^true/)) && [true, input.slice(4)]
const falseParser = input => (result = input.match(/^false/)) && [false, input.slice(5)]
const numberParser = input => (result = input.match(/^-?(0|([1-9][0-9]*))(\.[0-9]+)?([E][+-]?[0-9]+)?/i)) && [result[0], input.slice(result[0].length)]
const spaceParser = input => input.replace(/^\s+/, '')

const stringParser = input => {
  if (input[0] !== '"') return null
  let str = ''; let i = 1; let isEscape = false
  let specialChars = { '\\': '\\', '/': '/', '"': '"', b: '\b', f: '\f', n: '\n', r: '\r', t: '\t', u: true }
  while (i <= input.length - 1) {
    if (input[i] === '"' && isEscape === false) return [str, input.slice(i + 1)]
    if (isEscape === false) {
      if (input[i] === '\\') isEscape = true; else str = str + input[i]
    } else {
      if (!specialChars[input[i]]) return null
      if ((result = input.slice(i, i + 5).match(/^u[0-9A-Fa-f]{4}/))) {
        str = str + String.fromCharCode(parseInt(result[0].slice(1), 16))
        i = i + 4
      } else {
        str = str + specialChars[input[i]]
      }
      isEscape = false
    }
    i = i + 1
  }
}

const arrayParser = input => {
  if (input[0] !== '[') return null; else input = input.slice(1)
  let newArr = []
  while (input[0] !== ']') {
    if (input[0] !== ',') {
      input = input.replace(/^\s+/, '')
      if (input[0] === ']') break
      let match = valueParser(input)
      if (!match) return null
      else {
        newArr.push(match[0])
        input = match[1]
        // same like objects  when "    ]"  is present it will fail, so remove space
        input = input.replace(/^\s+/, '')
      }
    } else {
      input = input.slice(1).replace(/^\s+/, '')
      if (input[0] === ']') return null
      if (input[0] === ',') return null
    }
  }
  return [newArr, input.slice(1)]
}

const objectParser = input => {
  if (input[0] !== '{') return null
  let newObj = {}; let match; let key
  input = input.slice(1)
  input = spaceParser(input)
  if (input[0] === '}') return [newObj, input.slice(1)]
  while (input[0] !== '}') {
    input = spaceParser(input)
    match = stringParser(input)
    if (!match) return null
    else { key = match[0] }
    input = match[1]
    input = spaceParser(input)
    if (input[0] !== ':') return null
    input = input.slice(1)
    input = spaceParser(input)
    match = valueParser(input)
    if (!match) return null
    else {
      newObj[key] = match[0]
      console.log(newObj)
      input = match[1]
    }
    input = spaceParser(input)
    if (input[0] === '}') return [newObj, input.slice(1)]
    else {
      if (input[0] === ',') input = input.slice(1)
      else return null
    }
  }
  return [newObj, input.slice(1)]
}

const valueParser = input => {
  input = input.replace(/^\s+/, '')
  const parsers = [stringParser, nullParser, trueParser, falseParser, numberParser, arrayParser, objectParser]
  let value
  for (let parser of parsers) {
    if (!value) {
      value = parser(input)
    } else break
  }
  return value
}

const main = path => {
  let fs = require('fs')
  let content
  fs.readFile(path, function read (err, data) {
    if (err) throw err
    content = data
    console.log(JSON.stringify(valueParser(content.toString('utf8'))))
  })
}

main(`./test/pass1.json`)
