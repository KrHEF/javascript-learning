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

  clone() {
    return new Skyscraper(this._level, this._availableLevels);
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

  removeAvailableLevels(levels) {
    const _levels = Array.isArray(levels) ? levels : [levels];
    _levels.forEach( (level) => this._availableLevels.delete(level) );
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

  get RowIndex() { return this._rowIndex; }
  get ColIndex() { return this._colIndex; }
  get BackupObject() { return { _skyscraper: this._skyscraper.clone() }; }
  set BackupObject(obj) { 
    if (!obj['_skyscraper']) { throw new Error("Rollback error"); }
    this._skyscraper = obj['_skyscraper']; 
  }
  // Skyscapers overload
  get Level() { return this._skyscraper.Level; }
  get HasLevel() { return this._skyscraper.HasLevel; }
  get AvailableLevels() { return this._skyscraper.AvailableLevels; }
  get AvailableLevelsCount() { return this._skyscraper.AvailableLevelsCount; }
  get MaxAvailableLevel() { return this._skyscraper.MaxAvailableLevel; }

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
      this._removeAvailableLevelFromSibling(level);
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

  hasAvailableLevel(level) {
    return this._skyscraper.hasAvailableLevel(level);
  }

  removeAvailableLevels(levels) {
    this._skyscraper.removeAvailableLevels(levels);
  }

  _removeAvailableLevelFromSibling(level) {
    this._siblingCells.forEach( (cell) => cell.removeAvailableLevels(level) );
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
    this._setLevelsAndRules();
  }

  static get MinVisibleCount() { return Skyscraper.MinLevel; }
  static get MaxVisibleCount() { return Skyscraper.MaxLevel; }

  get VisibleCount() { return this._count; }
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

    return {cellsIndex, isRow, isReverse};
  }

  static _addRulesCounter(key, subkey = 'all') {
    if (!Restriction.rulesCounter) {
      Restriction.rulesCounter = new Map();
    }
    let counterObj = Restriction.rulesCounter.get(key);
    if (!counterObj) {
      counterObj = Restriction.rulesCounter.set(key, {} ).get(key);
    }
    const counter = counterObj[subkey] || 0;
    counterObj[subkey] = counter + 1;
  }

  check() {
    if (this._isChecked) { return true; }

    let result = 0,
        prevLevelMax = 0,
        currLevel = 0;
    
    for (let cell of this._cells) {
      currLevel = cell.Level;
        
      if (currLevel === Skyscraper.NO_LEVEL) { return result < this._count; } 
      if (prevLevelMax < currLevel) {
        result++;
        prevLevelMax = currLevel;
      }
      if (currLevel === Skyscraper.MaxLevel) { break; }
    }

    this._isChecked = (result === this._count);
    return this._isChecked;
  }

  filterAvailableLevels() {
    const clue = this.VisibleCount;
    for (let level = Skyscraper.MaxLevel - (clue - 2); level <= Skyscraper.MaxLevel; level++) {
      for (let index = 0; index <= (clue - 2) - (Skyscraper.MaxLevel - level); index++) {
        this._cells[index].removeAvailableLevels(level);
      }
    }
  }

  _setLevelsAndRules() {
    switch (this.VisibleCount) {
      case Restriction.MinVisibleCount:
        this._cells[0].setLevel(Skyscraper.MaxLevel);
        break;
      case Restriction.MinVisibleCount + 1:  // 2
        this._cells[1].removeAvailableLevels(Skyscraper.MaxLevel - 1); 
        this._setRulesForTwo_1();
        this._setRulesForTwo_2();
        this._setRulesForTwo_3();
        this._setRulesBarrier();
        break;
      case Restriction.MaxVisibleCount - 1:  // Max - 1
        this._setRulesForPreMax_1();
        this._setRulesForPreMax_2();
        this._setRulesForPreMax_3();
        this._setRulesBarrier();
        break;
      case Restriction.MaxVisibleCount:
        this._cells.forEach( (cell, index) => cell.setLevel(Skyscraper.MinLevel + index) );
        break;
      default:  // others restrictions
        this._setRulesBarrier();
        break;
    }
  }

  // 2> 0 +6 (5) 0 0 0
  _setRulesForTwo_1() {
    this._cells[2].addRules( (level) => {
      Restriction._addRulesCounter("RulesForTwo_1");
      if (level === (Skyscraper.MaxLevel - 1)) {
        Restriction._addRulesCounter("RulesForTwo_1", "active");
        return this._cells[1].setLevel(level);
      } else { return true; }
    });
  };
  // 2> (2) +1 (6) 0 0 0 
  _setRulesForTwo_2() {
    [0, 2].map( (index) => this._cells[index].addRules( (level) => {
      Restriction._addRulesCounter("RulesForTwo_2");
      if ( (this._cells[0].Level === Skyscraper.MinLevel + 1) && (this._cells[2].Level === Skyscraper.MaxLevel)) {
        Restriction._addRulesCounter("RulesForTwo_2", "active");
        return this._cells[1].setLevel(Skyscraper.MinLevel);
      } else { return true; }
    }));
  }
  // 2> (a > 1) +n1:[<a] +n2:[<a]/6 +n3:[<a]/6 +n4:[<a]/6 6
  _setRulesForTwo_3() {
    const rule_A___Max_ = () => {
      Restriction._addRulesCounter("RulesForTwo_3");
      const level0 = this._cells[0].Level;
      if (level0 <= Skyscraper.MinLevel) { return true; }
      let indexMax = this._findLevelPositionInCells(Skyscraper.MaxLevel, this._cells, 2);
      if (indexMax < 2) { return true; }
      
      Restriction._addRulesCounter("RulesForTwo_3", "active");
      const noAvailableLevels = Skyscraper.Levels.slice(level0);
      return this._cells.slice(1, indexMax).every( (cell) => {
        cell.removeAvailableLevels(noAvailableLevels);
        return !cell.HasLevel || (cell.Level < this._cells[0].Level) 
      });
    }

    this._cells[0].addRules( (level) => (level > 1) ? rule_A___Max_() : true );
    this._cells.slice(1).forEach( (cell) => cell.addRules(rule_A___Max_) );
  }
  // 5> e:[<d] d:[<c] c:[<b] b (6) 0
  _setRulesForPreMax_1() {
    const indexPreLast = this._cells.length - 2;
    this._cells[indexPreLast].addRules( (level) => {
      Restriction._addRulesCounter("RulesForPreMax_1");
      if (level !== Skyscraper.MaxLevel) { return true; }
      
      Restriction._addRulesCounter("RulesForPreMax_1", "active");
      const noAvailableLevels = Skyscraper.Levels.slice(Skyscraper.MinLevel + 1); // start with 3d index
      return !!this._cells.slice(0, -1).reduce( (prevCell, currCell) => {
        if (!prevCell) { return false; }
        prevCell.removeAvailableLevels(noAvailableLevels);
        noAvailableLevels.shift();
        const isContinue = !(prevCell.HasLevel && currCell.HasLevel) || (prevCell.Level < currCell.Level);
        return isContinue ? currCell : false;
      });
    });
  }
  // 5> +b1 +b2 +b3 +b4 +6 (a)
  _setRulesForPreMax_2() {
      const indexLast  = this._cells.length - 1;
      this._cells[indexLast].addRules( (level) => {
        Restriction._addRulesCounter("RulesForPreMax_2");
        if (level === Skyscraper.MaxLevel) { return true; }
        
        Restriction._addRulesCounter("RulesForPreMax_2", "active");
        let sortLevels = Skyscraper.Levels.slice();
        sortLevels.splice(level - 1, 1);
        return this._cells.slice(0, -1).every( (cell, index) => cell.setLevel(sortLevels[index]) );
       });
  }
  // 5> +2 (1) +3 +4 +5 +6 
  // 5> +2 +3 (1) +4 +5 +6
  // 5> +2 +3 +4 (1) +5 +6
  // 5> +2 +3 +4 +5 (1) +6
  // 5> +2 +3 +5 +5 +6 (1)
  _setRulesForPreMax_3() {
    this._cells.slice(1).forEach( (cell) => cell.addRules( (level) => {
      Restriction._addRulesCounter("RulesForPreMax_3");
      if (level !== Skyscraper.MinLevel) { return true; }
      
      Restriction._addRulesCounter("RulesForPreMax_3", "active");
      let levels = Skyscraper.Levels.slice(1);
      return this._cells.filter( (_cell) => _cell !== cell ).every( (cell, index) => cell.setLevel(levels[index]) );
     }));
  }

  _setRulesBarrier() {
    const cells = this._cells;

    // 2> (1) +6 0 0 0 0
    // 3> (1) (2) +6 0 0 0
    // 4> (1) (2) (3) +6 0 0
    // 5> (1) (2) (3) (4) +6 0
    const index0 = this.VisibleCount - 1;
    cells.slice(0, index0).forEach( (cell, index, _cells) => cell.addRules( (level) => {
      Restriction._addRulesCounter("RulesBarrier_1");
      const result = _cells.every( (_cell, _index) => _cell.HasLevel && (_cell.Level === _index + Skyscraper.MinLevel) );
      if (result) {
        Restriction._addRulesCounter("RulesBarrier_1", "active");
      }
      return result ? cells[index0].setLevel(Skyscraper.MaxLevel) : true;
    }));

    // 2> +5 0 0 0 0 (6)        || 
    // 3> +4 0 0 0 (5) (6)
    // 4> +3 0 0 (4) (5) (6)
    // 5> +2 0 (3) (4) (5) (6)
    const index1 = Skyscraper.MaxLevel - this.VisibleCount + 1;
    cells.slice(1 - this.VisibleCount).forEach( (cell, index, _cells) => cell.addRules( (level) => {
      Restriction._addRulesCounter("RulesBarrier_2");
      const result = _cells.every( (_cell, _index) => _cell.HasLevel && (_cell.Level === _index + index1 + Skyscraper.MinLevel) );
      if (result) {
        Restriction._addRulesCounter("RulesBarrier_2", "active");
      }
      return result ? cells[0].setLevel(index1) : true;
    }));
  }

  /**
   * Find level in cells and return its position or -1 if don't find.
   */
  _findLevelPositionInCells(level, cells, start = 0) {
    for (let ind = start; ind < cells.length; ind++) {
      if (cells[ind].Level === level) { 
        return ind; 
      }
    }
    return -1;
  }
}

