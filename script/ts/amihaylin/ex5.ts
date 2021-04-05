/*
Функция makeCounter создает простой счетчик. Однако сейчас он возвращает одно и то же значение 0. Почему и как это исправить?
function makeCounter() {
   return function () {
       let count = 0;
       return count++;
   }
}
*/

function makeCounter() {
    let count = 0;
    return function () {
        return ++count;
    }
 }
 const currentCounter = makeCounter();
 console.log(currentCounter());
 console.log(currentCounter());
 console.log(currentCounter());

/*
Комментарий: 
По задаче 5: изначально в return постфиксное присвоение, поэтому всегда возвращаются нули. Меняем return count++ на return ++count, возвращаются единицы. Затем переносим начальное присваивание на уровень выше, как я понял, здесь используется каррирование
*/


// Задача 5 с произвольным начальным значением счетчика
function makeCounter(startCounterValue) {
    let count = startCounterValue;
    return function () {       
        return ++count;
    }
 }
 const currentCounter = makeCounter(-1);
 console.log(currentCounter());
 console.log(currentCounter());
 console.log(currentCounter());
 