// function reverseLettersInWords(str) {
//     const  isLetter = (char) => char.toLowerCase() !== char.toUpperCase(),
//         isUpperCase = (char) => char.toLowerCase() !== char;
        
//     return ('' + str).split(' ').map((word) => {
//         const noLetters = new Map(),
//             letterCases = new Map();
        
//         const reverseWord = word.split('').filter((char, index) => !isLetter(char) ? noLetters.set(index, char) && false : letterCases.set(index, isUpperCase(char) ) || true).reverse().map((char, index) => letterCases.get(index) ? char.toUpperCase() : char.toLowerCase());
//         noLetters.forEach((char, index) => reverseWord.splice(index, 0, char));
        
//         return reverseWord.join('');
//     }).join(' ');
// }


function reverseLettersInWords(str, buffer = []) {
    return (str + '.').split('').reduce((result, char) => {
        if ( isLetter(char) || isNumber(char) ) {
            buffer.push(char);
        } else {
            result += buffer.slice().reduce( (res, char) => res + doSameCase( buffer.pop(), char), '') + char;
        }
        return result;
    }, '').slice(0, -1);
}

const  isLetter = (char) => char.toLowerCase() !== char.toUpperCase(),
    isNumber = (char) => Number.parseInt(char).toString() === char,
    isUpperCase = (char) => char.toLowerCase() !== char,
    doSameCase = (char, example) => isUpperCase(example) ? char.toUpperCase() : char.toLowerCase(); 



console.log(reverseLettersInWords('Abc def, ght.') === 'Cba fed, thg.');
console.log(reverseLettersInWords('Abc! de,f ght.') === 'Cba! ed,f thg.');
console.log(reverseLettersInWords('Abc! .!123 de,f ght.') === 'Cba! .!321 ed,f thg.');
console.log(reverseLettersInWords('Abc! .!123 de,f ght') === 'Cba! .!321 ed,f thg');
console.log(reverseLettersInWords('') === '');
