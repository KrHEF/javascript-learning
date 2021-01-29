'use strict';

// let result = [];

function height(n,m) {
    if (n <= 0 ) { return 0; }
    if ((m < 2) || (n === 1)) { return m; }
    if (n >= m) { return (new BigNumber(2)).pow(m).minus(1); }
    if (n === 2) { return sum2(m); }

    BigNumber.config({ DECIMAL_PLACES: 0 });

    console.time('Total');
    const { koef1, koef2, sum1 } = getKoef(n, m);
    // console.log(`(n,m) = (${n},${m}), koef1 = ${koef1.toString()}, koef2 = ${koef2.toString()}, sum1 = ${sum1.toString()}`);
    
    const sumResult = sumK1(koef1).plus( sumK2(koef2) );

    const result = sumResult.plus(sum1).minus(1);
    console.timeEnd('Total');
    console.log(`(n,m) = (${n},${m}), result = ${result.toString()}`);
    console.log('======================');
    return result;
}

function sum2(n) {
  return (new BigNumber(n)).pow(2).plus(n).div(2);
}

function  sumK1(koef) {
  let result = new BigNumber(0);
  
  for (let i = koef.length - 1, j = 2, sum2 = 3; i >= 0; i--, j++) {
    sum2 += j + 1; 
    result = result.plus( koef[i].times(sum2) );
  }

  return result;
}

function  sumK2(koef) {
  let result = new BigNumber(0);

  for (let i = 0, pow2 = new BigNumber(4); i < koef.length; i++) {
    pow2 = pow2.times(2);
    result = result.plus( koef[i].times(pow2) );
  }

  return result;
}

function getKoef(n, m) {
  const size = Math.max(m - n, n - 2),
        count1 = n - 4,       // for (let i = 4; i <= n; i++) {...}
        count2 = m - n - 2,   // for (let i = n + 2; i <= m; i++) {...}
        countMin = (count1 < count2) ? count1 : count2,
        countMax = (count1 < count2) ? count2 : count1;

  let sum1 = 0,
      koef = ( new Array(size) ).fill( new BigNumber(1) ),
      koef1 = new Array(m - n), 
      koef2 = new Array(n - 2);
  
  console.time('koef');

  for (let i = 0; i <= countMin; i++) {
    for (let j = 1; j < koef.length; j++) {
      koef[j] = koef[j].plus(koef[j - 1]);
    }
  }

  koef1 = koef.slice(0, koef1.length);
  koef2 = koef.slice(0, koef2.length);

  koef = (count1 < count2) ? koef2 : koef1;

  for (let i = countMin + 1; i <= countMax; i++) {
    for (let j = 1; j < koef.length; j++) {
      koef[j] = koef[j].plus(koef[j - 1]);
    }
  }

  console.timeEnd('koef');

  sum1 = BigNumber.sum(...koef1);
  // sum1 = koef1.reduce( (sum, k) => sum.plus(k) );

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

//16.7s
//6.77s
//6.87s 4.90s
height(477,10000).toString();

//91.9s
//80.0s 62.5s
height(4477,10000).toString();

//12.3s 11.0 s
height(9477,10000).toString();
