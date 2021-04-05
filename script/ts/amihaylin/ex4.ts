/*
Ниже представлен метод, возвращающий либо имя, либо фамилию 3-х пользователей. Необходимо модифицировать данный метод для поддержки ещё 5-и пользователей. ib и возвращаемые значения заполнить по аналогии с имеющимися. Конечная реализация должна быть максимально оптимизирована для удобства чтения.
getUser(id: number, type: string): string {
	if (id === 101) {
		if (type === 'first') {
			return 'FirstName1';
		} else {
			return 'LastName1';
		}
	} else if (id === 102) {
		if (type === 'first') {
			return 'FirstName2';
		} else {
			return 'LastName2';
		}
	} else(id === 103) {
		if (type === 'first') {
			return 'FirstName3';
		} else {
			return 'LastName3';
		}
	}
}
*/

/************************ 1 вариант *******************************/

function getUser(id: number, typeFamily: "first" | "last"): string {
    switch (typeFamily) {
        case "first":
        return "FirstName" + id;
        case "last":
        return  "LastName" + id;
        default:
        return  "Bad typeFamily";
    }
}
console.log(getUser(135, "last"));

/************************ 2 вариант *******************************
                         после разъяснения                        */

enum NameType {
  first = "firstName",
  last = "lastName"
}
const USERS = [
  {
    id: 101,
    [NameType.first]: "Tester1",
    [NameType.last]: "A"
  },
  {
    id: 102,
    [NameType.first]: "Tester2",
    [NameType.last]: "B"
  },
  {
   id: 103,
    [NameType.first]: "Tester3",
    [NameType.last]: "C"
  },
  {
   id: 104,
    [NameType.first]: "Tester4",
    [NameType.last]: "D"
  },
  {
   id: 105,
    [NameType.first]: "Tester5",
    [NameType.last]: "E"
  },
  {
   id: 106,
    [NameType.first]: "Tester6",
    [NameType.last]: "F"
  },
  {
   id: 107,
    [NameType.first]: "Tester7",
    [NameType.last]: "G"
  },
  {
  id: 108,
   [NameType.first]: "Tester8",
   [NameType.last]: "H"
  }  
];
const getUserNameById = (userId: number, type: NameType) =>
  USERS.find(({id}) => (id === userId))?.[type];

console.log(getUserNameById(103, NameType.first));



/************************ 3 вариант *******************************
            попросил соптимизировать для удобства чтения          */

//              ¯\_(ツ)_/¯
