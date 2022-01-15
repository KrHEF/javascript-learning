"use strict";
let lang = {
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
let testingCount = 1e8, searchString = "игруля";
function test1() {
    let date = Date.now(), i = 0, result = "";
    while (i < testingCount) {
        result = lang["ru"] || lang["en"] || "";
        result.indexOf(searchString) !== -1;
        i++;
    }
    date = Date.now() - date;
    console.log(`Результат test1: ${testingCount} р. за ${date / 1e3} сек.`);
}
function test4() {
    let date = Date.now(), i = 0, result = "";
    while (i < testingCount) {
        result = (lang["ru"] || "") + "||" + (lang["en"] || "");
        result.indexOf(searchString) !== -1;
        i++;
    }
    date = Date.now() - date;
    console.log(`Результат test4: ${testingCount} р. за ${date / 1e3} сек.`);
}
function test5() {
    let date = Date.now(), i = 0, result = "";
    while (i < testingCount) {
        result = lang["ru"] ? lang["ru"] : lang["en"] ? lang["en"] : "";
        result.indexOf(searchString) !== -1;
        i++;
    }
    date = Date.now() - date;
    console.log(`Результат test5: ${testingCount} р. за ${date / 1e3} сек.`);
}
function test2() {
    let date = Date.now(), i = 0;
    while (i < testingCount) {
        _.some(lang, (name) => name.indexOf(searchString) !== -1);
        i++;
    }
    date = Date.now() - date;
    console.log(`Результат test2: ${testingCount} р. за ${date / 1e3} сек.`);
}
function test3() {
    let date = Date.now(), i = 0;
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
