function solvePuzzle (clues) {
  if ( !Grid.validateSize(clues.length) ) { throw new Error("Wrong grid size!"); }

  const grid = new Grid(clues);
  grid.calculate();

  return (grid.HasSolution || grid.bruteForce()) ? grid.Result : [];
}

class Skyscraper {
  // static _levels: number[];
  
  constructor(level = Skyscraper.NO_LEVEL, levels = Skyscraper._levels) {
    this._level = level;
    this._availableLevels = new Set(levels);
  }

  static get NO_LEVEL() { return 0; }
  static get MinLevel() { return this._levels[0]; }
  static get MaxLevel() { return this._levels[this._levels.length - 1]; }
  static get Levels() { return this._levels }
  static set Levels(size) {
      this._levels = [];
      for (let level = 1; level <= size; level++) {
        this._levels.push(level); 
      } 
      this._levels.sort();   
  }
  
  get Level() { return this._level; }
  get HasLevel() { return !!this._level; }
  get AvailableLevels() { return Array.from(this._availableLevels); }
  get AvailableLevelsCount() { return this._availableLevels.size; }

  static clone(skyscraper) {
    return new Skyscraper(skyscraper._level, skyscraper._availableLevels);
  }

  setLevel(level) {
    if (this.HasLevel) { return this._level === level; }

    if (level >= Skyscraper.MinLevel && level <= Skyscraper.MaxLevel) {
      this._level = level;
      this._availableLevels.clear();
      return true;
    }

    return false;
  }

  hasAvailableLevel(level) {
    return this._availableLevels.has(level);
  }

  removeAvailableLevel(level) {
    this._availableLevels.delete(level);
  }
}
  
class Cell {

  constructor(colIndex, rowIndex) {
    this._skyscraper = new Skyscraper();
    this._colIndex = colIndex;
    this._rowIndex = rowIndex;
    this._siblingCells = [];
  }

  get Skyscraper() { return this._skyscraper; }
  set Skyscraper(value) { this._skyscraper = value; }
  get RowIndex() { return this._rowIndex; }
  get ColIndex() { return this._colIndex; }
  get HasSolution() { return this._skyscraper.HasLevel; }
  get BackupObject() { return { _skyscraper: Skyscraper.clone(this._skyscraper) }; }
  set BackupObject(obj) { 
    if (!obj['_skyscraper']) { throw new Error("Rollback error"); }
    this._skyscraper = obj['_skyscraper']; 
  }

  static create(size) {
    Skyscraper.Levels = size;

    const cells = [];
    for (let row = 0; row < size; row++)
      for (let col = 0; col < size; col++)
        cells.push( new Cell(col, row) );
        
    return cells;
  }


  setLevel(level) {
    if ( this._skyscraper.setLevel(level) ) {
      this._removeAvailableLevelForSibling(level);
      return true;
    }
    return false;
  }

  setSiblings(allCells) {
    this._siblingCells = allCells.filter( (cell) => {
      return (cell !== this) && (cell.ColIndex === this.ColIndex || cell.RowIndex === this.RowIndex) 
    });
  }

  removeAvailableLevel(level) {
    this.Skyscraper.removeAvailableLevel(level);
  }

  _removeAvailableLevelForSibling(level) {
    this._siblingCells.forEach( (cell) => cell.removeAvailableLevel(level) );
  }

}

class Restriction {

  constructor(visibleCount, sortCells) {
    this._count = visibleCount;
    this._cells = sortCells;
    this._isChecked = false;
  }

  get VisibleCount() { return this._count; }
  get Cells() { return this._cells; }
  get BackupObject() { return { _isChecked: this._isChecked }; }
  set BackupObject(obj) { this._isChecked = !!obj['_isChecked']; }

  static getParams(index, size) {
    let cellsIndex,
        isRow,
        isReverse;

    if (index < size) {
      cellsIndex = index;
      isRow = false;
      isReverse = false;
    } else if (index < 2 * size) {
      cellsIndex = index % size;
      isRow = true;
      isReverse = true;
    } else if (index < 3 * size) {
      cellsIndex = size - index % size - 1;
      isRow = false;
      isReverse = true;
    } else if (index < 4 * size) {
      cellsIndex = size - index % size - 1;
      isRow = true;
      isReverse = false;
    } else {
      throw new Error("Overflow restrictions");
    }

    return { cellsIndex,isRow, isReverse };
  }

