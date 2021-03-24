function reverseLettersInWords(str) {
    const  isLetter = (char) => char.toLowerCase() !== char.toUpperCase(),
        isUpperCase = (char) => char.toLowerCase() !== char;
        
    return ('' + str).split(' ').map((word) => {
        const noLetters = new Map(),
            letterCases = new Map();
        
        const reverseWord = word.split('').filter((char, index) => !isLetter(char) ? noLetters.set(index, char) && false : letterCases.set(index, isUpperCase(char) ) || true).reverse().map((char, index) => letterCases.get(index) ? char.toUpperCase() : char.toLowerCase());
        noLetters.forEach((char, index) => reverseWord.splice(index, 0, char));
        
        return reverseWord.join('');
    }).join(' ');
}



console.log(reverseLettersInWords('Abc def, ght.') === 'Cba fed, thg.');
console.log(reverseLettersInWords('Abc! de,f ght.') === 'Cba! fe,d thg.');
console.log(reverseLettersInWords('Abc! .!123 de,f ght.') === 'Cba! .!123 fe,d thg.');
console.log(reverseLettersInWords('') === '');
