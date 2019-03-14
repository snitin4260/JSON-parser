const allParsers = input => {
  const parsers = [
    nullParser,
    boolParser,
    numberParser,
    stringParser,
    arrayParser,
    objectParser
  ];
  let value;
  for (let parser of parsers) {
    if (!value) {
      value = parser(input);
    } else break;
  }
  return value;
};

const nullParser = input => {
  input = input.replace(/^\s+/, "");
  if (!input.startsWith("null")) return null;
  return [null, input.slice(4)];
};

const boolParser = input => {
  input = input.replace(/^\s+/, "");
  if (!(input.startsWith("true") || input.startsWith("false"))) return null;
  if (input[0] == "t") return [true, input.slice(4)];
  return [false, input.slice(5)];
};

//console.log(boolParser("true178"))

const numberParser = input => {
  input = input.replace(/^\s+/, "");
  let regex = /^-?(0|([1-9][0-9]*))(\.[0-9]+)?([E][+-]?[0-9]+)?/i;
  let match = regex.exec(input);
  if (!match) return null;
  return [Number(match[0]), input.slice(match[0].length)];
};

//console.log(numberParser(-908));

const stringParser = input => {
  input = input.replace(/^\s+/, "");
  let str = "";
  let specialChars = {
    "\\": "\\",
    "/": "/",
    '"': '"',
    "\b": "\b",
    "\f": "\f",
    "\n": "\n",
    "\r": "\r",
    "\t": "\t"
  };
  if (!(input[0] == '"')) return null;
  let i = 1;
  while (i <= input.length - 1) {
    if (i !== 0 && input[i] == '"') {
      return [str, input.slice(i + 1)];
    } else if (specialChars[input[i]]) {
      str = str + specialChars[input[i]];
      i++;
    } else if (input[i] !== '"' && input[i] !== "\\") {
      str = str + input[i];
      i = i + 1;
    } else {
      return [str, input.slice(i)];
    }
  }
};

//console.log(stringParser('"     "'));
const arrayParser = input => {
  // do not mutate input
  // work on a copy of input
  let str;
  // push the parsed values into this array
  let newArr = [];
  input = input.replace(/^\s+/, "");

  if (!(input[0] == "[")) return null;
  str = input.slice(1);

  while (str[0] !== "]") {
    if (str[0] !== ",") {
      str = str.replace(/^\s+/, "");
      let match = allParsers(str);
      if (!match) return null;
      else {
        newArr.push(match[0]);
        str = match[1];
      }
    } else if (str[0] == ",") {
      // remove ,
      // and send others to value parsers
      str = str.slice(1);
      str = str.replace(/^\s+/, "");

      if (str[0] == "]") return null;
    }
  }

  if (str[0] == "]") return [newArr, str.slice(1)];
};

const objectParser = input => {
  // remove initial space
  input = input.replace(/^\s+/, "");
  if (input[0] !== "{") return null;

  let newObj = {};

  let currentKey;
  let valueFound = false;

  //object key has to be parsed or not
  let keyShouldBeParsed = true;
  let colon = false;

  // remove { from string
  input = input.slice(1);
  // again remove all whitespaces
  input = input.replace(/^\s+/, "");

  while (input[0] !== "}") {
    if (keyShouldBeParsed) {
      let match = allParsers(input);
      if (!match) return null;
      else if (typeof match[0] !== "string") {
        throw new Error("Object keys must be strings");
      } else {
        currentKey = match[0];
        input = match[1];
        keyShouldBeParsed = false;
      }
    } else {
      // again remove whitespace
      //until , or a value is encountered
      input = input.replace(/^\s+/, "");
      if (!colon && input[0] == ":") {
        input = input.slice(1);
        colon = true;
      } else if (!colon && !input[0] == ":") {
        return null;
      } else if (colon && !valueFound) {
        //again check for white spaces
        input = input.replace(/^\s+/, "");
        //now it has to be parsed by all value parsers
        let match = allParsers(input);
        if (!match) {
          throw new Error("Wrong format. Insert a valid value");
        } else {
          newObj[currentKey] = match[0];
          //get remiaining string to be evaluated
          console.log(newObj)
          input = match[1];
          valueFound = true;
        }
      } else if (valueFound) {
        input = input.replace(/^\s+/, "");
        if (input[0] !== ",") {
          return null;
        } else {
          // there can't be } after ,

          input = input.slice(1);
          // this is for cases where there is space after
          //, like ,       }
          input = input.replace(/^\s+/, "");

          if (input[0] == "}") return null;
          colon = false;
          keyShouldBeParsed = true;
          valueFound = false;
        }
      }
    }
  }

  if (input[0] == "}") {
    return [newObj, input.slice(1)];
  }
};

const util = require("util");

// console.log(
//   util.inspect(
//     objectParser(
//       '{ "gid_1": 0, "gid_2": 0, "gid_3": 0 ,"get": {"1": true,"yu":[89, 789],"2":45,"kih": {"hours": false}}}'
//     ),
//     {
//       showHidden: false,
//       depth: null
//     }
//   )
// );

// console.log(
//   util.inspect(
//     arrayParser(
//       '[   89,   67,    56,     78,"\u8976",     "hello   ",[    90,  true,    false,  [89,90,67, 67]]] hello world'
//     ),
//     {
//       showHidden: false,
//       depth: null
//     }
//   )
// );

const start = path => {
  let fs = require("fs");
  var content;
  // First I want to read the file
  fs.readFile(path, function read(err, data) {
    if (err) {
      throw err;
    }
    content = data;
    let result = content.toString("utf8");
    let val = allParsers(result);
    console.log(val);
  });
};

start("./test/pass3.json");
