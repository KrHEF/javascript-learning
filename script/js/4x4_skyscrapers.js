function solvePuzzle (clues) {
    if (!Grid.validate(clues.length)) { throw new Error('Wrong grid'); }
    
    const grid = new Grid(clues);
    grid.calculate();
    console.log(grid);
  //   console.log( grid.HaveSolution );
  //   console.log( Cell._numbers );
    
    return grid.toString();
  }
  
  
  class Cell {
    // static _numbers;
    
    constructor() {
      this._number = 0;
      this._numbersAvailable = new Set(Cell._numbers);
    }
    
    get Number() { return this._number; }
    set Number(number) { 
      this._number = (number > 0 && number <= Cell.NumberMax) ? number : 0; 
    }
    
    get HaveNumber() { 
      return !!this._number 
    }

    get AvailableNumbersCount() {
      return this._numbersAvailable.size;
    }

    get AvailableNumber() {
      return (this._numbersAvailable.size === 1) ? this._numbersAvailable.values()[0] : 0;
    }
  
    static get NumberMax() { 
      return Cell._numbers[Cell._numbers.length - 1]; 
    }
  
    static get NumbersCount() {
      return Cell._numbers.length;
    }
    static set NumbersCount(number) { 
      Cell._numbers = [];
      for (let i = 1; i <= number; i++) {
        Cell._numbers.push(i); 
      } 
      Cell._numbers.sort(); 
    }
  
    removeAvailableNumber(number) {
      this._numbersAvailable.delete(number);
    }
    
    toString() {
      return this.Number;
    }
  
  }
  
  class Grid {
    
    constructor(clues) {
      this._size = Math.floor(clues.length / 4);
      this._clues = Grid._getCluesObjectBySize(clues, this._size);
      this._rows = Grid._getEmptyCellsBySize(this._size);
      this._cols = Grid._getTransposeGrid(this._rows);

      this._numbersAvailableInCells = [];
      for (let i = 1; i <= Cell.NumberMax; i++) {
        this._numbersAvailableInCells[i] = new Set();
          this._rows.forEach( (row) => row.forEach( (cell) => this._numbersAvailableInCells[i].add(cell) ) );
      }
    }  
  
    get HaveSolution() {
      return this._rows.every( (row) => row.every( (cell) => cell.HaveNumber) );
    }
    
    static validate(length) {
      return !(length % 4);
    }
  
    static _getCluesObjectBySize(clues, size) {
      return  {
        up: clues.slice(0, size),
        right: clues.slice(size, size * 2),
        down: clues.slice(size * 2, size * 3).reverse(),
        left: clues.slice(size * 3, size * 4).reverse(),
      }
    }
  
    static _getEmptyCellsBySize(size) {
      Cell.NumbersCount = size;
  
      const cells = [];
      for (let row = 0; row < size; row++) {
        cells[row] = [];
        for (let col = 0; col < size; col++) {
          cells[row][col] = new Cell();
        }
        
      }
          
      return cells;
    }
    
    static _getTransposeGrid(rows) { 
      return rows.map((row, rowIndex) => row.map((cell, colIndex) => rows[colIndex][rowIndex]));
    };
    
    calculate() {
      this._findMaxNumberNearBorder();
      this._findNumberFromAvailable();
    }
    
    _findMaxNumberNearBorder() {
      const findMaxNumber = (clue, rowIndex, colIndex) => {
        if (clue === 1) {
          this._setNumberToCell(Cell.NumberMax, rowIndex, colIndex);
        }
      }
      
      this._clues.up.forEach( (clue, index) => findMaxNumber(clue, 0, index));
      this._clues.right.forEach( (clue, index) => findMaxNumber(clue, index, -1));
      this._clues.down.forEach( (clue, index) => findMaxNumber(clue, -1, index));
      this._clues.left.forEach( (clue, index) => findMaxNumber(clue, index, 0));
    }

    _findNumberFromAvailable() {
      // let rowIndex = -1,
          // colIndex = -1;
        let findNumber = true;

      while (findNumber) {
        findNumber = false;

        // Проверка на 1 доступное число
        this._rows.forEach( (row, rowIndex) => row.forEach( (cell) => {
          const number = cell.AvailableNumber;
          if (number) {
            findNumber = true;
            this._setNumberToCell(number, rowIndex, colIndex);
          }
        } ));

        // Проверка на 1 доступное место под число
        this._numbersAvailableInCells.forEach( (numberCells, number) => {
          // if (numberCells.size === 0)
          if (numberCells.size === 1) {
            // findNumber = true;
            // const cell = numberCells.values()[0];
            // this._setNumberToCell(number, rowIndex, colIndex);
          }
        });

      }       
    }
  
    _setNumberToCell(number, rowIndex, colIndex) {
      rowIndex = (rowIndex < 0) ? Cell.NumbersCount + rowIndex : rowIndex;
      colIndex = (colIndex < 0) ? Cell.NumbersCount + colIndex : colIndex;
  
      const cell = this._rows[rowIndex][colIndex];
      cell.Number = number;
      this._numbersAvailableInCells[number].delete(cell);
      
      this._removeAvailableNumberFromRow(rowIndex, number)
      this._removeAvailableNumberFromColumn(colIndex, number)
    }
    
    _removeAvailableNumberFromRow(index, number) {
      const row = this._rows[index];
      row.forEach( (cell) => {
        cell.removeAvailableNumber(number);
        this._numbersAvailableInCells[number].delete(cell);
      });
    }

    _removeAvailableNumberFromColumn(index, number) {
      const col = this._cols[index];
      col.forEach( (cell) => {
        cell.removeAvailableNumber(number);
        this._numbersAvailableInCells[number].delete(cell);
      });
    }

    toString() { 
      return this._rows.map( (row) => row.map( (cell) => cell.toString() ) ); 
    }
  
  }


const clues = [2, 2, 1, 3,
        2, 2, 3, 1,
        1, 2, 2, 3,
        3, 2, 1, 3];
const expected = [[1, 3, 4, 2],
           [4, 2, 1, 3],
           [3, 4, 2, 1],
           [2, 1, 3, 4]];
const actual = solvePuzzle(clues);
