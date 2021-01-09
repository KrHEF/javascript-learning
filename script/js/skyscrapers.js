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
  get MaxAvailableLevel() { return this.AvailableLevels.slice(-1)[0]; }

  static clone(skyscraper) {
    return new Skyscraper(skyscraper._level, skyscraper._availableLevels);
  }

  setLevel(level) {
    if (this.HasLevel) { return this._level === level; }

    if ( this.hasAvailableLevel(level) ) {
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
        currLevel = 0,
        isMaxAvailableMode = false;
    for (let cell of this._cells) {
      currLevel = cell.Skyscraper.Level;
        
      // Если натыкаемся на 0 ячейку, то проверим не превышает ли результат установленное ограничение      
      if (currLevel === Skyscraper.NO_LEVEL) { return result < this._count; } 
      if (currLevel === Skyscraper.NO_LEVEL) {
        // if (result >= this._count || !cell.Skyscraper.AvailableLevelsCount) { return false; }
        if (result >= this._count) { return false; }
        isMaxAvailableMode = true;
        currLevel = cell.Skyscraper.MaxAvailableLevel;
      } 

      if (prevLevelMax < currLevel) {
        result++;
        prevLevelMax = currLevel;
      }

      if ( currLevel === Skyscraper.MaxLevel ) { break; }
    }

    if (isMaxAvailableMode) {
      return result <= this._count;
    }
    this._isChecked = (result === this._count);
    return this._isChecked;
  }

  toDebug() {
    let result = '';
    for (let cell of this._cells) {
      result += cell.HasSolution ? `(${cell.Skyscraper.Level})` : cell.Skyscraper.MaxAvailableLevel;
      result += ', ';
    }
    return `${this.VisibleCount}: ${result}`;
  }
}

class RestrictionRules {

  static set(restriction) {
    switch (restriction.VisibleCount) {
      case Restriction.MinVisibleCount:
        break;
      case Restriction.MinVisibleCount + 1:  // 2
        this._setRulesFor2(restriction);
        break;
      case Restriction.MaxVisibleCount - 1:  // Max - 1
        this._setRulesForPreMax(restriction);
        break;
      case Restriction.MaxVisibleCount:
        break;
      default:
        this._setRulesBarrier(restriction)  // others restrictions
        break;
    }
  }

  static _setRulesFor2(restriction) {
    const cells = restriction.Cells, 
          size = cells.length;

    const index0 = 0;    // 1st
    // (1) +6 0 0 0 0
    cells[index0].addRules( (level) => (level === Skyscraper.MinLevel) ? cells[index0 + 1].setLevel(Skyscraper.MaxLevel) : true );

    const index2 = 2;        // 3d
    // 0 +6 (5) 0 0 0
    cells[index2].addRules( (level) => (level === (Skyscraper.MaxLevel - 1)) ?  cells[index2 - 1].setLevel(level) : true );
    
    const indexLast = size - 1;   // last position
    // +5 0 0 0 0 (6)
    cells[indexLast].addRules( (level) => (level === Skyscraper.MaxLevel) ? cells[0].setLevel(Skyscraper.MaxLevel - 1) : true );

    //(a > 1) +n1:[<a] +n2:[<a]/6 +n3:[<a]/6 +n4:[<a]/6 6
    const rule_A___Max_ = () => {
      const level0 = cells[0].Skyscraper.Level;
      if (level0 <= Skyscraper.MinLevel) { return true; }
      let indexMax = this._findPosition(Skyscraper.MaxLevel, cells, 2);
      if (indexMax < 2) { return true; }
      
      if ( (level0 === Skyscraper.MinLevel + 1) && (indexMax === 2)) {
        return cells[1].setLevel(Skyscraper.MinLevel);
      }

      const noAvailableLevels = Skyscraper.Levels.slice(level0);
      return cells.slice(1, indexMax).every( (cell) => {
        noAvailableLevels.forEach( (level) => cell.removeAvailableLevel(level) ); 
        return !cell.HasSolution || (cell.Skyscraper.Level < cells[0].Skyscraper.Level) 
      });
    }
    cells[index0].addRules( (level) => level > 1 ? rule_A___Max_() : true );
    cells.slice(1).forEach( (cell) => cell.addRules(rule_A___Max_) );
  }

