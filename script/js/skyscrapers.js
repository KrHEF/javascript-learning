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
    console.log(`Counter: ${grid.bruteForceCounter}`);
    
    if ( !grid.HaveSolution ) {
      console.warn("No solution, see temp grid:");
      console.log(grid);
      console.log(grid.toString());
    }

    return grid.toString();
  }
  
class Skyscraper {
  // static _levels;
  
  /**
   * 
   * @param {number|Skyscraper} param 
   */
  constructor(param) {
    // this._level;
    // this._availableLevels;

    if (typeof(param) === 'number') {
      this._create(param);
    } else if (param instanceof Skyscraper) {
      this._clone(param);
    } else {
      console.error("WTF? Only type Number or Skyscraper for clone")
    }
  }

  static get NoLevel() {
    return 0;
  }

  static get LevelMin() {
    return 1;
  }

  static get LevelMax() { 
    return Skyscraper._levels[Skyscraper._levels.length - 1]; 
  }

  static get LevelsCount() {
    return Skyscraper._levels.length;
  }

  
  get Level() { 
    return this._level; 
  }
  set Level(value) { 
    this._level = (value > 0 && value <= Skyscraper.LevelMax) ? value : Skyscraper.NoLevel; 
    this._availableLevels.clear();
  }
  
  get HaveLevel() { 
    return !!this._level 
  }

  get AvailableLevels() {
    return Array.from(this._availableLevels);
  }

  get AvailableLevelsCount() {
    return this._availableLevels.size;
  }

  get AvailableLevel() {
    return (this.AvailableLevelsCount === 1) ? Array.from(this._availableLevels)[0] : 0;
  }

  haveLevelInAvailable(level) {
    return this._availableLevels.has(level);
  }

  removeAvailableLevel(value) {
    this._availableLevels.delete(value);
  }
  
  toString() {
    return this.Level;
  }

  _create(levelsCount) {
    if (!Skyscraper._levels || Skyscraper._levels.length !== levelsCount) {
      Skyscraper._levels = [];
      for (let i = 0; i < levelsCount; i++) {
        Skyscraper._levels.push( i + Skyscraper.LevelMin ); 
      } 
      Skyscraper._levels.sort();   
    }

    this._level = Skyscraper.NoLevel;
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
  }

  get Skyscraper() {
    return this._skyscraper;
  }
  set Skyscraper(value) {
    this._skyscraper = value;
  }

  get RowIndex() {
    return this._rowIndex;
  }

  get ColIndex() {
    return this._colIndex;
  }

}

class Restriction {

  /**
   * Create new instance of class Restriction
   * @param {number} visibleSkyscrapersCount 
   * @param {Cell[]} sortCells 
   */
  constructor(visibleCount, sortCells) {
    this._count = visibleCount;
    this._cells = sortCells;
  }

  get VisibleCount() {
    return this._count;
  }

  get Cells() {
    return this._cells;
  }

  canCheck() {
    return this._cells.every( (cell) => cell.Skyscraper.HaveLevel );
  }

  check() {
    let result = 1;

    this._cells.reduce( (prevCell, cell) => {
      if ( prevCell.Skyscraper.Level < cell.Skyscraper.Level) { 
        result++;
        return cell;
      } else {
        return prevCell;
      }
    });

    return this._count === result;
  }
}

class Grid {
  
  /**
   * Constructor
   * @param {number[]} clues 
   */
  constructor(clues) {
    this._size = Math.floor(clues.length / 4);
    this._rows = [ [] ];
    this._cols = [ [] ];
    this._cells = [];
    this._restrictions = [];

    this._bruteForceStack = [];
    this.bruteForceCounter = 0; 

    this._init(clues);
  }  

