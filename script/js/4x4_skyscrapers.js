function solvePuzzle (clues) {
    if ( !Grid.validateSize(clues.length) ) { 
      console.error("Wrong grid size!");
      return []; 
    }
    
    const grid = new Grid(clues);
    grid.calculate();

    if ( !grid.HaveSolution ) {
      let bruteForce = new BruteForce(grid);
      bruteForce.start();
    }
    
    if ( !grid.HaveSolution ) {
      console.error("Решение не найдено, выведено промежуточное решение:");
      console.log(grid);
    }

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

  static get NumberMin() {
    return 1;
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
    
    this._restriction = {}
    this._colIndex = colIndex;
    this._rowIndex = rowIndex;
    this._colCells = [];
    this._rowCells = [];
  }

  get RowIndex() {
    return this._rowIndex;
  }

  get ColIndex() {
    return this._colIndex;
  }

  get ColCells() {
    return this._colCells;
  }

  get RowCells() {
    return this._rowCells;
  }  

  /**
   * Установка соседей по строкам и колонкам
   * @param {[[]]} rows Массив строк
   * @param {[[]]} cols Массив колонок
   */
  setSiblings(rows, cols) {
    this._colCells = cols[this._colIndex];
    this._rowCells = rows[this._rowIndex];
  }
}

class RestrictionCell {
  
  constructor(number, rowStartIndex, rowEndIndex, colStartIndex, colEndIndex) {
    this._number = number;
    this._rowStartIndex = rowStartIndex;
    this._rowEndIndex = rowEndIndex;
    this._colStartIndex = colStartIndex;
    this._colEndIndex = colEndIndex;
  }

  get Number() {
    return this._number;
  }

  get RowStartIndex() {
    return this._rowStartIndex;
  }
  get RowEndIndex() {
    return this._rowEndIndex;
  }
  
  get ColStartIndex() {
    return this._colStartIndex;
  }
  get ColEndIndex() {
    return this._colEndIndex;
  }

  get isRow() {
    return this._rowStartIndex === this._rowEndIndex;
  }

  get isColumn() {
    return this._colStartIndex === this._colEndIndex;
  }

}
class Restriction {

  constructor(clues, size) {
    this._cols = [ [] ];
    this._rows = [ [] ];
    this._clues = [];

    this._init(clues, size)
  }

  get Clues() {
    return this._clues;
  }

  checkRestrictionByCell(cell) {
    return this._checkRestriction(cell.ColCells)
        && this._checkRestriction(cell.RowCells);
  }

  checkColRestriction(cells) {
    return this._checkRestriction(cells);
  }

  checkRowRestriction(cells) {
    return this._checkRestriction(cells);
  }

  toString() { 
    return this._clues.map( (cell) => cell.toString() ); 
  }

  _init(clues, size) {
    const up = clues.slice(0, size),
          right = clues.slice(size, size * 2),
          down = clues.slice(size * 2, size * 3).reverse(),
          left = clues.slice(size * 3, size * 4).reverse();
    this._cols = [up, down];
    this._rows = [left, right];

    this._clues = clues.map( (clue, index) => {
      let rowIndex0 = 0, rowIndex1 = 0, colIndex0 = 0, colIndex1 = 0;
      
      if (index < size) {
        rowIndex0 = 0;
        rowIndex1 = size - 1;
        colIndex0 = colIndex1 = index;
      } else if (index < size * 2) {
        colIndex0 = size - 1;
        colIndex1 = 0;
        rowIndex0 = rowIndex1 = index % size;
      } else if (index < size * 3) {
        rowIndex0 = size - 1;
        rowIndex1 = 0;
        colIndex0 = colIndex1 = size - index % size - 1;
      } else if (index < size * 4) {
        colIndex0 = 0;
        colIndex1 = size - 1;
        rowIndex0 = rowIndex1 = size - index % size - 1;
      } else {
        console.error("Превышен лимит Ограничений");
      }

      const cell = new RestrictionCell(clue, rowIndex0, rowIndex1, colIndex0, colIndex1);
      return cell;
    } );
    
  }

