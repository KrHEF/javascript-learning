function solvePuzzle (clues) {
    if ( !Grid.validateSize(clues.length) ) { throw new Error('Wrong grid size'); }
    
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
    this._availableNumbers = new Set(Cell._numbers);
  }
  
  get Number() { 
    return this._number; 
  }
  set Number(number) { 
    this._number = (number > 0 && number <= Cell.NumberMax) ? number : 0; 
  }
  
  get HaveNumber() { 
    return !!this._number 
  }

  get AvailableNumbersCount() {
    return this._availableNumbers.size;
  }

  get AvailableNumber() {
    return (this._availableNumbers.size === 1) ? this._availableNumbers.values()[0] : 0;
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
    this._availableNumbers.delete(number);
  }
  
  toString() {
    return this.Number;
  }

}
  
class CellInGrid extends Cell {

  constructor(rowIndex, colIndex) {
    super();
    
    this._restrictions = {}
    this._rowIndex = rowIndex;
    this._colIndex = colIndex;
    this._curRowCells = [];
    this._curColCells = [];
  }

  get RowIndex() {
    return this._rowIndex;
  }

  get ColIndex() {
    return this._colIndex;
  }



}

class Grid {
  
  /**
   * Constructor
   * @param {number[]} clues 
   */
  constructor(clues) {
    this._clues = clues;
    this._size = Math.floor(clues.length / 4);
    this._restrictions = {};
    this._rows = [];
    this._cols = [];
    this._cells = [];
    this._availableCellForNumbers = [];
    this._failThread = false;

    this._init();
  }  

  get HasSolution() {
    return this._rows.every( (row) => row.every( (cell) => cell.HaveNumber) );
  }
  
  static validateSize(length) {
    return !(length % 4);
  }

  calculate() {
    this._findMaxNumberNearBorder();
    this._findNumberFromAvailable();
    this._findFullLine();
    this._findNumberFromAvailable();
  }

  _init() {
      this._setCluesObjectBySize();
      this._setEmptyCellsBySize();
      this._setAvailableCellsForNumbers();
  }

  _setCluesObjectBySize() {
    this._restrictions = {
      up:    this._clues.slice(0, this._size),
      right: this._clues.slice(this._size, this._size * 2),
      down:  this._clues.slice(this._size * 2, this._size * 3).reverse(),
      left:  this._clues.slice(this._size * 3, this._size * 4).reverse(),
    }
  }

  _setEmptyCellsBySize() {
    Cell.NumbersCount = this._size;

    for (let row = 0; row < this._size; row++) {
      this._rows[row] = [];
      for (let col = 0; col < this._size; col++) {
        const cell = new CellInGrid(row, col);
        this._rows[row][col] = cell
        this._cells.push(cell);
      }
    }

    this._cols = this._rows.map((row, rowIndex) => row.map((cell, colIndex) => this._rows[colIndex][rowIndex]));
  }

  _setAvailableCellsForNumbers() {
    for (let i = 1; i <= Cell.NumberMax; i++) {
      this._availableCellForNumbers[i] = new Set();
        this._rows.forEach( (row) => row.forEach( (cell) => this._availableCellForNumbers[i].add(cell) ) );
    }
  }

  /**
   * Поиск максимального числа около границы
   * (когда в подсказке стоит 1)
   */
  _findMaxNumberNearBorder() {
    const findMaxNumber = (clue, rowIndex, colIndex) => {
      if (clue === 1) {
        this._setNumberToCellByIndexes(Cell.NumberMax, rowIndex, colIndex);
      }
    }
    
    this._restrictions.up.forEach( (clue, index) => findMaxNumber(clue, 0, index));
    this._restrictions.right.forEach( (clue, index) => findMaxNumber(clue, index, -1));
    this._restrictions.down.forEach( (clue, index) => findMaxNumber(clue, -1, index));
    this._restrictions.left.forEach( (clue, index) => findMaxNumber(clue, index, 0));
  }

  /**
   * Поиска полного ряда чисел
   * (когда в подсказке стоит максимальное число )
   */
  _findFullLine() {
    const findMaxClue = (clue, line) => {
      if (clue === Cell.NumberMax) {
        line.forEach( (cell, index) => this._setNumberToCell(index + 1, cell));
      }
    }
    
    this._restrictions.up.forEach( (clue, index)    => findMaxClue(clue, this._cols[index]));
    this._restrictions.right.forEach( (clue, index) => findMaxClue(clue, this._rows[index]));
    this._restrictions.down.forEach( (clue, index)  => findMaxClue(clue, this._cols[index]));
    this._restrictions.left.forEach( (clue, index)  => findMaxClue(clue, this._rows[index]));
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
          this._setNumberToCellByIndexes(number, rowIndex, colIndex);
        }
      } ));

      // Проверка на 1 доступное место под число
      this._availableCellForNumbers.forEach( (availableCells, number) => {
        if (availableCells.size === 0) { return false; }
        if (availableCells.size === 1) {
          availableCells.forEach( (cell) => {
            findNumber = true;
            this._setNumberToCellByIndexes(number, cell.RowIndex, cell.ColIndex);
          });
        }
      });

    }       
  }

  _setNumberToCellByIndexes(number, rowIndex, colIndex) {
    rowIndex = (rowIndex < 0) ? Cell.NumbersCount + rowIndex : rowIndex;
    colIndex = (colIndex < 0) ? Cell.NumbersCount + colIndex : colIndex;

    const cell = this._rows[rowIndex][colIndex];

    return this._setNumberToCell(number, cell);
  }

  _setNumberToCell(number, cell) {
    if (cell.Number) {
      return (cell.Number === number);
    }
     
    cell.Number = number;
    this._availableCellForNumbers[number].delete(cell);
    
    this._removeAvailableNumberFromRow(cell.RowIndex, number)
    this._removeAvailableNumberFromColumn(cell.ColIndex, number)

    return true;
  }
  
  _removeAvailableNumberFromRow(index, number) {
    const row = this._rows[index];
    row.forEach( (cell) => {
      cell.removeAvailableNumber(number);
      this._availableCellForNumbers[number].delete(cell);
    });
  }

  _removeAvailableNumberFromColumn(index, number) {
    const col = this._cols[index];
    col.forEach( (cell) => {
      cell.removeAvailableNumber(number);
      this._availableCellForNumbers[number].delete(cell);
    });
  }

  _stopThread() {

  }

  _rollback() {

  }

  toString() { 
    return this._rows.map( (row) => row.map( (cell) => cell.toString() ) ); 
  }

}


const clues = [2, 2, 1, 3,
// const clues = [2, 2, 1, 4,
        2, 2, 3, 1,
        1, 2, 2, 3,
        3, 2, 1, 3];
const expected = [[1, 3, 4, 2],
           [4, 2, 1, 3],
           [3, 4, 2, 1],
           [2, 1, 3, 4]];
const actual = solvePuzzle(clues);
console.log(actual);