  get HaveSolution() {
    return this._cells.every( (cell) => cell.Skyscraper.HaveLevel && this._checkRestrictionsByCell(cell) );
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

  toString() { 
    return this._rows.map( (row) => row.map( (cell) => cell.Skyscraper.toString() ) ); 
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
   * - доступных ячеек для каждого уровня
   */
  _createDependencies() {
    this._cells.forEach( (cell) => {

      if ( !this._rows[cell.RowIndex] ) {
        this._rows[cell.RowIndex] = [];
      }
      if ( !this._cols[cell.ColIndex] ) {
        this._cols[cell.ColIndex] = [];
      }
      this._rows[cell.RowIndex][cell.ColIndex] = cell;
      this._cols[cell.ColIndex][cell.RowIndex] = cell;
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
        case Skyscraper.LevelMin:
          this._setLevelToCell(Skyscraper.LevelMax, restriction.Cells[0]);
          return false;
        case Skyscraper.LevelMax:
          restriction.Cells.forEach( (cell, index) => this._setLevelToCell(Skyscraper.LevelMin + index, cell));
          return false;
        default:
          return true;
      }
    });

    this._restrictions.forEach( (restriction) => { 

      const clue = restriction.VisibleCount;
      for (let level = Skyscraper.LevelMax - (clue - 2); level <= Skyscraper.LevelMax; level++) {
        for (let index = 0; index <= (clue - 2) - (Skyscraper.LevelMax - level); index++) {
          this._removeAvailableLevelForCell(level, restriction.Cells[index]);
        }
      }

      // Найти 2 в подсказке
      // и удалить у 2-го числа в ряду из доступных (макс. число - 1)
      if (restriction.VisibleCount === 2) {
        this._removeAvailableLevelForCell(Skyscraper.LevelMax - 1, restriction.Cells[1]);
      }
    });

  }

  _calculateFromAvailable() {
    let findLevel = true;

    while (findLevel) {
      findLevel = false;

      // Проверка на 1 доступное число в ячейке среди доступных
      this._cells.forEach( (cell) => {
        const level = cell.AvailableLevel;
        if (level) {
          findLevel = true;
          this._setLevelToCell(level, cell);
        }
      });


      // Проверка на 1 доступное число в строке
      this._rows.forEach( (row) => {
        for (let level = Skyscraper.LevelMin; level <= Skyscraper.LevelMax; level++ ) {
          const cells = row.filter( (cell) => cell.Skyscraper.haveLevelInAvailable(level) );
          if (cells.length === 1) {
            findLevel = true;
            const cell = cells[0];
            this._setLevelToCell(level, cell);
          }
        }
      });

      // Проверка на 1 доступное число в колонке
      this._cols.forEach( (column) => {
        for (let level = Skyscraper.LevelMin; level <= Skyscraper.LevelMax; level++ ) {
          const cells = column.filter( (cell) => cell.Skyscraper.haveLevelInAvailable(level) );
          if (cells.length === 1) {
            findLevel = true;
            const cell = cells[0];
            this._setLevelToCell(level, cell);
          }
        }
      });
    }       
  }

  _setLevelToCell(level, cell) {
    const skyscraper = cell.Skyscraper;
    if (skyscraper.HaveLevel) {
      return skyscraper.Level === level;
    }
     
    skyscraper.Level = level;
    this._removeAvailableLevelByCell(level, cell);

    return this._checkRestrictionsByCell(cell);
  }
  
  _removeAvailableLevelByCell(level, cell) {
    this._removeAvailableLevelFromRow(level, cell.RowIndex);
    this._removeAvailableLevelFromColumn(level, cell.ColIndex);
  }

  _removeAvailableLevelFromRow(level, index) {
    const row = this._rows[index];
    row.forEach( (cell) => this._removeAvailableLevelForCell(level, cell) );
  }

  _removeAvailableLevelFromColumn(level, index) {
    const col = this._cols[index];
    col.forEach( (cell) => this._removeAvailableLevelForCell(level, cell) );
  }

  _removeAvailableLevelForCell(level, cell) {
    cell.Skyscraper.removeAvailableLevel(level);
  }

  _findNext() {
    const cell = this._getNextCell();
    if (!cell) { return false; }

    const levels = cell.Skyscraper.AvailableLevels.slice();
    for (const level of  levels) {
      this.bruteForceCounter++;
      this._backup();

      if ( this._setLevelToCell(level, cell) ) {
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
    const cells = this._getAllEmptyCells(),
          map = new Map();

    this._bruteForceStack.push(map);

    cells.forEach( (cell) => map.set(cell, new Skyscraper(cell.Skyscraper)) );
  }

  _rollback() {
    const map = this._bruteForceStack.pop();
    map.forEach( (copySkyscraper, cell) => cell.Skyscraper = copySkyscraper );
  }
}

// 4ms
// 6ms 1it // _restrictions: Map
// 2ms     // _restrictions: []
// 4ms     // forEach => for..of
// 2ms     // remove level from available
let clues = [ 2, 2, 1, 3,
              2, 2, 3, 1,
              1, 2, 2, 3,
              3, 2, 1, 3];
solvePuzzle(clues);

// 5ms 
// 72ms 187it // _restrictions: Map
// 5ms  11it  // _restrictions: []
// 4ms        // forEach => for..of
// 1ms  2it   // remove level from available
clues = [ 0, 0, 1, 2,
          0, 2, 0, 0,
          0, 3, 0, 0,
          0, 1, 0, 0];

solvePuzzle(clues);

// 60s
// 75s 1725106it //_restrictions: Map
// 40s 930730it  //_restrictions: []
// 38s           // forEach => for..of
// 30s           // add return to brute force
// 237ms 2206    // remove level from available
clues = [ 3, 2, 2, 3, 2, 1,
          1, 2, 3, 3, 2, 2,
          5, 1, 2, 2, 4, 3,
          3, 2, 1, 2, 2, 4];

solvePuzzle(clues);

clues = [ 0, 0, 0, 2, 2, 0,
          0, 0, 0, 6, 3, 0,
          0, 4, 0, 0, 0, 0,
          4, 4, 0, 3, 0, 0];

solvePuzzle(clues);

clues = [ 0, 3, 0, 5, 3, 4, 
          0, 0, 0, 0, 0, 1,
          0, 3, 0, 3, 2, 3,
          3, 2, 0, 3, 1, 0];
  
solvePuzzle(clues);

solvePuzzle([7,0,0,0,2,2,3, 0,0,3,0,0,0,0, 3,0,3,0,0,5,0, 0,0,0,0,5,0,4]);

solvePuzzle([0,2,3,0,2,0,0, 5,0,4,5,0,4,0, 0,4,2,0,0,0,6, 5,2,2,2,2,4,1]);

// for a _very_ hard puzzle, replace the last 7 values with zeroes
solvePuzzle([0,2,3,0,2,0,0, 5,0,4,5,0,4,0, 0,4,2,0,0,0,6, 0,0,0,0,0,0,0]);
