'use strict';

// let result = [];

function height(n,m) {
    // if (n <= 0 ) { return 0; }
    // if ((m < 2) || (n === 1)) { return m; }3
    // if (n >= m) { return sumDiagonal(m); }
    // if (n === 2) { return sum2(m); }


    console.time('Total');
    // const result = faberge(n, m);
    const fab = new Faberge(n, m);
    const result = fab.getSolution();
    console.timeEnd('Total');
    console.log(`(n,m) = (${n},${m}), count: ${fab.Count}, result = ${result.toString()}`);
    console.log(`=========================================`);
    return result;
}

class Faberge {
  
  constructor(n, m) {
    BigNumber.config({ DECIMAL_PLACES: 0 });
    this._n = (n > m) ? m : n;
    this._m = m;
    this._solution = 0;
    this._count = 0;
  }

  get Count() { return this._count; }

  getSolution() {
    if ( this._checkSimpleSolutions() ) { return this._solution; }
    const mode = this._getMode();   // 0 - недалеко от диагонали // 1 - до середины (m-2/2) // 2 - за серединой
    switch (mode) {
      case 1: return this._getSolution1();
      case 2: return this._getSolution2();
      case 3: return this._getSolution3();
      default: return 0;
    }
  }

  _getMode() {
    if (this._m - this._n + 2 < this._n) { return 1; }
    if (this._n <= (this._m - 2 / 2) ) { return 2; }
    return 3;
  }

  _getSolution1() {
    let result = [],
        prev,
        prevJ,
        countStage1 = this._m - this._n + 2,
        countStage2 = this._n,
        countStage3 = this._m,
        countDiagonal = 3;

    for (let i = 2; i <= countStage1; i++) {
      result[1] = new BigNumber(i);
      for (let j = 2; j < i; j++) {
        prev = prevJ;
        prevJ = result[j];
        result[j] = result[j].plus(prev).plus(1);
        this._count++;
      }
      result[i] = this._sumDiagonal(i);
      prevJ = result[1];
    }

    for (let i = countStage1 + 1; i <= countStage2; i++) {
      prevJ = result[countDiagonal - 1];
      for (let j = countDiagonal; j < i; j++) {
        prev = prevJ;
        prevJ = result[j];
        result[j] = result[j].plus(prev).plus(1);
        this._count++;
      }
      countDiagonal++;
      result[i] = this._sumDiagonal(i);
    }

    for (let i = countStage2 + 1; i <= countStage3; i++) {
      prevJ = result[countDiagonal - 1];
      for (let j = countDiagonal; j <= this._n; j++) {
        prev = prevJ;
        prevJ = result[j];
        result[j] = result[j].plus(prev).plus(1);
        this._count++;
      }
       countDiagonal++;
    }
  
    return result[result.length - 1];
  }

  _getSolution2() {
    this._count = -1;
    return 0;
  }

  _getSolution3() {
    // this._count = -1;
    // return 0;

    let result = [],
        prev,
        prevJ,
        countStage1 = this._n,
        countStage2 = this._m - this._n + 2,
        countStage3 = this._m,
        countDiagonal = 3;

    for (let i = 2; i <= countStage1; i++) {
      result[1] = new BigNumber(i);
      for (let j = 2; j < i; j++) {
        prev = prevJ;
        prevJ = result[j];
        result[j] = result[j].plus(prev).plus(1);
        this._count++;
      }
      result[i] = sumDiagonal(i);
      prevJ = result[1];
    }

    for (let i = countStage1 + 1; i <= countStage2; i++) {
      prevJ = result[1];
      result[1] = new BigNumber(i);
      for (let j = 2; j <= this._n; j++) {
        prev = prevJ;
        prevJ = result[j];
        result[j] = result[j].plus(prev).plus(1);
        this._count++;
      }
    }

    for (let i = countStage2 + 1; i <= countStage3; i++) {
      prevJ = result[countDiagonal - 1];
      for (let j = countDiagonal; j <= this._n; j++) {
        prev = prevJ;
        prevJ = result[j];
        result[j] = result[j].plus(prev).plus(1);
        this._count++;
      }
       countDiagonal++;
    }
  
    return result[result.length - 1];  
  }

  _checkSimpleSolutions() {
    let result = false;
    if (this._n <= 0 ) { 
      result = true;
      this._solution = 0; 
    } else if ((this._m < 2) || (this._n === 1)) { 
      result = true;      
      this._solution = this._m;
    } else if (this._n === 2) { 
      result = true;
      this._solution = this._sum2(this._m); 
    } else if (this._m - this._n <= 2) {
      result = true;
      switch (this._m - this._n) {
        case 0:
          this._solution = this._sumDiagonal(this._m);
          break;
        case 1:
          this._solution = this._sumDiagonal_1(this._m);
          break;
        case 2:
          this._solution = this._sumDiagonal_2(this._m);
          break;
      }
    } else if ((this._m % 2 === 1) && (this._n === (this._m - 1) / 2)) {
      result = true;
      this._solution = this._sumHalfDiagonal(this._m);
    }
    return result;
  }

  _sum2(m) {
    return (new BigNumber(m)).pow(2).plus(m).div(2);
  }
  
  _sumDiagonal(m) {
    return (new BigNumber(2)).pow(m).minus(1);
  }
  
  _sumDiagonal_1(m) {
    return this._sumDiagonal(m).minus(1);
  }
  
  _sumDiagonal_2(m) {
    return this._sumDiagonal_1(m).minus(m);
  }

  _sumHalfDiagonal(m) {
    return this._sumDiagonal_2(m).plus(m).div(2);
  }
}


height(-1,20).toString(); // 0
height(0,21).toString();  // 0
height(1,10).toString();  // 10
height(12,1).toString();  // 1
height(2,20).toString();  // 210
height(4,9).toString();   // 255
height(8,10).toString();  // 1012
height(10,11).toString(); // 2046
height(12,12).toString(); // 4095

height(3,5).toString();   // 25
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
