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
    this._isSet = false;
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
  get IsSet() { return this._isSet; }

  static clone(skyscraper) {
    return new Skyscraper(skyscraper._level, skyscraper._availableLevels);
  }

  setLevel(level) {
    if (this.HasLevel) { return this._level === level; }

    if ( this.hasAvailableLevel(level) ) {
      this._level = level;
      this._availableLevels.clear();
      this._isSet = true;
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
    this._rules = [];
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
  get IsSet() { return this._skyscraper.IsSet; }

  static create(size) {
    Skyscraper.Levels = size;

    const cells = [];
    for (let row = 0; row < size; row++)
      for (let col = 0; col < size; col++)
        cells.push( new Cell(col, row) );
        
    return cells;
  }

  setLevel(level) {
    if (this._skyscraper.HasLevel) {
      return this._skyscraper.setLevel(level);
    } else if ( this._skyscraper.setLevel(level) ) {
      this._removeAvailableLevelForSibling(level);
      return this._checkRules(level);
    } else {
      return false;
    }
  }

  addRules(rules) {
    if ( Array.isArray(rules) ) {
      rules.forEach( (rule) => this._rules.push(rule) );
    } else {
      this._rules.push(rules);
    }
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

  _checkRules(level) {
    return this._rules.every( (rule) => rule(level) );
  }

}

class Restriction {

  constructor(visibleCount, sortCells) {
    this._count = visibleCount;
    this._cells = sortCells;
    this._isChecked = false;
  }

  static get MinVisibleCount() { return Skyscraper.MinLevel; }
  static get MaxVisibleCount() { return Skyscraper.MaxLevel; }

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

  check() {
    if (this._isChecked) { return true; }

    let result = 0,
        prevLevelMax = 0,
        currLevel = 0;
    for (let cell of this._cells) {
      currLevel = cell.Skyscraper.Level;
        
      // Если натыкаемся на 0 ячейку, то проверим не превышает ли уже результат установленное ограничение      
      if ( !currLevel ) { return result < this._count; } 

      if (prevLevelMax < currLevel) {
        result++;
        prevLevelMax = currLevel;
      }

      if ( currLevel === Skyscraper.MaxLevel ) { break; }
    }

    this._isChecked = (this._count === result);
    return this._isChecked;
  }
}

class RestrictionRules {

  static set(restriction) {
    switch (restriction.VisibleCount) {
      case Restriction.MinVisibleCount + 1:  // 2
        this._setRulesFor2(restriction);
        break;
    }
  }

  /**
   * @param {Restriction} restriction 
   */
  static _setRulesFor2(restriction) {
    const cells = restriction.Cells, 
          size = cells.length;

    const index0 = 0;    // 1st
    // 1 +6 0 0 0 0
    cells[index0].addRules( (level) => 
      (level === Skyscraper.MinLevel) ? cells[index0 + 1].setLevel(Skyscraper.MaxLevel) : true );

    const index2 = 2;        // 3d
    // 0 +6 5 0 0 0
    cells[index2].addRules( (level) => (level === (Skyscraper.MaxLevel - 1)) ?  cells[index2 - 1].setLevel(level) : true );
    
    const indexLast = size - 1;   // last position
    // +5 0 0 0 0 6
    cells[indexLast].addRules( (level) => (level === Skyscraper.MaxLevel) ? cells[0].setLevel(Skyscraper.MaxLevel - 1) : true );
        
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
    this._findAvailable();
  }

  bruteForce(){
    const cell = this.NextCell;
    if (!cell) { return false; }

    const levels = cell.Skyscraper.AvailableLevels.slice();
    for (const level of  levels) {
      this._backup();

      if ( cell.setLevel(level) && this._checkRestrictions(cell) ) {
        this._findAvailable();
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
      RestrictionRules.set(restrictions[index]);
    });
    return restrictions;
  }

  _getRestrictionsIds(cell) {
    return [cell.ColIndex,                        // up
            cell.RowIndex + this._size,           // right
            3 * this._size - 1 - cell.ColIndex,   // down
            4 * this._size - 1 - cell.RowIndex];  // left
  }

  _checkRestrictions(cell) {
    const indexes = this._getRestrictionsIds(cell);
    return indexes.every( (index) => {
        const restriction = this._restrictions[index];
        return !restriction || restriction.check();
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

  _findAvailable() {
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

// solvePuzzle2([2,2,1,3, 2,2,3,1, 1,2,2,3, 3,2,1,3]);
// solvePuzzle2([0,0,1,2, 0,2,0,0, 0,3,0,0, 0,1,0,0]);
// solvePuzzle2([3,2,2,3,2,1, 1,2,3,3,2,2, 5,1,2,2,4,3, 3,2,1,2,2,4]);
// solvePuzzle2([0,0,0,2,2,0, 0,0,0,6,3,0, 0,4,0,0,0,0, 4,4,0,3,0,0]);
// solvePuzzle2([0,3,0,5,3,4, 0,0,0,0,0,1, 0,3,0,3,2,3, 3,2,0,3,1,0]);
  
//1.0s 28452
//1.0s 28234
//0.3s 9930!
// solvePuzzle2([7,0,0,0,2,2,3, 0,0,3,0,0,0,0, 3,0,3,0,0,5,0, 0,0,0,0,5,0,4]);

// 1.8s 50117
// 1.7s 50463
// 2.0s 48507!
// solvePuzzle2([0,2,3,0,2,0,0, 5,0,4,5,0,4,0, 0,4,2,0,0,0,6, 5,2,2,2,2,4,1]);

console.log( solvePuzzle2([0,0,0,6,3,0, 0,4,0,0,0,0, 4,4,0,3,0,0, 0,0,0,2,2,0 ]) );

// for a _very_ hard puzzle, replace the last 7 values with zeroes
// 4.8s 137720
// 5.0s 154721
// 5.0s 151337 (!)
// 4.3s 135813    // add 3 rules for clue=2
// solvePuzzle2([0,2,3,0,2,0,0, 5,0,4,5,0,4,0, 0,4,2,0,0,0,6, 0,0,0,0,0,0,0]);
