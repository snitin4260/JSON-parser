const nullParser = input => {
  if (!input.startsWith("null")) return null;
  return [null, input.slice(4)];
};

const boolParser = input => {
  if (!(input.startsWith("true") || input.startsWith("false"))) return null;
  if (input[0] == "t") return [true, input.slice(4)];
  return [false, input.slice(5)];
};
``;
//console.log(boolParser("true178"))

const numberParser = input => {
  let regex = /^-?(0|([1-9][0-9]*))(\.[0-9]+)?([E][+-]?[0-9]+)?/i;
  let strInput = String(input);
  if (!regex.test(input)) return null;
  else {
    let match = regex.exec(input);
    return [Number(match[0]), strInput.slice(match[0].length)];
  }
};

//console.log(numberParser(-908));

const stringParser = input => {
  //need to add unicode part(DONE)
  //have to check whether these are optional
  //like "" is valid
  // add ending "
  let regex = / ^"(\\["\\\/bfnrt]|u[a-fA-F0-9]{4}|[^"\\])*"$/;
};

const arrayParser = input => {
  input = input.replace(/\s/g, "");
  let newArr = [];
  if (!input[0] == "[") return null;
  let i = 1;
  while (i < input.length) {

  }
};


//numberParser(0.78e45);
