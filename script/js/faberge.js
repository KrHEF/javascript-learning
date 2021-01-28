'use strict';

function height(n,m) {
    if (n > m) { n = m; }
    if (n <= 0 ) { return 0; }
    if ((m < 2) || (n === 1)) { return m; }
    if (n === m) { return (new BigNumber(2)).pow(n).minus(1); }
    if (n === 2) { return sum2(m); }

    console.time('Total');
    const { koef1, koef2, sum1 } = getKoef(n, m);
    console.log(`(n,m) = (${n},${m}), koef1 = ${koef1.toString()}, koef2 = ${koef2.toString()}, sum1 = ${sum1.toString()}`);
    
    console.time('sum');
    const sumResult = sumK1(koef1).plus( sumK2(koef2) );
    console.timeEnd('sum');

    const result = sum1.plus(sumResult);
    console.log(`(n,m) = (${n},${m}), result = ${result.toString()}`);
    console.timeEnd('Total');
    return result;
}

function sum2(n) {
  return (new BigNumber(n)).pow(2).plus(n).div(2);
}

function  sumK1(koef) {
  let result = new BigNumber(0);
  
  for (let i = 0; i < koef.length; i++) {
    const k = koef[i].times( sum2(koef.length + 2 - i) ); 
    result = result.plus(k);
  }

  return result;
}

function  sumK2(koef) {
  let result = new BigNumber(0),
      two = new BigNumber(2);

  for (let i = 0; i < koef.length; i++) {
    const k = koef[i].times( two.pow( i + 3) ) ; 
    result = result.plus(k);
  }

  return result;
}

function getKoef(n, m) {
  const koef1 = ( new Array(m - n) ).fill( new BigNumber(1) ), 
        koef2 = ( new Array(n - 2) ).fill( new BigNumber(1) );
  let sum1 = 0;  

  console.time('koef1');
  for (let i = 4; i <= n; i++) {
    for (let j = 1; j < koef1.length; j++) {
      koef1[j] = koef1[j].plus(koef1[j - 1]);
    }
  }
  console.timeEnd('koef1');

  console.time('koef2');
  for (let i = n + 2; i <= m; i++) {
    for (let j = 1; j < koef2.length; j++) {
      koef2[j] = koef2[j].plus(koef2[j - 1]);
    }
  }
  console.timeEnd('koef2');
 
  sum1 = koef1.reduce( (sum, k) => sum.plus(k) ).minus(1);

  return { koef1, koef2: koef2.reverse(), sum1 };
}


height(3,5).toString();
height(5,8).toString();
height(5,9).toString();
height(6,5).toString();
height(7,5).toString();
height(2,14).toString();
height(7,20).toString();
height(7,500).toString();
height(500,500).toString();
height(237,500).toString();
height(477,500).toString();

//16.7 s
//6.77 s
height(477,10000).toString();

height(4477,10000).toString();
height(9477,10000).toString();
