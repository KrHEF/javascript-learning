function checkIP_Fishov(ipAddress) {
    if (typeof(ipAddress) !== 'string'
        || ipAddress.split('.').length != 4) { return false; }

    return ipAddress === ipAddress.split('.').map(parsePartIP).join('.');
}

function parsePartIP(part) {
    const result = Number.parseInt(part);
    return (result >= 0 && result <= 255) ? result : 1;
}

// // Максим Молчанов
function checkIP_Molchanov(ip) {
    return ip.split('.').reduce((a, b) => {
      const c = Number(b);
      return a += (Math.abs(c) + '' === b && c <= 255) ? 1 : '';
    }, 0) === 4;
}

function checkIP_Fishov2(ip) {
    const matches = ('.' + ip).match(/(\.(25[0-5]|2[0-4][0-9]|1[0-9]{2}|[1-9][0-9]|[0-9])){4}/i);
    return !!matches && (ip === matches[0].slice(1));
}

// Артём Гоголь
function ipV4Validator(str) {
    str = str.trim();
    let result = true;
    const notSepArr = str.split('');
    const arr = str.split('.');
    if (str.length < 7 || str.length > 15) {result = false;}
    notSepArr.forEach(item => {
        if (item === ' ') {result = false};
    })
    if (arr.length !== 4) {result = false;}
    if (+arr[3] === 0) {result = false;}
    arr.forEach(item => {
        if (item.length > 3 || item.length === 0) {result = false;}
    });
    arr.map(item => +item).forEach(item => {
        if (isNaN(item) || item < 0 || item > 255) {result = false;}
    });
    return result;
}

// Руслан
function testIp(str) {
    if (typeof str !== 'string') {
        return false;
    }
    var bytes = str.split('.').map(function (str) {
        if (str.length > 3) {
            return -1;
        }
        return parseInt(str, 10);
    });
    if (!checkFirstNotZero(bytes[0])) {
        return false;
    }
    if (bytes.length !== 4) {
        return false;
    }
    return bytes.reduce(function (acc, num) {
        if (Math.trunc(num) !== num) {
            return false;
        }
        return acc && checkRange(num);
    }, true);
    function checkFirstNotZero(num) {
        return num === 0 ? false : true;
    }
    function checkRange(num) {
        return num >= 0 && num <= 255;
    }
}

// function 

const checkIP = (ip) => checkIP_Molchanov(ip);
// const checkIP = (ip) => checkIP_Fishov(ip);
// const checkIP = (ip) => checkIP_Fishov2(ip);
// const checkIP = (ip) => ipV4Validator(ip);
// const checkIP = (ip) => testIp(ip);

console.log(1, false === checkIP('') );
try { console.log(2, false === checkIP({}) ); } catch { console.warn('Не проверяет object!'); }
try {console.log(3, false === checkIP() ); } catch { console.warn('Не проверяет undefined!'); }
try {console.log(4, false === checkIP(null) ); } catch { console.warn('Не проверяет null!'); }
try {console.log(5, false === checkIP([]) ); } catch { console.warn('Не проверяет array!'); }
console.log(6, true === checkIP('0.0.0.0') );
console.log(7, false === checkIP('01.0.0.0') );
console.log(8, false === checkIP('0.0.0.00') );
console.log(9, false === checkIP('192.012.0.0') );
try {console.log(10, false === checkIP(true) ); } catch { console.warn('Не проверяет boolean!'); }
try {console.log(11, false === checkIP([192, 168, 0, 12]) ); } catch { console.warn('Не проверяет array!'); }
try {console.log(12, false === checkIP({ip: '192.168.0.125'}) ); } catch { console.warn('Не проверяет object!'); }
try {console.log(13, false === checkIP(1234567890) ); } catch { console.warn('Не проверяет number!'); }
console.log(14, true === checkIP('192.168.0.168') );
console.log(15, true === checkIP('255.255.255.255') );
console.log(16, false === checkIP('192.168.0.266') );
console.log(17, false === checkIP('192.168..26') );
console.log(18, false === checkIP('192.168.192') );
console.log(19, false === checkIP('192.168.0.0.15') );
console.log(20, false === checkIP('0192.68.0.15') );
console.log(21, false === checkIP('-1.0.2.-1') );
console.log(22, false === checkIP('1.0.2.2-1') );
console.log(23, false === checkIP('192.168.-1.0.15') );
console.log(24, false === checkIP('192.168.256.0.15') );
console.log(25, false === checkIP('1.-192.999.168.256.0.15') );
console.log(26, true === checkIP('192.46.0.4') );
console.log(27, false === checkIP('.192.46.0.4') );
console.log(28, false === checkIP('192.46.0.4.') );
console.log(29, false === checkIP('AAA.BBB.CCC.DDD'));
console.log(30, false === checkIP('000.000.000.000'));
