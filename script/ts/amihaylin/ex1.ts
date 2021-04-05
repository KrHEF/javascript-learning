/*
Любая попытка выполнить данный метод приводит к ошибке. Необходимо это исправить.
createArray(limit: number): number[] {
	let arr: number[];
	for (let i = 0; i < limit; i++) {
		arr[i] = i * 10;
	}
	return arr;
}
*/

function createArray(limit: number): number[] {
    let arr: number[] = [];
    for (let i: number = 0; i < limit; i++) {
        arr.push(i * 10);
    }
    return arr;
}
console.log(createArray(10));