  _checkRestriction(cells) {
    let result0 = 1,
        result1 = 1;

    for (let i0 = 0; i0 < cells.length; i0++) {
      if (!cells[i0].Number) { return true; }

      const i1 = cells.length - i0;
      const number0 = (!i0) ? 0 : cells[i0-1].Number,
            number1 = (!i0) ? 0 : cells[i1].Number;
      if ( number0 < cells[i0].Number) { result0++ }
      if ( number1 < cells[i1-1].Number) { result1++ }
    }
    
    let limit0 = 0,
        limit1 = 0, //this._clues[cells[cells.length - 1].RowIndex][cells[cells.length - 1].ColIndex].Number;
        restriction = [];

    if (cells[0].RowIndex === cells[cells.length - 1].RowIndex) {
      limit0 = this._rows[0].Number;
      limit1 = this._rows[1].Number;
    } else if (cells[0].ColIndex === cells[cells.length - 1].ColIndex) {
      limit0 = this._cols[0].Number;
      limit1 = this._cols[1].Number;
    }
    return ( !limit0 || number0 === limit0 ) && ( !limit1 || number1 === limit1 );
  }

}

class Grid {
  
  /**
   * Constructor
   * @param {number[]} clues 
   */
  constructor(clues) {
    this._size = Math.floor(clues.length / 4);
    this._restriction = new Restriction(clues, this._size);
    this._rows = [ [] ];
    this._cols = [ [] ];
    this._cells = [];
    this._availableCellForNumbers = [];
    this._failThread = false;

    this._init();
  }  

  get HaveSolution() {
    return this._rows.every( (row) => row.every( (cell) => cell.HaveNumber) );
  }
  
  static validateSize(length) {
    return !(length % 4);
  }
  
  calculate() {
    this._findNumbersByRestriction();
    this._findNumberFromAvailable();
  }

  copy() {
    // let gridCopy = {};
    // Object.assign(gridCopy, this);
    // return (gridCopy);
  }

  toString() { 
    return this._rows.map( (row) => row.map( (cell) => cell.toString() ) ); 
  }

  _init() {
    Cell.NumbersCount = this._size;
    this._createEmptyCells();
    this._createDependencies();
  }

  _createEmptyCells() {
    for (let row = 0; row < this._size; row++) {
      for (let col = 0; col < this._size; col++) {
        this._cells.push( new CellInGrid(row, col) );
      }
    }
  }

  /**
   * Метод создаёт массивы:
   * - строк
   * - колонок
   * - ссылку на соседей по строкам и колонкам
   * - доступных ячеек для каждой цифры
   */
  _createDependencies() {
    this._cells.forEach( (cell) => {

      if ( !this._rows[cell.RowIndex] ) {
        this._rows[cell.RowIndex] = [];
      }
      this._rows[cell.RowIndex][cell.ColIndex] = cell;
      
      if ( !this._cols[cell.ColIndex] ) {
        this._cols[cell.ColIndex] = [];
      }
      this._cols[cell.ColIndex][cell.RowIndex] = cell;
      
      cell.setSiblings(this._rows, this._cols);

      for (let i = Cell.NumberMin; i <= Cell.NumberMax; i++) {
        if ( !this._availableCellForNumbers[i] ) {
          this._availableCellForNumbers[i] = new Set();
        }
        this._availableCellForNumbers[i].add(cell);
      }
    });
  }

  /**
   * Поиск чисел по ограничениям
   */
  _findNumbersByRestriction() {
    this._restriction.Clues.forEach( (clue) => {
      if (clue.Number === 1) {
        this._setNumberToCellByIndexes(Cell.NumberMax, clue.RowStartIndex, clue.ColStartIndex);
      }
      if (clue.Number === Cell.NumberMax) {
        let line = [];
        if (clue.isRow) {
          line = this._rows[clue.RowStartIndex];
        } else if (clue.isColumn) {
          line = this._cols[clue.ColStartIndex];
        } else {
          console.error("Ошибка получения строк и колонок!");
        }
        if ( clue.ColStartIndex > clue.ColEndIndex || clue.RowStartIndex > clue.RowEndIndex ) {
          line.reverse();
        }

        line.forEach( (cell, index) => this._setNumberToCell(Cell.NumberMin + index, cell));
      }
    });
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

    const result = this._restriction.checkRestrictionByCell(cell);
    console.log(`[${cell.RowIndex}, ${cell.ColIndex}] <= ${number} : ${result}`);
    return result;
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

  _startBruteForce() {
    // let cells = this._cells.filter( (cell) => !cell.HaveNumber );
    // cells.sort( (a , b) => a.AvailableNumbersCount - b.AvailableNumbersCount );

  }

}

class BruteForce {

  constructor( grid ) {
    this._grid = grid;
    this._gridCopy = grid.copy();
    console.log(this._gridCopy);
  }

  start() {
    
    
  }

  _stopThread() {

  }

  _commit() {

  }

  _rollback() {

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
