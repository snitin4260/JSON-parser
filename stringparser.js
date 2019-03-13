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
  str = str + '"';
  let i = 1;
  while (i <= input.length - 1) {
    if (i !== 0 && input[i] == '"') {
      str = str + '"';
      return [str, input.slice(i + 1)];
    } else if (specialChars[input[i]]) {
      str = str + specialChars[input[i]];
      i++;
      // } else if (input[i + 1] == "u") {
      //   str = str + "\\u";
      //   let k = i + 2;

      //   for (let j = 0; j < 4; j++) {
      //     // 97-122 65-90 48-57
      //     if (
      //       (input[k + j] >= 97 && input[k + j] <= 122) ||
      //       (input[k + j] >= 65 && input[k + j] <= 90) ||
      //       (input[k + j] >= 48 && input[k + j] <= 57)
      //     ) {
      //       str = str + String(input[k + j]);
      //     } else {
      //       return [str, input.slice(k + j)];
      //     }
      //   }
    } else if (input[i] !== '"' && input[i] !== "\\") {
      str = str + input[i];
      i = i + 1;
    } else {
      return [str, input.slice(i)];
    }
  }
  return [str, ""];
};

console.log(stringParser('"hello\n"goood'));
