function checkIP(ipAddress) {
    if (typeof(ipAddress) !== 'string'
        || ipAddress.split('.').length != 4) { return false; }

    return ipAddress === ipAddress.split('.').map(parsePartIP).join('.');
}

function parsePartIP(part) {
    const result = Number.parseInt(part);
    return (result >= 0 && result <= 255) ? result : 1;
}

console.log( true === checkIP('0.0.0.0') );
console.log( false === checkIP('01.0.0.0') );
console.log( false === checkIP('0.0.0.00') );
console.log( false === checkIP('192.012.0.0') );
console.log( false === checkIP(true) );
console.log( false === checkIP([192, 168, 0, 12]) );
console.log( false === checkIP({ip: '192.168.0.125'}) );
console.log( false === checkIP(1234567890) );
console.log( true === checkIP('192.168.0.168') );
console.log( true === checkIP('255.255.255.255') );
console.log( false === checkIP('192.168.0.266') );
console.log( false === checkIP('192.168..26') );
console.log( false === checkIP('192.168.192') );
console.log( false === checkIP('192.168.0.0.15') );
console.log( false === checkIP('0192.68.0.15') );
console.log( false === checkIP('-1.0.2.-1') );
console.log( false === checkIP('1.0.2.2-1') );
