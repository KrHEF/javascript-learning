"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
init();
function init() {
    return __awaiter(this, void 0, void 0, function* () {
        let a = yield waitPromise()
            .catch((reason) => {
            console.log(1, reason);
            return 5;
        });
        console.log('a = ', a);
    });
}
function waitPromise() {
    return __awaiter(this, void 0, void 0, function* () {
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                reject(15);
            }, 1e3);
        }).then(null, (reason) => {
            console.log('then reason', reason);
            throw 'error2';
        });
    });
}
//# sourceMappingURL=promise.js.map