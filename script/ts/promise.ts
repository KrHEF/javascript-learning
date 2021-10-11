init();

async function init() {
    let a = await waitPromise();
    console.log(a);
}


async function waitPromise(): Promise<number> {
    return new Promise<number>(
        (resolve, reject) => {
            setTimeout(() => {
                resolve(15);
            }, 1e3);
        }
    ).then(
        (result) => {
            console.log('result', result);
            throw 16;
        },
        // (reason) => {
        //     console.log('then reason', reason);
        //     throw 'error2';
        // }
    ).catch((reason) => {
        console.log('catch reason', reason);
        if (reason === 'error') {
            return new Promise<number>(
                (resolve2) => {
                    setTimeout(() => {
                        resolve2(20);
                        console.log('code after resolve');;
                    }, 1e3);
                }
            );
        }

        return Promise.resolve(21);
    });
}
