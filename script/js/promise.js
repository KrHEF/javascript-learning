"use strict";
init();
async function init() {
    let a = await waitPromise()
        .catch((reason) => {
        console.log(1, reason);
        return 5;
    });
    console.log('a = ', a);
}
async function waitPromise() {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            reject(15);
        }, 1e3);
    }).then(null, (reason) => {
        console.log('then reason', reason);
        throw 'error2';
    });
}
//# sourceMappingURL=promise.js.map