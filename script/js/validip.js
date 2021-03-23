// function checkIP(ipAddress) {
//     if (typeof(ipAddress) !== 'string'
//         || ipAddress.split('.').length != 4) { return false; }

//     return ipAddress === ipAddress.split('.').map(parsePartIP).join('.');
// }

// function parsePartIP(part) {
//     const result = Number.parseInt(part);
//     return (result >= 0 && result <= 255) ? result : 1;
// }

// // Максим Молчанов
function checkIP_Molchanov(ip) {
    return ip.split('.').reduce((a, b) => {
      const c = Number(b);
      return a += (Math.abs(c) + '' === b && c <= 255) ? 1 : '';
    }, 0) === 4;
}

function checkIP_Fishov(ip) {
    const matches = ('.' + ip).match(/(\.(25[0-5]|2[0-4][0-9]|1[0-9]{2}|[1-9][0-9]|[0-9])){4}/i);
    return !!matches && (ip === matches[0].slice(1));
}

const checkIP = (ip) => checkIP_Molchanov(ip);

console.log( false === checkIP('') );
try { console.log( false === checkIP({}) ); } catch { console.warn('Не проверяет object!'); }
try {console.log( false === checkIP() ); } catch { console.warn('Не проверяет undefined!'); }
try {console.log( false === checkIP(null) ); } catch { console.warn('Не проверяет null!'); }
try {console.log( false === checkIP([]) ); } catch { console.warn('Не проверяет array!'); }
console.log( true === checkIP('0.0.0.0') );
console.log( false === checkIP('01.0.0.0') );
console.log( false === checkIP('0.0.0.00') );
console.log( false === checkIP('192.012.0.0') );
try {console.log( false === checkIP(true) ); } catch { console.warn('Не проверяет boolean!'); }
try {console.log( false === checkIP([192, 168, 0, 12]) ); } catch { console.warn('Не проверяет array!'); }
try {console.log( false === checkIP({ip: '192.168.0.125'}) ); } catch { console.warn('Не проверяет object!'); }
try {console.log( false === checkIP(1234567890) ); } catch { console.warn('Не проверяет number!'); }
console.log( true === checkIP('192.168.0.168') );
console.log( true === checkIP('255.255.255.255') );
console.log( false === checkIP('192.168.0.266') );
console.log( false === checkIP('192.168..26') );
console.log( false === checkIP('192.168.192') );
console.log( false === checkIP('192.168.0.0.15') );
console.log( false === checkIP('0192.68.0.15') );
console.log( false === checkIP('-1.0.2.-1') );
console.log( false === checkIP('1.0.2.2-1') );
console.log( false === checkIP('192.168.-1.0.15') );
console.log( false === checkIP('192.168.256.0.15') );
console.log( false === checkIP('1.-192.999.168.256.0.15') );
console.log( true === checkIP('192.46.0.4') );
console.log( false === checkIP('.192.46.0.4') );
console.log( false === checkIP('192.46.0.4.') );
