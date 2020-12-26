function solvePuzzle (clues) {
    if ( !Grid.validateSize(clues.length) ) { 
      console.error("Wrong grid size!");
      return []; 
    }

    console.time('Total');
    const grid = new Grid(clues);
    grid.calculate();

    if ( !grid.HaveSolution ) {
      grid.bruteForce();
    }
    console.timeEnd('Total');
    console.log(`Counter: ${grid.debugBruteForceCounter}`);
    
    if ( !grid.HaveSolution ) {
      console.warn("No solution, see temp grid:");
      console.log(grid);
    }

    console.log(grid.Result);
    return grid.Result;
  }
  
class Skyscraper {
  // static _levels;
  
  /**
   * 
   * @param {number|Skyscraper} param 
   */
  constructor(param) {
    this._level = Skyscraper.NO_LEVEL;
    this._availableLevels = null;

    if(param instanceof Skyscraper) {
      this._clone(param);
    } else {
      this._create(param);
    }
  }

  static get NO_LEVEL()  { return 0; }
  static get MIN_LEVEL() { return 1; }
  static get MAX_LEVEL() { return Skyscraper._levels[Skyscraper._levels.length - 1]; }
  
  get Level() { return this._level; }
  get HaveLevel() { return !!this._level; }
  get AvailableLevels() { return Array.from(this._availableLevels); }
  get AvailableLevelsCount() { return this._availableLevels.size; }

  setLevel(level) {
    if (this.HaveLevel) { return this._level === level; }

    if (level >= Skyscraper.MIN_LEVEL && level <= Skyscraper.MAX_LEVEL) {
      this._level = level;
      this._availableLevels.clear();
      return true;
    }

    return false;
  }

  haveAvailableLevel(level) {
    return this._availableLevels.has(level);
  }

  removeAvailableLevel(level) {
    this._availableLevels.delete(level);
  }
  
  _create(levelsCount) {
    if (!Skyscraper._levels || Skyscraper._levels.length !== levelsCount) {
      Skyscraper._levels = [];
      for (let i = 0; i < levelsCount; i++) {
        Skyscraper._levels.push( i + Skyscraper.MIN_LEVEL ); 
      } 
      Skyscraper._levels.sort();   
    }
    this._availableLevels = new Set(Skyscraper._levels);
  }

  _clone(skyscraper) {
    this._level = skyscraper._level;
    this._availableLevels = new Set(skyscraper._availableLevels);
  }

}
  
class Cell {

  constructor(rowIndex, colIndex, skyscraper) {
    this._skyscraper = skyscraper;
    this._colIndex = colIndex;
    this._rowIndex = rowIndex;
    this._siblingCells = [];
  }

  get Skyscraper() { return this._skyscraper; }
  set Skyscraper(value) { this._skyscraper = value; }
  get RowIndex() { return this._rowIndex; }
  get ColIndex() { return this._colIndex; }
  get BackupObject() { return { _skyscraper: new Skyscraper(this._skyscraper) }; }
  set BackupObject(obj) { 
    if (!obj['_skyscraper']) { throw new Error("Rollback error"); }
    this._skyscraper = obj['_skyscraper']; 
  }


