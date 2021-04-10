"use strict";
function sortArray(arr, limit) {
    const finishArray = [];
    arr.forEach((item, index, array) => {
        if (item.length === limit) {
            finishArray.push(item);
        }
    });
    return finishArray;
}
const testArr = ["qqqq", "wwwww", "rrrr", "ttttt"];
console.log(sortArray(testArr, 4));
function sortArray(arr, limit) {
    let finishArray = arr.filter(item => item.length === limit);
    return finishArray;
}
const testArr = ["qqqq", "wwwww", "rrrr", "ttttt"];
console.log(sortArray(testArr, 4));
function sortArray(arr, limit) {
    return arr.filter(item => item.length === limit);
}
//# sourceMappingURL=ex3.js.map