  canCheck() {
    return this._cells.every( (cell) => cell.Skyscraper.HasLevel );
  }

  check() {
    if (this._isChecked) { return true; }

    let result = 1;
    this._cells.reduce( (prevCell, cell) => {
      if ( prevCell.Skyscraper.Level < cell.Skyscraper.Level) { 
        result++;
        return cell;
      } else {
        return prevCell;
      }
    });

    this._isChecked = (this._count === result);
    return this._isChecked;
  }
}

class Grid {
  
  constructor(clues = []) {
    this._size  = Math.floor(clues.length / 4);
    this._rows  = [ [] ];
    this._cols  = [ [] ];

    this._bruteForceStack = [];
    this.debugBruteForceCounter = 0; 

    this._cells = Cell.create(this._size);
    this._setReferences();
    this._restrictions = this._createRestrictions(clues);
  }  

  get HasSolution() {
    return this._cells.every( (cell) => cell.HasSolution && this._checkRestrictions(cell) );
  }

  get Result() { 
    return this._rows.map( (row) => row.map( (cell) => cell.Skyscraper.Level ) ); 
  }

  get EmptyCells() {
    return this._cells.filter( (cell) => !cell.Skyscraper.HasLevel )
                      .sort( (cellA, cellB) => cellA.Skyscraper.AvailableLevelsCount 
                                             - cellB.Skyscraper.AvailableLevelsCount );
  }

  get NextCell() {
    return this.EmptyCells[0];
  }


  static validateSize(length) {
    return !(length % 4);
  }
  
  calculate() {
    this._calculateByRestrictions();
    this._calculateFromAvailable();
  }

  bruteForce(){
    const cell = this.NextCell;
    if (!cell) { return false; }

    const levels = cell.Skyscraper.AvailableLevels.slice();
    for (const level of  levels) {
      this._backup();

      if ( cell.setLevel(level) && this._checkRestrictions(cell) ) {
        this._calculateFromAvailable();
        if (this.HasSolution) { return true; }
        if (this.bruteForce()) { return true; }
      } 
      
      this._rollback();
    }
    
    return false;
  }

  _setReferences() {
    this._cells.forEach( (cell, index, cells) => {
      if ( !this._rows[cell.RowIndex] ) { this._rows[cell.RowIndex] = []; }
      if ( !this._cols[cell.ColIndex] ) { this._cols[cell.ColIndex] = []; }
      this._rows[cell.RowIndex][cell.ColIndex] = cell;
      this._cols[cell.ColIndex][cell.RowIndex] = cell;

      cell.setSiblings(cells);
    });
  }

  _createRestrictions(clues) {
    const restrictions = [];
    
    clues.forEach( (clue, index) => {
      if (!clue) { return; }  // Clue can be zero

      let {cellsIndex, isRow, isReverse} = Restriction.getParams(index, this._size),
          cells = [];

      cells = (isRow) ? this._rows[cellsIndex] : this._cols[cellsIndex];
      restrictions[index] = new Restriction(clue, isReverse ? cells.slice().reverse() : cells);
    });

    return restrictions;
  }

  _getRestrictionsIds(cell) {
    return [cell.ColIndex,
            cell.RowIndex + this._size,
            3 * this._size - 1 - cell.ColIndex,
            4 * this._size - 1 - cell.RowIndex];
  }

  _checkRestrictions(cell) {
    const indexes = this._getRestrictionsIds(cell);
    return indexes.every( (index) => {
        const restriction = this._restrictions[index];
        return !restriction || !restriction.canCheck() || restriction.check();
    });
  }

  _calculateByRestrictions() {
    this._setCellAndFilterRestrictions();
    this._restrictions.forEach( (restriction) => { 
      this._removeAvailableLevelsByRestriction(restriction);
    });

  }
  
  _setCellAndFilterRestrictions() {
    this._restrictions = this._restrictions.filter( (restriction) => {
      switch (restriction.VisibleCount) {
        case Skyscraper.MinLevel:
          restriction.Cells[0].setLevel(Skyscraper.MaxLevel);
          return false;
        case Skyscraper.MaxLevel:
          restriction.Cells.forEach( (cell, index) => cell.setLevel(Skyscraper.MinLevel + index) );
          return false;
        case Skyscraper.MinLevel + 1: // Удалить у 2-го числа в ряду из доступных {макс. число - 1}
          restriction.Cells[1].removeAvailableLevel(Skyscraper.MaxLevel - 1);
          return true;
        default:
          return true;
      }
    });
  }