  setLevel(level) {
    if ( !this._skyscraper.setLevel(level) ) { return false; }
    this._removeAvailableLevelForSibling(level);
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

  canCheck() {
    return this._cells.every( (cell) => cell.Skyscraper.HaveLevel );
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
  
  /**
   * @param {number[]} clues 
   */
  constructor(clues) {
    this._size = Math.floor(clues.length / 4);
    this._rows = [ [] ];
    this._cols = [ [] ];
    this._cells = [];
    this._restrictions = [];

    this._bruteForceStack = [];
    this.debugBruteForceCounter = 0; 

    this._init(clues);
  }  

  get HaveSolution() {
    return this._cells.every( (cell) => cell.Skyscraper.HaveLevel && this._checkRestrictionsByCell(cell) );
  }

  get Result() { 
    return this._rows.map( (row) => row.map( (cell) => cell.Skyscraper.Level ) ); 
  }

  static validateSize(length) {
    return !(length % 4);
  }
  
  calculate() {
    this._calculateByRestriction();
    this._calculateFromAvailable();
  }

  bruteForce(){
    this._findNext();
  }

  _init(clues) {
    this._createSkyscrapers();
    this._createDependencies();
    this._createRestrictions(clues);
  }

  _createSkyscrapers() {
    for (let row = 0; row < this._size; row++) {
      for (let col = 0; col < this._size; col++) {
        const skyscraper = new Skyscraper(this._size);
        this._cells.push( new Cell(row, col, skyscraper) );
      }
    }
  }

  /**
   * Метод создаёт массивы:
   * - строк
   * - колонок
   * - устанавливает ячейкам соседние
   */
  _createDependencies() {
    this._cells.forEach( (cell, index, cells) => {

      if ( !this._rows[cell.RowIndex] ) {
        this._rows[cell.RowIndex] = [];
      }
      if ( !this._cols[cell.ColIndex] ) {
        this._cols[cell.ColIndex] = [];
      }
      this._rows[cell.RowIndex][cell.ColIndex] = cell;
      this._cols[cell.ColIndex][cell.RowIndex] = cell;

      cell.setSiblings(cells);
    });
  }

  _createRestrictions(clues) {

    clues.forEach( (clue, index) => {
      let calcIndex = 0,
          cells = [];
      
      if (index < this._size) {
        calcIndex = index;
        cells = this._cols[calcIndex]
      } else if (index < 2 * this._size) {
        calcIndex = index % this._size;
        cells = this._rows[calcIndex].slice().reverse();
      } else if (index < 3 * this._size) {
        calcIndex = this._size - index % this._size - 1;
        cells = this._cols[calcIndex].slice().reverse();
      } else if (index < 4 * this._size) {
        calcIndex = this._size - index % this._size - 1;
        cells = this._rows[calcIndex];
      } else {
        console.error("Overflow restrictions");
      }

      if (clue) {  // Clue can be zero
        this._restrictions[index] = new Restriction(clue, cells);
      }
    });
  }

  _getRestrictionsByCell(cell) {
    const indexes = [
      cell.ColIndex,
      cell.RowIndex + this._size,
      3 * this._size - 1 - cell.ColIndex,
      4 * this._size - 1 - cell.RowIndex
    ],
    restrictions = [];

    indexes.forEach( (index) => {
      const restriction = this._restrictions[index];
      if (restriction) {
        restrictions.push(restriction);
      }
    }, this );
    return restrictions;
  }

  _checkRestrictionsByCell(cell) {
    const restrictions = Array.from( this._getRestrictionsByCell(cell) );
    return restrictions.every( (restriction) => !restriction.canCheck() || restriction.check() );
  }

  /**
   * Поиск чисел по ограничениям
   */
  _calculateByRestriction() {

    this._restrictions = this._restrictions.filter( (restriction) => {
      switch (restriction.VisibleCount) {
        case Skyscraper.MIN_LEVEL:
          this._setCellLevel(Skyscraper.MAX_LEVEL, restriction.Cells[0]);
          return false;
        case Skyscraper.MAX_LEVEL:
          restriction.Cells.forEach( (cell, index) => this._setCellLevel(Skyscraper.MIN_LEVEL + index, cell));
          return false;
        default:
          return true;
      }
    });

    this._restrictions.forEach( (restriction) => { 

      const clue = restriction.VisibleCount;
      for (let level = Skyscraper.MAX_LEVEL - (clue - 2); level <= Skyscraper.MAX_LEVEL; level++) {
        for (let index = 0; index <= (clue - 2) - (Skyscraper.MAX_LEVEL - level); index++) {
          restriction.Cells[index].removeAvailableLevel(level);
        }
      }

      // Найти 2 в подсказке
      // и удалить у 2-го числа в ряду из доступных (макс. число - 1)
      if (restriction.VisibleCount === 2) {
        restriction.Cells[1].removeAvailableLevel(Skyscraper.MAX_LEVEL - 1);
      }
    });

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
          this._setCellLevel(level, cell);
        }
      });