  static _setRulesForPreMax(restriction) {
    const cells = restriction.Cells, 
          size = cells.length;

    const indexPreLast = size - 2;
    // e:[<d] d:[<c] c:[<b] b (6) 0
    cells[indexPreLast].addRules( (level) => {
      if (level !== Skyscraper.MaxLevel) { return true; }

      const noAvailableLevels = Skyscraper.Levels.slice(Skyscraper.MinLevel + 1); // start with 3
      return !!cells.slice(0, -1).reduce( (prevCell, currCell) => {
        if (!prevCell) { return false; }
        noAvailableLevels.forEach( (level) => prevCell.removeAvailableLevel(level) ); 
        noAvailableLevels.shift();
        const result = !(prevCell.HasSolution && currCell.HasSolution) || (prevCell.Skyscraper.Level < currCell.Skyscraper.Level);
        return result ? prevCell : false;
      });
    });

    const indexLast  = size - 1;
    // +b1 +b2 +b3 +b4 +6 (a)
    cells[indexLast].addRules( (level) => {
      if (level === Skyscraper.MaxLevel) { return true; }

      let levels = Skyscraper.Levels.slice();
      levels.splice(level - 1, 1);
      return cells.slice(0, -1).every( (cell, index) => cell.setLevel(levels[index]) );
     });
    
     // +2 (1) +3 +4 +5 +6 
     // +2 +3 (1) +4 +5 +6
     // +2 +3 +4 (1) +5 +6
     // +2 +3 +4 +5 (1) +6
     // +2 +3 +5 +5 +6 (1)
     cells.slice(1).forEach( (cell) => cell.addRules( (level) => {
        if (level !== Skyscraper.MinLevel) { return true; }

        let levels = Skyscraper.Levels.slice(1);
        return cells.filter( (_cell) => _cell !== cell ).every( (cell, index) => cell.setLevel(levels[index]) );
     }));

  }

  static _setRulesBarrier(restriction) {
    const cells = restriction.Cells, 
          size = cells.length;

    // 3: (1) (2) +6 0 0 0
    // 4: (1) (2) (3) +6 0 0
    // 5: (1) (2) (3) (4) +5 0
    cells.slice(0, restriction.VisibleCount).forEach( (cell, index, _cells) => cell.addRules( (level) => {
      const result = _cells.every( (_cell, _index) => _cell.HasSolution && (_cell.Skyscraper.Level === _index + 1) );
      return result ? cells[restriction.VisibleCount].setLevel(Skyscraper.MaxLevel) : true;
    }));

    // 3: +4 0 0 0 (5) (6)
    // 4: +3 0 0 (4) (5) (6)
    // 5: +2 0 (3) (4) (5) (6)
    cells.slice(1 - restriction.VisibleCount).forEach( (cell, index, _cells) => cell.addRules( (level) => {
      const _indexFinal = Skyscraper.MaxLevel - restriction.VisibleCount + 1;
      const result = _cells.every( (_cell, _index) => _cell.HasSolution && (_cell.Skyscraper.Level === _index + _indexFinal + 1) );
      return result ? cells[0].setLevel(_indexFinal) : true;
    }));
  }

  /**
   * Find level and returns it position
   * @param {number} level 
   * @param {Cells[]} cells 
   * @returns {number} level position or -1 if don't find
   */
  static _findPosition(level, cells, start = 0) {
    for (let ind = start; ind < cells.length; ind++) {
      if (cells[ind].Skyscraper.Level === level) { return ind; }
    }
    return -1;
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
    return this._cells.every( (cell) => cell.HasSolution );
  }

