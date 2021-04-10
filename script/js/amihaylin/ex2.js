"use strict";
let defaultObj = { type: "Employee" };
function getUser(type) {
    let obj = { ...defaultObj };
    obj.branch = "Pskov";
    return type === "Manager" ? obj : defaultObj;
}
let defaultObj = { type: "Employee" };
function getUser(type) {
    let obj = { ...defaultObj };
    obj.branch = "Pskov";
    return type === "Manager" ? obj : defaultObj;
}
//# sourceMappingURL=ex2.js.map