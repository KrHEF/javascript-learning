function solvePuzzle (clues) {
    if ( !Grid.validateSize(clues.length) ) { 
      console.error("Wrong grid size!");
      return []; 
    }
    
    const grid = new Grid(clues);
    grid.calculate();

    if ( !grid.HaveSolution ) {
      // let bruteForce = new BruteForce(grid);
      // bruteForce.start();
    }
    
    if ( !grid.HaveSolution ) {
      console.error("No solution, see temp grid:");
      console.log(grid);
    }

    return grid.toString();
  }
  
  
class Skyscraper {
  // static _levels;
  
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
  
  get HaveNumber() { 
    return !!this._level 
  }

  get AvailableLevelsCount() {
    return this._availableLevels.size;
  }

  get AvailableLevel() {
    return (this.AvailableLevelsCount === 1) ? this._availableLevels.values()[0] : 0;
  }

  /**
   * Установить следующее доступное число
   * и удалить его из доступных.
   * Метод нужен для перебора.
   * @returns {boolean} Возвращает успешность получения следующего значения: 
   * true - если значение установлено, 
   * false - если устанавливать больше нечего.
   */
  setNextAvailableLevel() {
    console.warn("Переделать!");
    if (!this.AvailableLevelsCount) { return false; }
    this._level = this._availableLevels[0];
    this.removeAvailableLevel(this._level);
    return true;
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
    if (!Skyscraper._levels) {
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
    return this._count && this._cells.every( (cell) => cell.Skyscraper.HaveNumber );
  }

  check() {
    let result = 1;

    this._cells.reduce( (prevCell, cell, index) => {
      const level = cell.Skyscraper.Level,
            prevLevel = (!index) ? 0 : prevCell.Skyscraper.Level;
      if ( prevLevel < level) { result++ }
      return cell;
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

    this._init(clues);
  }  

  get HaveSolution() {
    return this._cells.every( (cell) => cell.HaveNumber);
  }

  static validateSize(length) {
    return !(length % 4);
  }
  
  calculate() {
    this._calculateByRestriction();
    this._calculateFromAvailable();
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

      this._restrictions.push( new Restriction(clue, cells) );
    });
  }

  _getRestrictionsByCell(cell) {
    const restrictions = [],
          colIndex = cell.ColIndex,
          rowIndex = cell.RowIndex;

    restrictions.push( this._restrictions[colIndex] );
    restrictions.push( this._restrictions[ rowIndex + this._size ] );
    restrictions.push( this._restrictions[ 3 * this._size - 1 - colIndex ] );
    restrictions.push( this._restrictions[ 4 * this._size - 1 - rowIndex ] );

    return restrictions;
  }

  _checkRestrictionsByCell(cell) {
    const restrictions = this._getRestrictionsByCell(cell);
    return restrictions.every( (restriction) => !restriction.canCheck() || restriction.check() );
  }

  /**
   * Поиск чисел по ограничениям
   */
  _calculateByRestriction() {
    this._restrictions.forEach( (restriction) => {
      // Найти 1 в подсказке и проставить макс. небоскреб,
      // или удалить макс.небоскреб из доступных
      if (restriction.VisibleCount === 1) {
        this._setLevelToCell(Skyscraper.LevelMax, restriction.Cells[0]);    
      } else {
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

      // Проверка на 1 доступное число в ячейках
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
    if (skyscraper.HaveNumber) {
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
}

class BruteForce {

  constructor( grid ) {
    this._grid = grid;
    this._gridCopy = grid.copy();
    console.log(this._gridCopy);
  }

  _startBruteForce() {
    // let cells = this._cells.filter( (cell) => !cell.HaveNumber );
    // cells.sort( (a , b) => a.AvailableLevelsCount - b.AvailableLevelsCount );

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

// const clues = [2, 2, 1, 4,
const clues = [2, 2, 1, 3,
        2, 2, 3, 1,
        1, 2, 2, 3,
        3, 2, 1, 3];
const expected = [[1, 3, 4, 2],
           [4, 2, 1, 3],
           [3, 4, 2, 1],
           [2, 1, 3, 4]];
const actual = solvePuzzle(clues);
console.log(actual);
