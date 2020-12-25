function solvePuzzle (clues) {
    if ( !Grid.validateSize(clues.length) ) { 
      console.error("Wrong grid size!");
      return []; 
    }

    console.time('Total');
    console.time('Calculate');
    const grid = new Grid(clues);
    grid.calculate();
    console.timeEnd('Calculate');

    if ( !grid.HaveSolution ) {
      console.time('Brute force');
      grid.bruteForce();
      console.timeEnd('Brute force');
    }
    console.timeEnd('Total');
    
    if ( !grid.HaveSolution ) {
      console.warn("No solution, see temp grid:");
      console.log(grid);
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
    this._restrictions = new Map();

    this._bruteForceStack = [];

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
        this._restrictions.set(index, new Restriction(clue, cells) );
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
      const restriction = this._restrictions.get(index)
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
    this._restrictions.forEach( (restriction  ) => {
      // Найти 1 в подсказке и проставить макс. небоскреб,
      // или удалить макс.небоскреб из доступных
      if (restriction.VisibleCount === 1) {
        this._setLevelToCell(Skyscraper.LevelMax, restriction.Cells[0]);    
      } 
      if (restriction.VisibleCount > 1) {
        this._removeAvailableLevelForCell(Skyscraper.LevelMax, restriction.Cells[0]);
      }

      // Найти 2 в подсказке
      // и удалить у 2-го числа в ряду из доступных (макс. число - 1)
      if (restriction.VisibleCount === 2) {
        this._removeAvailableLevelForCell(Skyscraper.LevelMax - 1, restriction.Cells[1]);
      }


      // Найти максимальное число в подсказке 
      // и проставить всю строку или колонку по порядку
      if (restriction.VisibleCount === Skyscraper.LevelMax) {
        const cells = restriction.Cells;
        cells.forEach( (cell, index) => this._setLevelToCell(Skyscraper.LevelMin + index, cell));
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
    if (!levels.length) { return false; }

    let result = false;

    levels.forEach( (level) => {
      if (!result) {
        this._backup();

        if ( this._setLevelToCell(level, cell) ) {
          this._calculateFromAvailable();
          result = this.HaveSolution;
          result = result || this._findNext();
        } 
        
        if (!result) {
          this._rollback();
        }
      }
    });
    
    return result;
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

// 3.89ms
let clues = [ 2, 2, 1, 3,
              2, 2, 3, 1,
              1, 2, 2, 3,
              3, 2, 1, 3];
let actual = solvePuzzle(clues);
console.log(actual);

// 4.52ms
clues = [ 0, 0, 1, 2,
          0, 2, 0, 0,
          0, 3, 0, 0,
          0, 1, 0, 0];

actual = solvePuzzle(clues);
console.log(actual);

// 60ms
clues = [ 3, 2, 2, 3, 2, 1,
          1, 2, 3, 3, 2, 2,
          5, 1, 2, 2, 4, 3,
          3, 2, 1, 2, 2, 4];

actual = solvePuzzle(clues);
console.log(actual);

clues = [ 0, 0, 0, 2, 2, 0,
          0, 0, 0, 6, 3, 0,
          0, 4, 0, 0, 0, 0,
          4, 4, 0, 3, 0, 0];

// actual = solvePuzzle(clues);
// console.log(actual);

clues = [ 0, 3, 0, 5, 3, 4, 
          0, 0, 0, 0, 0, 1,
          0, 3, 0, 3, 2, 3,
          3, 2, 0, 3, 1, 0];
  
// actual = solvePuzzle(clues);
// console.log(actual);

// actual = solvePuzzle([7,0,0,0,2,2,3, 0,0,3,0,0,0,0, 3,0,3,0,0,5,0, 0,0,0,0,5,0,4]);
// console.log(actual);

// actual = solvePuzzle([0,2,3,0,2,0,0, 5,0,4,5,0,4,0, 0,4,2,0,0,0,6, 5,2,2,2,2,4,1]);
// console.log(actual);

// for a _very_ hard puzzle, replace the last 7 values with zeroes
// actual = solvePuzzle([0,2,3,0,2,0,0, 5,0,4,5,0,4,0, 0,4,2,0,0,0,6, 0,0,0,0,0,0,0]);
// console.log(actual);


// Calculate: 2.4189453125 ms
// Brute force: 1.1279296875 ms
// Calculate: 0.56005859375 ms
// Brute force: 4.666015625 ms
// Calculate: 0.51708984375 ms
// Brute force: 47990.156982421875 ms