  get Result() { 
    return this._rows.map( (row) => row.map( (cell) => cell.Skyscraper.Level ) ); 
  }

  get EmptyCells() {
    return this._cells.filter( (cell) => !cell.Skyscraper.HasLevel )
                      .sort( this._sortCellsForBruteForce );
  }

  get NextEmptyCell() {
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
    if (this.debugBruteForceCounter >= 2e6) { return true; }
    const cell = this.NextEmptyCell;
    if (!cell) { return false; }

    const levels = cell.Skyscraper.AvailableLevels.slice().reverse();
    for (const level of  levels) {
      this._backup();

      if ( cell.setLevel(level) && this.checkRestrictions() ) {
        const findAvailableResult = this._findAvailable();
        const checkRestrictionsResult = !findAvailableResult || this.checkRestrictions();
        if ( checkRestrictionsResult && this.HasSolution ) { return true; }
        if ( checkRestrictionsResult && this.bruteForce() ) { return true; }
      }
      
      this._rollback();
    }
    
    return false;
  }

  checkRestrictions() {
    return this._restrictions.every( (restriction) => restriction.check() );
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


  _calculateByRestrictions() {
    this._setCellsAndFilterRestrictions();
    this._restrictions.forEach( (restriction) => { 
      this._removeAvailableLevelsByRestriction(restriction);
    });

  }
  
  _setCellsAndFilterRestrictions() {
    this._restrictions.forEach( (restriction, index, arr) => {
      switch (restriction.VisibleCount) {
        case Restriction.MinVisibleCount:
          restriction.Cells[0].setLevel(Skyscraper.MaxLevel);
          delete arr[index];
          break;
        case Restriction.MaxVisibleCount:
          restriction.Cells.forEach( (cell, index) => cell.setLevel(Skyscraper.MinLevel + index) );
          delete arr[index];
          break;
        case Restriction.MinVisibleCount + 1: // Удалить у 2-го числа в ряду из доступных {макс. число - 1}
          restriction.Cells[1].removeAvailableLevel(Skyscraper.MaxLevel - 1);
          break;
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

  _sortCellsForBruteForce(cellA, cellB) {
    // return 10 * (cellA.Skyscraper.AvailableLevelsCount - cellB.Skyscraper.AvailableLevelsCount)
    //   - cellA.Skyscraper.AvailableLevels[cellA.Skyscraper.AvailableLevelsCount - 1] 
    //     - cellB.Skyscraper.AvailableLevels[cellB.Skyscraper.AvailableLevelsCount - 1];
    return  (cellA.Skyscraper.AvailableLevelsCount - cellB.Skyscraper.AvailableLevelsCount);
    // return cellA.Skyscraper.AvailableLevels[cellA.Skyscraper.AvailableLevelsCount - 1] 
    //       - cellB.Skyscraper.AvailableLevels[cellB.Skyscraper.AvailableLevelsCount - 1];
    }

  _findAvailable() {
    let findLevel = true,
        findSomething = false;

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

      if (findLevel) { findSomething = true; }
    }    
    
    return findSomething;
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
  // console.log(clues);
  console.time('Total');
  const grid = new Grid(clues);
  grid.calculate();

  if (!grid.HasSolution) {
    const result = grid.bruteForce();
    if (!result) {
      console.warn("No solution, see temp grid:");
      console.log(grid);
      console.log(grid.Result);
    }
  }
  console.timeEnd('Total');
  console.log(`Counter: ${grid.debugBruteForceCounter}`);

  return grid.Result;
}

console.log(1); 
solvePuzzle2([2,2,1,3, 2,2,3,1, 1,2,2,3, 3,2,1,3]);
console.log(2);
solvePuzzle2([0,0,1,2, 0,2,0,0, 0,3,0,0, 0,1,0,0]);
console.log(3);
solvePuzzle2([3,2,2,3,2,1, 1,2,3,3,2,2, 5,1,2,2,4,3, 3,2,1,2,2,4]);
console.log(4);
solvePuzzle2([0,0,0,2,2,0, 0,0,0,6,3,0, 0,4,0,0,0,0, 4,4,0,3,0,0]);
console.log(5);
solvePuzzle2([0,3,0,5,3,4, 0,0,0,0,0,1, 0,3,0,3,2,3, 3,2,0,3,1,0]);
console.log(6);
solvePuzzle2([0,0,0,6,3,0, 0,4,0,0,0,0, 4,4,0,3,0,0, 0,0,0,2,2,0 ]);

console.log(7);
// 1.0s 28452
// 1.0s 28234
// 0.3s 9930!
//      0.3s 8218
//      0.2s 6168
// 0.3s      3161    // bug fix: delete index of restriction array
// 0.03s     544     // correct check restriction
// 0.03s     397     // correct brute force
solvePuzzle2([7,0,0,0,2,2,3, 0,0,3,0,0,0,0, 3,0,3,0,0,5,0, 0,0,0,0,5,0,4]);

console.log(8);
// 1.8s 50117
// 1.7s 50463
// 2.0s 48507!
//      1.1s 40119    // add 4th rule
//      1.0s 35491    // optimize and fix 4th rule
//      0.6s 21030    // add 5th rule with optimization
//      0.6s 20907    // add 6th rule
//      0.06s 1243    // reverse
// 0.1s 0.06s 1239    // add barrier for end
// 0.4s       10253   // bug fix: delete index of restriction array
// 0.03s      499     // correct check restriction
// 0.03s      336     // correct brute force
solvePuzzle2([0,2,3,0,2,0,0, 5,0,4,5,0,4,0, 0,4,2,0,0,0,6, 5,2,2,2,2,4,1]);

console.log(9);
// for a _very_ hard puzzle, replace the last 7 values with zeroes
// 4.8s 137720
// 5.0s 154721
// 5.0s 151337 (!)
// 4.3s 3.3s 135813    // add 3 rules for clue=2
//      3.1s 130319    // add 4th rule for 1st cell
//      3.0s 127693    // add 4th rule for 3d + other cell
//      2.6s 109861    // optimize and fix 4th rule
//      2.4s 92329     // add 5th rule with optimization
//      2.2s 88594     // add 6th rule
// 0.3s 0.08s 2732     // reverse
// 0.6s       11364    // bug fix: delete index of restriction array
// 0.05s      806      // correct check restriction
// 0.05s      592      // correct brute force
solvePuzzle2([0,2,3,0,2,0,0, 5,0,4,5,0,4,0, 0,4,2,0,0,0,6, 0,0,0,0,0,0,0]);


console.log(10);
//      28.6s 1225301  // w/o rules
//      18.0s 761522   // add 6th rule
//      0.7s 27548     // reverse
//      0.7s 26827     // add barrier for start
// 2.0s 0.7s 25837     // add barrier for end
// 0.1s      2769      // bug fix: delete index of restriction array
// 0.03s     835       // correct check restriction
// 0.05s     585       // correct brute force
solvePuzzle2([6,4,0,2,0,0,3, 0,3,3,3,0,0,4, 0,5,0,5,0,2,0, 0,0,0,4,0,0,3]);


console.log(11);
//       56.0s 2322625     // w/o rules
// 60.7s 42.7s 1702915     // add barrier for end
// 10.0s       199187      // change sorting [errors]
// 77.0s       1982005     // bug fix: delete index of restriction array
// 6.71s       205068      // correct check restriction
// 6.36s       136696      // correct brute force
solvePuzzle2([0,0,5,3,0,2,0, 0,0,0,4,5,0,0, 0,0,0,3,2,5,4, 2,2,0,0,0,0,5]);
