init();

async function init() {
    let a = await waitPromise()
    .catch((reason) => {
        console.log(1, reason);
        return 5;
    });

    console.log('a = ', a);
}


async function waitPromise(): Promise<number> {
    return new Promise<number>(
        (resolve, reject) => {
            setTimeout(() => {
                resolve(15);
                // reject(15);
            }, 1e3);
        }
    ).then(
        (value) => {
            console.log('then reason', value);
            throw 'error';
        },
        (reason) => {
            console.log('then reason', reason);
            throw 'error';
        }
    ).catch((reason) => {
        console.log('catch reason', reason);
        if (reason === 'error') {
            return new Promise<number>(
                (resolve2, reject2) => {
                    setTimeout(() => {
                        // resolve2(20);
                        reject2(23);
                        console.log('code after resolve');;
                    }, 1e3);
                }
            );
        }

        return Promise.resolve(-1);
    });
}
