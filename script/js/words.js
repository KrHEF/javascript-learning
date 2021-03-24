function reverseLettersInWords(str) {
    const result = ('' + str).split(' ').map((word) => {
        const noLetters = new Map(),
            letterCase = new Map();
        
        const reverseWord = word.split('').filter((char, index) => {
            if (!isLetter(char)) {
                noLetters.set(index, char);
                return false;
            }
            letterCase.set(index, isUpperCase(char) );
            return true;
        }).reverse().map((char, index) => {
            return letterCase.get(index) ? char.toUpperCase() : char.toLowerCase();
        });
        

        noLetters.forEach((char, index) => {
            reverseWord.splice(index, 0, char);
        });
        return reverseWord.join('');
    }).join(' ');
    return result;
}

function isLetter(char) {
    return char.toLowerCase() !== char.toUpperCase();
}

function isUpperCase(char) {
    return char.toLowerCase() !== char;
}



console.log(reverseLettersInWords('Abc def, ght.') === 'Cba fed, thg.');
console.log(reverseLettersInWords('Abc de,f ght.') === 'Cba fe,d thg.');
console.log(reverseLettersInWords('') === '');
