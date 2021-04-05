/*
Необходимо написать метод, который принимает массив строк (arr: string[])и число (limit: number). Данный метод должен пройтись по массиву arr и ввернуть массив строк, длина которых равна значению переменной limit.
*/


/************************ 1 вариант *******************************/

function sortArray(arr: string[], limit: number): string[] {
    const finishArray: string[] = [];
    arr.forEach((item, index, array) => {
      if (item.length === limit) {
        finishArray.push(item);
      }
    });
    return finishArray;
  }
  const testArr: string[] = ["qqqq", "wwwww", "rrrr", "ttttt"];
  console.log(sortArray(testArr, 4));


/************************ 2 вариант *******************************
                    после подсказки про filter                    */
function sortArray(arr: string[], limit: number): string[] {
  let finishArray: string[] = arr.filter(item => item.length === limit);
  return finishArray;
}
const testArr: string[] = ["qqqq", "wwwww", "rrrr", "ttttt"];
console.log(sortArray(testArr, 4));


/************************ 3 вариант *******************************
    после рекомендации не использовать лишнюю переменную          */

function sortArray(arr: string[], limit: number): string[] {
    return arr.filter(item => item.length === limit);
  }
