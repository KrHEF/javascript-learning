init();

async function init(): Promise<number> {
    let a;
    try {
        a = await waitPromise()
    } catch(reason) {
        console.log('catch', reason);
        return 5;
    }
        // .catch((reason) => {
        //     console.log(1, reason);
        //     return 5;
        // });
    console.log('a = ', a);
    return a;
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
            throw 'error3';
        });
    // ).catch((reason) => {
    //     console.log('catch reason', reason);
    //     if (reason === 'error') {
    //         return new Promise<number>(
    //             (resolve2) => {
    //                 setTimeout(() => {
    //                     resolve2(20);
    //                     console.log('code after resolve');;
    //                 }, 1e3);
    //             }
    //         );
    //     }

        // return Promise.resolve(-1);
    // });
}
