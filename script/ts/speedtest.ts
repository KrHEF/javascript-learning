declare let _: any;

interface IIndexingString {
    [key: string]: string;
}

let lang: IIndexingString = {
"en": "Scarab Temple: Hold and Win",
"ru": "Какая-то игруля",
"id": "Scarab Temple",
"de": "Scarab Temple",
"es": "Scarab Temple",
"nl": "Scarab Temple",
"fr": "Scarab Temple",
"it": "Scarab Temple",
"no": "Scarab Temple",
"pt": "Scarab Temple",
"fi": "Scarab Temple",
"sv": "Scarab Temple",
"vi": "Scarab Temple",
"tr": "Scarab Temple",
"th": "อาณาจักรแมลงทับ-ลัคกี้",
"zh": "圣甲虫王朝-集鸿运",
"ja": "Scarab Temple",
"zh-hant": "聖甲蟲王朝-集鴻運",
"ko": "Scarab Temple",
};

let testingCount = 1e8,
    searchString = "игруля";    // sec

// Результат test1: 50000000 р. за 0.246 сек.
// Результат test1: 5000000000 р. за 41.743 сек.
function test1 (): void {
    let date = Date.now(),
        i = 0,
        result = "";
    while (i < testingCount) {
        result = lang["ru"] || lang["en"] || "";
        result.indexOf(searchString) !== -1;
        i++;
    } 
    date = Date.now() - date;
    console.log(`Результат test1: ${testingCount} р. за ${date / 1e3} сек.`);
}

// Результат test4: 50000000 р. за 0.075 сек.
// Результат test4: 5000000000 р. за 6.005 сек.
function test4 (): void {
    let date = Date.now(),
        i = 0,
        result = "";
    while (i < testingCount) {
            result = ( lang["ru"] || "" ) + "||" + ( lang["en"] || "" );
        result.indexOf(searchString) !== -1;
        i++;
    } 
    date = Date.now() - date;
    console.log(`Результат test4: ${testingCount} р. за ${date / 1e3} сек.`);
}

// Результат test5: 50000000 р. за 0.349 сек.
// Результат test5: 5000000000 р. за 44.005 сек.
function test5 (): void {
    let date = Date.now(),
        i = 0,
        result = "";
    while (i < testingCount) {
        result = lang["ru"] ? lang["ru"] : lang["en"] ? lang["en"] : "";
        result.indexOf(searchString) !== -1;
        i++;
    } 
    date = Date.now() - date;
    console.log(`Результат test5: ${testingCount} р. за ${date / 1e3} сек.`);
}

// Результат test2: 50000000 р. за 13.815 сек.
// Результат test2: 50000000 р. за 14.784 сек.
function test2 (): void {
    let date = Date.now(),
        i = 0;
    while (i < testingCount) {
        _.some(lang, (name:string) => name.indexOf(searchString) !== -1);
        i++;
    } 
    date = Date.now() - date;
    console.log(`Результат test2: ${testingCount} р. за ${date / 1e3} сек.`);
}

// Результат test3: 50000000 р. за 92.936 сек.
// Результат test3: 50000000 р. за 115.227 сек.
function test3 (): void {
    let date = Date.now(),
        i = 0;
    while (i < testingCount) {
        let result = _.values(lang).join();
        result.indexOf(searchString) !== -1;
        i++;
    } 
    date = Date.now() - date;
    console.log(`Результат test3: ${testingCount} р. за ${date / 1e3} сек.`);
}

test1();
test4();
test5();
//test2();
//test3();
//.then( (result: string) => { console.log(result); });
//(() => test2());//.then(() => test3());
