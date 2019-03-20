const nullParser = input => input.startsWith('null') ? [null, input.slice(4)] : null

const trueParser = input => input.startsWith('true') ? [true, input.slice(4)] : null

const falseParser = input => input.startsWith('false') ? [false, input.slice(5)] : null

let result

const numberParser = input => (result = input.match(/^-?(0|([1-9][0-9]*))(\.[0-9]+)?([E][+-]?[0-9]+)?/i)) && [result[0], input.slice(result[0].length)]

const stringParser = input => {
  if (input[0] !== '"') return null
  let str = ''; let i = 1; let isEscape = false
  let specialChars = { '\\': '\\', '/': '/', '"': '"', b: '\b', f: '\f', n: '\n', r: '\r', t: '\t' }
  while (i <= input.length - 1) {
    if (input[i] === '"' && isEscape === false) {
      return [str, input.slice(i + 1)]
    }
    if (isEscape === false) {
      if (input[i] === '\\') { isEscape = true } else { str = str + input[i] }
    } else {
      if (specialChars[input[i]]) {
        str = str + specialChars[input[i]]
      } else if (input[i] === 'u') {
        let hex = input.slice(i + 1, i + 5)
        let regex = /[0-9A-Fa-f]{4}/
        let check = regex.test(hex)
        if (!check) return null
        // convert hex to decimal
        let charCode = parseInt(hex, 16)
        let char = String.fromCharCode(charCode)
        str = str + char
        i = i + 4
      } else {
        return null
      }
      isEscape = false
    }
    i = i + 1
  }
}

const arrayParser = input => {
  if (input[0] !== '[') return null
  let str; let newArr = []
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
  let newObj = {}; let currentKey; let valueFound = false; let keyShouldBeParsed = true; let colon = false
  input = input.slice(1)
  input = input.replace(/^\s+/, '')
  while (input[0] !== '}') {
    if (keyShouldBeParsed) {
      let match = valueParser(input)
      if (!match) return null
      else if (typeof match[0] !== 'string') {
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
      if (!colon) {
        if (input[0] === ':') {
          input = input.slice(1)
          colon = true
        } else return null
      } else if (colon && !valueFound) {
        // again check for white spaces
        input = input.replace(/^\s+/, '')
        let match = valueParser(input)
        if (!match) {
          return null
        } else {
          newObj[currentKey] = match[0]
          input = match[1]
          valueFound = true
        }
      } else if (valueFound) {
        input = input.replace(/^\s+/, '')
        // after value found if we have /n  } , check that case
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

const valueParser = input => {
  input = input.replace(/^\s+/, '')
  const parsers = [nullParser, trueParser, falseParser, numberParser, stringParser, arrayParser, objectParser]
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
    let result = content.toString('utf8')
    console.log(JSON.stringify(valueParser(result)))
  })
}
main(`./test/reddit.json`)
