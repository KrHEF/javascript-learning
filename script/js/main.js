'use strict';
var funcs = [];
{
    var f = function (str) {
        console.log(str);
    };
    addFunctionMeta(f);
}
function addFunctionMeta(f) {
    funcs.push(f);
}
(function showFunctions() {
    console.log(123);
    var codeWrapper = document.getElementById('code-wrapper');
    funcs.forEach(function (f) {
        var nodeDList = new HTMLDListElement();
        var name = '';
        if ('name' in f) {
            // name = f.name;
            name = 'name';
        }
        nodeDList.textContent = "<dl><dt>" + name + "</dt><dd>" + f + "</dd>";
        codeWrapper.appendChild(nodeDList);
    });
})();
//# sourceMappingURL=main.js.map