class Grid {
  
  constructor(clues = []) {
    this._size  = Math.floor(clues.length / 4);
    this._rows  = [ [] ];
    this._cols  = [ [] ];
    this._cells = Cell.create(this._size);
    this._setReferences();
    this._restrictions = this._createRestrictions(clues);

    this._bruteForceStack = [];
    this._bruteForceCounter = 0; 
  }  

  get HasSolution() { return this._cells.every( (cell) => cell.HasLevel ); }
  get Result() { return this._rows.map( (row) => row.map( (cell) => cell.Level ) ); }
  get Counter() { return this._bruteForceCounter; }
  get NextEmptyCell() { return this.EmptyCells[0]; }
  get EmptyCells() {
    return this._cells.filter( (cell) => !cell.HasLevel )
                      .sort( (cellA, cellB) => cellA.AvailableLevelsCount - cellB.AvailableLevelsCount);
  }

  static validateSize(length) {
    return !(length % 4);
  }
  
  calculate() {
    this._calculateByRestrictions();
    this._findAvailable();
  }

  bruteForce(){
    const cell = this.NextEmptyCell;
    if (!cell) { return false; }

    const levels = cell.AvailableLevels.slice().reverse();
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

      const {cellsIndex, isRow, isReverse} = Restriction.getParams(index, this._size);
      const cells = (isRow) ? this._rows[cellsIndex] : this._cols[cellsIndex];
      restrictions[index] = new Restriction(clue, isReverse ? cells.slice().reverse() : cells);
    });

    return restrictions;
  }

  _calculateByRestrictions() {
    this._filterRestrictions();
    this._restrictions.forEach( (restriction) => restriction.filterAvailableLevels() );
  }
  
  _filterRestrictions() {
    this._restrictions.forEach( (restriction, index, restrictions) => {
      if (restriction.VisibleCount === Restriction.MinVisibleCount 
          || restriction.VisibleCount === Restriction.MaxVisibleCount) {
            delete restrictions[index];
          }
    });
  }

  _findAvailable() {
    let findSomething = false;

    while (true) {
      let findLevel = this._cells.reduce( (find, cell) => this._findOneAvailableLevelInCell(cell) || find, false);
      findLevel = this._rows.reduce( (find, cells) => this._findSingleAvailableLevelInCells(cells) || find, findLevel );
      findLevel = this._cols.reduce( (find, cells) => this._findSingleAvailableLevelInCells(cells) || find, findLevel );
      if (findLevel) { findSomething = true; }
      else { return findSomething; }
    }   
  }
  
  _findOneAvailableLevelInCell(cell) {
      return (cell.AvailableLevelsCount === 1) ? cell.setLevel( cell.AvailableLevels[0] ) : false;
  }

  _findSingleAvailableLevelInCells(cells) {
    return Skyscraper.Levels.reduce( (find, level) => {
      const levelCells = cells.filter( (cell) => cell.hasAvailableLevel(level) );
      return (levelCells.length === 1) ? levelCells[0].setLevel(level) || find : find;
    }, false);
  }

  _backup() {
    this._bruteForceCounter++;
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
    if (!grid.HasSolution || !grid.checkRestrictions() ) {
      console.warn("No solution, see temp grid:");
      console.log(grid);
      console.log(grid.Result);
    }
  }
  console.timeEnd('Total');
  console.log(`Counter: ${grid.Counter}`);

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
// 0.05s     395     // refactoring restriction rules
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
// 0.03s      339     // Anti refactoring
// 0.04s      401     // refactoring restriction rules
// 0.06s      336     // refactoring restriction rules
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
// 0.05s      594      // Anti refactoring
// 0.05s      587      // refactoring restriction rules
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
// 0.06s     700       // refactoring restriction rules
// 0.05s     591       // refactoring restriction rules
solvePuzzle2([6,4,0,2,0,0,3, 0,3,3,3,0,0,4, 0,5,0,5,0,2,0, 0,0,0,4,0,0,3]);


console.log(11);
//       56.0s 2322625     // w/o rules
// 60.7s 42.7s 1702915     // add barrier for end
// 10.0s       199187      // change sorting [errors]
// 77.0s       1982005     // bug fix: delete index of restriction array
// 6.71s       205068      // correct check restriction
// 6.36s       136696      // correct brute force
// 6.54s       137894      // Anti refactoring
// 6.54s       137908      // Anti refactoring 2
// 6.24s       137148      // refactoring restriction rules
solvePuzzle2([0,0,5,3,0,2,0, 0,0,0,4,5,0,0, 0,0,0,3,2,5,4, 2,2,0,0,0,0,5]);

console.log('RulesCounter:');
Restriction.rulesCounter.forEach( (counterObj, key) => {
  let result = `${key}:`;
  for (let cnt in counterObj) {
    result += ` ${cnt}: ${counterObj[cnt]},`;
  }
  console.log( result.slice(0, -1) );
});
