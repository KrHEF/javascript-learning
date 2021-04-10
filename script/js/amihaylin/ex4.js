"use strict";
function getUser(id, typeFamily) {
    switch (typeFamily) {
        case "first":
            return "FirstName" + id;
        case "last":
            return "LastName" + id;
        default:
            return "Bad typeFamily";
    }
}
console.log(getUser(135, "last"));
var NameType;
(function (NameType) {
    NameType["first"] = "firstName";
    NameType["last"] = "lastName";
})(NameType || (NameType = {}));
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
const getUserNameById = (userId, type) => { var _a; return (_a = USERS.find(({ id }) => (id === userId))) === null || _a === void 0 ? void 0 : _a[type]; };
console.log(getUserNameById(103, NameType.first));
//# sourceMappingURL=ex4.js.map