  _removeAvailableLevelsByRestriction(restriction) {
    const clue = restriction.VisibleCount;
    for (let level = Skyscraper.MaxLevel - (clue - 2); level <= Skyscraper.MaxLevel; level++) {
      for (let index = 0; index <= (clue - 2) - (Skyscraper.MaxLevel - level); index++) {
        restriction.Cells[index].removeAvailableLevel(level);
      }
    }
  }

  _calculateFromAvailable() {
    let findLevel = true;

    while (findLevel) {
      findLevel = false;

      // Проверка на 1 доступное число в ячейке среди доступных
      this._cells.forEach( (cell) => {
        if (cell.Skyscraper.AvailableLevelsCount === 1) {
          const level = cell.Skyscraper.AvailableLevels[0];
          findLevel = true;
          cell.setLevel(level);
        }
      });

      // Проверка на 1 доступное число в строке
      this._rows.forEach( (row) => {
        for (let level = Skyscraper.MinLevel; level <= Skyscraper.MaxLevel; level++ ) {
          const cells = row.filter( (cell) => cell.Skyscraper.hasAvailableLevel(level) );
          if (cells.length === 1) {
            findLevel = true;
            cells[0].setLevel(level);
          }
        }
      });

      // Проверка на 1 доступное число в колонке
      this._cols.forEach( (column) => {
        for (let level = Skyscraper.MinLevel; level <= Skyscraper.MaxLevel; level++ ) {
          const cells = column.filter( (cell) => cell.Skyscraper.hasAvailableLevel(level) );
          if (cells.length === 1) {
            findLevel = true;
            cells[0].setLevel(level);
          }
        }
      });
    }       
  }
  
  _backup() {
    this.debugBruteForceCounter++;
    const map = new Map();
    this.EmptyCells.forEach( (cell) => map.set(cell, cell.BackupObject) );
    this._restrictions.forEach( (restriction) => map.set(restriction, restriction.BackupObject) );
    this._bruteForceStack.push(map);
  }

  _rollback() {
    const map = this._bruteForceStack.pop();
    map.forEach( (value, obj) => obj["BackupObject"] = value );
  }
}
/************************************************************************* */

function solvePuzzle2 (clues) {
  if ( !Grid.validateSize(clues.length) ) { 
    console.error("Wrong grid size!");
    return []; 
  }

  console.time('Total');
  const grid = new Grid(clues);
  grid.calculate();

  if ( !grid.HasSolution ) {
    grid.bruteForce();
  }
  console.timeEnd('Total');
  console.log(`Counter: ${grid.debugBruteForceCounter}`);
  
  if ( !grid.HasSolution ) {
    console.warn("No solution, see temp grid:");
    console.log(grid.Result);
    console.log(grid);
  }

  return grid.Result;
}

solvePuzzle2([2,2,1,3, 2,2,3,1, 1,2,2,3, 3,2,1,3]);
solvePuzzle2([0,0,1,2, 0,2,0,0, 0,3,0,0, 0,1,0,0]);
solvePuzzle2([3,2,2,3,2,1, 1,2,3,3,2,2, 5,1,2,2,4,3, 3,2,1,2,2,4]);
solvePuzzle2([0,0,0,2,2,0, 0,0,0,6,3,0, 0,4,0,0,0,0, 4,4,0,3,0,0]);
solvePuzzle2([0,3,0,5,3,4, 0,0,0,0,0,1, 0,3,0,3,2,3, 3,2,0,3,1,0]);
  
//1.0s 28452
//1.0s 28234
solvePuzzle2([7,0,0,0,2,2,3, 0,0,3,0,0,0,0, 3,0,3,0,0,5,0, 0,0,0,0,5,0,4]);

// 1.8s 50117
// 1.7s 50463
solvePuzzle2([0,2,3,0,2,0,0, 5,0,4,5,0,4,0, 0,4,2,0,0,0,6, 5,2,2,2,2,4,1]);

// for a _very_ hard puzzle, replace the last 7 values with zeroes
// 4.8s 137720
// 5.0s 154721
solvePuzzle2([0,2,3,0,2,0,0, 5,0,4,5,0,4,0, 0,4,2,0,0,0,6, 0,0,0,0,0,0,0]);
