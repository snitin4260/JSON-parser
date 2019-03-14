const stringParser = input => {
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

console.log(stringParser('"     "'));