      // Проверка на 1 доступное число в строке
      this._rows.forEach( (row) => {
        for (let level = Skyscraper.MIN_LEVEL; level <= Skyscraper.MAX_LEVEL; level++ ) {
          const cells = row.filter( (cell) => cell.Skyscraper.haveAvailableLevel(level) );
          if (cells.length === 1) {
            findLevel = true;
            const cell = cells[0];
            this._setCellLevel(level, cell);
          }
        }
      });

      // Проверка на 1 доступное число в колонке
      this._cols.forEach( (column) => {
        for (let level = Skyscraper.MIN_LEVEL; level <= Skyscraper.MAX_LEVEL; level++ ) {
          const cells = column.filter( (cell) => cell.Skyscraper.haveAvailableLevel(level) );
          if (cells.length === 1) {
            findLevel = true;
            const cell = cells[0];
            this._setCellLevel(level, cell);
          }
        }
      });
    }       
  }

  _setCellLevel(level, cell) {
    if ( cell.setLevel(level) ) { return false; }

    return this._checkRestrictionsByCell(cell);
  }
  
  _findNext() {
    const cell = this._getNextCell();
    if (!cell) { return false; }

    const levels = cell.Skyscraper.AvailableLevels.slice();
    for (const level of  levels) {
      this.debugBruteForceCounter++;
      this._backup();

      if ( this._setCellLevel(level, cell) ) {
        this._calculateFromAvailable();
        if (this.HaveSolution) { return true; }
        if (this._findNext()) { return true; }
      } 
      
      this._rollback();
    }
    
    return false;
  }

  _getNextCell() {
    const cells = this._getAllEmptyCells();
    return (cells.length) ? cells[0] : null;
  }

  _getAllEmptyCells() {
    return this._cells.filter( (cell) => !cell.Skyscraper.HaveLevel )
                      .sort( (cellA, cellB) => cellA.Skyscraper.AvailableLevelsCount 
                                             - cellB.Skyscraper.AvailableLevelsCount );
  }

  _backup() {
    const map = new Map();
    this._bruteForceStack.push(map);
    this._getAllEmptyCells().forEach( (cell) => map.set(cell, cell.BackupObject) );
    this._restrictions.forEach( (restriction) => map.set(restriction, restriction.BackupObject) );
  }

  _rollback() {
    const map = this._bruteForceStack.pop();
    map.forEach( (value, obj) => obj["BackupObject"] = value );
  }
}

solvePuzzle([2,2,1,3, 2,2,3,1, 1,2,2,3, 3,2,1,3]);
solvePuzzle([0,0,1,2, 0,2,0,0, 0,3,0,0, 0,1,0,0]);
solvePuzzle([3,2,2,3,2,1, 1,2,3,3,2,2, 5,1,2,2,4,3, 3,2,1,2,2,4]);
solvePuzzle([0,0,0,2,2,0, 0,0,0,6,3,0, 0,4,0,0,0,0, 4,4,0,3,0,0]);
solvePuzzle([0,3,0,5,3,4, 0,0,0,0,0,1, 0,3,0,3,2,3, 3,2,0,3,1,0]);
  
//1.0s 28452
//1.0s 28234
solvePuzzle([7,0,0,0,2,2,3, 0,0,3,0,0,0,0, 3,0,3,0,0,5,0, 0,0,0,0,5,0,4]);

// 1.8s 50117
// 1.7s 50463
solvePuzzle([0,2,3,0,2,0,0, 5,0,4,5,0,4,0, 0,4,2,0,0,0,6, 5,2,2,2,2,4,1]);

// for a _very_ hard puzzle, replace the last 7 values with zeroes
// 4.8s 137720
// 5.0s 154721
solvePuzzle([0,2,3,0,2,0,0, 5,0,4,5,0,4,0, 0,4,2,0,0,0,6, 0,0,0,0,0,0,0]);
