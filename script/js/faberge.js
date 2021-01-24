'use strict';

function height(n,m) {
    if (n > m) { n = m; }
    if (n <= 0 ) { return 0; }
    if ((m < 2) || (n === 1)) { return m; }
    if (n === m) { return (new BigNumber(2)).pow(n).minus(1); }
    if (n === 2) { return sum2(m); }

    console.time('Total');
    console.time('koef');
    const { koef1, koef2, sum1 } = getKoef(n, m);
    console.timeEnd('koef');
    // console.log(`(n,m) = (${n},${m}), koef1 = ${koef1.toString()}, koef2 = ${koef2.toString()}, sum1 = ${sum1.toString()}`);
    // return 0;
    
    console.time('sumK1');
    const resK1 = sumK1(koef1);
    console.timeEnd('sumK1');

    console.time('sumK2');
    const resK2 = sumK2(koef2);
    console.timeEnd('sumK2');

    const result = sum1.plus( resK1 ).plus( resK2 );
    console.log(`(n,m) = (${n},${m}), result = ${result.toString()}`);
    console.timeEnd('Total');
    return result;
}

let resultsSum2 = [new BigNumber(0)];
function sum2(m) {
  if (m < resultsSum2.length) { return resultsSum2[m] }

  for (let i = resultsSum2.length; i <= m; i++) {
    resultsSum2[i] = resultsSum2[i - 1].plus(i);
  }

  return resultsSum2[m];
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
  const size = Math.max(m - n, n - 2),
        koef = ( new Array(size) ).fill( new BigNumber(1) ),
        sum  = ( new Array(size) ).fill( new BigNumber(0) );
  let sum1 = 0,
      koef1 = ( new Array(m - n) ), 
      koef2 = ( new Array(n - 2) );


  const count1 = n - 3,
        count2 = m - n - 1;

  for (let i = 0; i <= Math.max(count1, count2); i++) {
    if (i === count1) { 
      koef1 = koef.slice(0, koef1.length);
    } 
    if (i === count2) {
      koef2 = koef.slice(0, koef2.length);
      sum1 = sum[koef2.length - 1];
    }
    for (let j = 0; j < koef.length; j++) {
      koef[j] = !j ? koef[j] : koef[j].plus(koef[j - 1]);
      sum[j] = !j ? sum[j].plus(1) : sum[j].plus(sum[j - 1]).plus(1);
    }
  }

  // console.time('koef');
  // for (let i = 4; i <= n; i++) {
  //   for (let j = 1; j < koef1.length; j++) {
  //     koef1[j] = koef1[j].plus(koef1[j - 1]);
  //   }
  // }
  // console.timeEnd('koef');

  // console.time('koef2');
  // for (let i = n + 2; i <= m; i++) {
  //   for (let j = 0; j < koef2.length; j++) {
  //     koef2[j] = !j ? koef2[j] : koef2[j].plus(koef2[j - 1]);
  //     sum1[j] = !j ? sum1[j].plus(1) : sum1[j].plus(sum1[j - 1]).plus(1);
  //   }
  // }
  // console.timeEnd('koef2');

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
// height(500,500).toString();
// height(237,500).toString();
// height(477,500).toString();

//16.7 s
height(477,10000).toString();

// height(4477,10000).toString();
// height(9477,10000).toString();
