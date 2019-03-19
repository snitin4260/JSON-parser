const valueParser = input => {
  input = input.replace(/^\s+/, '')
  const parsers = [nullParser, boolParser, numberParser, stringParser, arrayParser, objectParser]
  let value
  for (let parser of parsers) {
    if (!value) {
      value = parser(input)
    } else break
  }
  return value
}

const nullParser = input => input.startsWith('null') ? [null, input.slice(4)] : null

const boolParser = input => {
  if (input.startsWith('true')) return [true, input.slice(4)]
  else if (input.startsWith('false')) return [false, input.slice(5)]
  return null
}

const numberParser = input => {
  let regex = /^-?(0|([1-9][0-9]*))(\.[0-9]+)?([E][+-]?[0-9]+)?/i
  let match = regex.exec(input)
  if (!match) return null
  return [match[0] * 1, input.slice(match[0].length)]
}

const stringParser = input => {
  if (input[0] !== '"') return null
  let str = ''; let i = 1
  let specialChars = { '\\': '\\', '/': '/', '"': '"', b: '\b', f: '\f', n: '\n', r: '\r', t: '\t' }
  while (i <= input.length - 1) {
    if (i !== 0 && input[i] === '"') {
      return [str, input.slice(i + 1)]
    } else if (input[i] === '\\') {
      if (specialChars[input[i + 1]]) {
        str = str + specialChars[input[i + 1]]
        i = i + 2
      } else if (input[i + 1] === 'u') {
        let hex = input.slice(i + 2, i + 6)
        let regex = /[0-9A-Fa-f]{4}/
        let check = regex.test(hex)
        if (!check) return null
        // convert hex to decimal
        let charCode = parseInt(hex, 16)
        let char = String.fromCharCode(charCode)
        str = str + char
        i = i + 6
      } else return null
    } else if (input[i] !== '"' && input[i] !== '\\') {
      str = str + input[i]
      i = i + 1
    } else return null
  }
}

const arrayParser = input => {
  if (input[0] !== '[') return null
  let str
  let newArr = []
  str = input.slice(1)
  while (str[0] !== ']') {
    if (str[0] !== ',') {
      str = str.replace(/^\s+/, '')
      if (str[0] === ']') break
      let match = valueParser(str)
      if (!match) return null
      else {
        newArr.push(match[0])
        str = match[1]
        // same like objects  when "    ]"  is
        // present it will fail
        // so do this here
        str = str.replace(/^\s+/, '')
      }
    } else {
      // remove ,
      str = str.slice(1)
      str = str.replace(/^\s+/, '')
      if (str[0] === ']') return null
      // cannot have ,, in succession
      if (str[0] === ',') return null
    }
  }
  if (str[0] === ']') return [newArr, str.slice(1)]
}

const objectParser = input => {
  if (input[0] !== '{') return null

  let newObj = {}

  let currentKey
  let valueFound = false

  // object key has to be parsed or not
  let keyShouldBeParsed = true
  let colon = false

  // remove { from string
  input = input.slice(1)
  // again remove all whitespaces
  input = input.replace(/^\s+/, '')

  while (input[0] !== '}') {
    if (keyShouldBeParsed) {
      let match = valueParser(input)
      if (!match) return null
      else if (typeof match[0] !== 'string') {
        // throw new Error("Object keys must be strings");
        return null
      } else {
        currentKey = match[0]
        input = match[1]
        keyShouldBeParsed = false
      }
    } else {
      // again remove whitespace
      // until , or a value is encountered
      input = input.replace(/^\s+/, '')
      if (!colon && input[0] === ':') {
        input = input.slice(1)
        colon = true
      } else if (!colon && !input[0] === ':') {
        return null
      } else if (colon && !valueFound) {
        // again check for white spaces
        input = input.replace(/^\s+/, '')
        // now it has to be parsed by all value parsers
        let match = valueParser(input)
        if (!match) {
          // throw new Error("Wrong format. Insert a valid value");
          return null
        } else {
          newObj[currentKey] = match[0]
          // get remiaining string to be evaluated
          input = match[1]
          valueFound = true
        }
      } else if (valueFound) {
        input = input.replace(/^\s+/, '')
        // after value found if we have /n  }
        // we need to check that case
        if (input[0] === '}') break
        if (input[0] !== ',') {
          return null
        } else {
          // there can't be } after ,
          input = input.slice(1)
          // this is for cases where there is space after
          //, like ,       }
          input = input.replace(/^\s+/, '')
          if (input[0] === '}') return null
          colon = false
          keyShouldBeParsed = true
          valueFound = false
        }
      }
    }
  }
  if (input[0] === '}') {
    return [newObj, input.slice(1)]
  }
}

const start = path => {
  let fs = require('fs')
  let content
  // First I want to read the file
  fs.readFile(path, function read (err, data) {
    if (err) {
      throw err
    }
    content = data
    let result = content.toString('utf8')
    let val = valueParser(result)
    console.log(JSON.stringify(val, null, 4))
  })
}

start(`./test/twitter.json`)
