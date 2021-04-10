"use strict";
function makeCounter() {
    let count = 0;
    return function () {
        return ++count;
    };
}
const currentCounter = makeCounter();
console.log(currentCounter());
console.log(currentCounter());
console.log(currentCounter());
function makeCounter(startCounterValue) {
    let count = startCounterValue;
    return function () {
        return ++count;
    };
}
const currentCounter = makeCounter(-1);
console.log(currentCounter());
console.log(currentCounter());
console.log(currentCounter());
//# sourceMappingURL=ex5.js.map