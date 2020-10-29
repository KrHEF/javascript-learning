'use strict'

let funcs: object[] = [];


{
    let f = function(str: string): void {
        console.log(str);
    };
    addFunctionMeta(f);
}


function addFunctionMeta(f: object): void {
    funcs.push(f);
}

(function showFunctions(): void {
    console.log(123);
    
    let codeWrapper: HTMLElement =  document.getElementById('code-wrapper');
    funcs.forEach( (f: object) => {
        let nodeDList = new HTMLDListElement();
        let name = ''
        if ( 'name' in f ) {
            // name = f.name;
            name = 'name';
        }
        nodeDList.textContent = `<dl><dt>${name}</dt><dd>${f}</dd>`;
        codeWrapper.appendChild(nodeDList);
    
    });   
})();

//showFunctions();




