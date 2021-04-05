/*
Представленный ниже код работает некорректно - он всегда возвращает одно и то же значение. Необходимо пояснить почему и предложить возможные решения данной проблемы.
let defaultObj = { type: 'Employee' };
getUser(type: string) {
	let obj = defaultObj;
	obj.branch = 'Pskov';
	return type === 'Manager' ? obj : defaultObj;
}
*/

/*
Комментарий:
Тут внутри функции создается синоним объекта let obj = defaultObj;
И выходит, что при добавлении новых параметров они будут меняться синхронно.
Нашел такой способ, но он будет работать в случае простого объекта
*/

let defaultObj = { type: "Employee" };
function getUser(type: string) {
  let obj: any = { ...defaultObj };
  obj.branch = "Pskov";
  return type === "Manager" ? obj : defaultObj;
}


/************************ Доп задание *****************************
                        Проставить типы                           */

interface CompanyData {
    type: string;
    branch?: string;
}
let defaultObj = { type: "Employee" };
function getUser(type: string) {
  let obj: CompanyData = { ...defaultObj };
  obj.branch = "Pskov";
  return type === "Manager" ? obj : defaultObj;
}
