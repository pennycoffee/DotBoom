let Dot = require("./Dot");

let constants = require("./Constants");

class Board {
  constructor(args) {
    this._dots = [];
    this._rows = args.rows;
    this._columns = args.columns;
    this._bombs = args.bombs;
    this._isDebugMode = args.isDebugMode;
    this._isConsoleMode = args.isConsoleMode;

    // For randomly distributing bombs.
    this._bombsLeft = args.bombs; 
    this._dotsLeft = this.getNumDots();

    this._bombsList = [];

    this._gameStatus = constants.GAME_PLAYING;

    this._numDotsFlagged = 0;

    this._createGraph();
    this._findNeighbors();
    this._labelNumberBombs();
  }

  _createGraph() {
    if (this._rows < 1 || this._columns < 1) {
      throw new Error(`${constants.CREATE_FAILURE_MSG} Please create game with at least one row and column.`);
    } else if (this._bombs < 0) {
      throw new Error(`${constants.CREATE_FAILURE_MSG} There cannot be a negative number of bombs.`);
    } else if (this._bombs > this.getNumDots()) {
      throw new Error(`${constants.CREATE_FAILURE_MSG} Too many bombs.`);
    }

    for (var i = 0; i < this._rows; i++) {
      let row = [];

      for (var j = 0; j < this._columns; j++) {
        let hasBomb = this._setBomb();

        let dot = new Dot({
          id: `${i}-${j}`,
          hasBomb: hasBomb,
          row: i,
          column: j,
          isDebugMode: this._isDebugMode,
          isConsoleMode: this._isConsoleMode
        });

        row.push(dot);

        if (hasBomb) {
          this._bombsList.push(dot);
        }
      }
      this._dots.push(row);
    }
  }

  _setBomb() {
    let shouldSetBomb = false;

    if ((this._bombsLeft === this._dotsLeft) || (Math.random() < (this._bombsLeft / this._dotsLeft))) {
      this._bombsLeft--;
      shouldSetBomb = true;
    }

    this._dotsLeft--;
    return shouldSetBomb;
  }

  _findNeighbors() {
    for (var i = 0; i < this._dots.length; i++) {
      let row = this._dots[i];
      for (var j = 0; j < row.length; j++) {
        // Add top left neighbor.
        this._addNeighbor(i, j, i - 1, j - 1);
        // Add top middle neighbor.
        this._addNeighbor(i, j, i - 1, j);
        // Add top right neighbor.
        this._addNeighbor(i, j, i - 1, j + 1);
        // Add left neighbor.
        this._addNeighbor(i, j, i, j - 1);
        // Add right neighbor.
        this._addNeighbor(i, j, i, j + 1);
        // Add bottom left neighbor.
        this._addNeighbor(i, j, i + 1, j - 1);
        // Add bottom middle neighbor.
        this._addNeighbor(i, j, i + 1, j);
        // Add bottom right neighbor.
        this._addNeighbor(i, j, i + 1, j + 1);
      }
    }
  }

  // I normally use an object when number of parameters > 2, but in this case, it would add clutter
  // to _findNeighbors() above.
  _addNeighbor(currentRow, currentColumn, neighborRow, neighborColumn) {
    if (this._dots[neighborRow] && this._dots[neighborRow][neighborColumn]) {
      return this._dots[currentRow][currentColumn].addNeighbor(this._dots[neighborRow][neighborColumn]);
    } else {
      return false;
    }
  }

  _labelNumberBombs() {
    for (var i = 0; i < this._dots.length; i++) {
      let row = this._dots[i];

      for (var j = 0; j < row.length; j++) {
        // Get number of neighbors with bombs.
        let bombs = row[j].setNumNeighborBombs(row[j].getNeighbors().filter((dot) => {
          return dot.hasBomb();
        }).length);

        // If at least one neighbor has a bomb, set flag to true.
        row[j].setHasNeighborBombs(!!bombs); // Shortcut to convert integer to boolean.
      }
    }
  }

  _flagBombs() {
    this._bombsList.map((element) => {
      if (!element.isFlagged()) element.toggleFlag();
      return element;
    });
  }


  // Whenever a dot is clicked, to prevent infinite recursion, each dot sets its clicked property to true.
  // Must reset to false for subsequent clicks.
  _resetDotClicks() {
    this._dots.map((row) => {row.map((dot) => {dot.setClicked(false)})});
  }

  /**
   * Returns Object with two fields: 
   * (1) status: bomb clicked or won game or game over, etc.
   * (2) dots: array.
   * @returns {Object}
   */
  click(row, column) {

    this.checkCoordinates(row, column);

    let result = {
      status: "",
      dots: [],
      bombs: []
    };

    let dots = [];

    if (this._gameStatus === constants.GAME_LOST || this._gameStatus === constants.GAME_WON) {

      this.showGameStatusMessage();

      result.status = this._gameStatus;

    } else {

      let clickedDot = this._dots[row][column];

      if (clickedDot.isRevealed()) {

        result.status = constants.CLICKED_REVEALED;

      } else {
        this._resetDotClicks();

        dots = clickedDot.click();

        if (dots[0].isFlagged()) {

          console.log(`${dots[0].getId()} is flagged, to click please remove flag first.`);

          result.status = constants.CLICKED_FLAGGED;

        } else if (dots[0].hasBomb()) {
          this._gameStatus = constants.GAME_LOST;

          // Flag all bomb locations.
          this._flagBombs();

          // Return array of dots with bombs - 
          // move clicked dot to beginning of array (it gets highlighted red in the UI).
          result.bombs = [dots[0]].concat(this._bombsList.filter((dot) => {
            return dot.getId() !== dots[0].getId();
          }));

          this._numDotsFlagged = this._bombs // Kludge: Display zero for bombs left.

          result.status = constants.CLICKED_BOMB;

          console.log(`${constants.GAME_OVER_MSG}! You hit a bomb. Please try again.`);

        } else {

          result.status = constants.DOTS_REVEALED;

        }

        if (this.getNumDots() - this.getNumRevealedDots() == this._bombs) {

          this._gameStatus = constants.GAME_WON;

          // Game is won, flag all bomb locations.
          this._flagBombs();
          result.bombs = this._bombsList; // BUG: dots should return clicked dots AND bombs

          this._numDotsFlagged = this._bombs // Kludge: Display zero for bombs left.

          result.status = constants.WON_GAME;

          console.log(`You won! Want to play again?`);
        }

        if (this._isDebugMode || this._isConsoleMode) this.showBoard();

        result.dots = dots;
      }
    } // End giant conditional.

    return result;
  }

  getDotNumNeighborBombs(row, column) {
    this.checkCoordinates(row, column);

    return this._dots[row][column].numNeighborBombs();
  }

  getDotHasBomb(row, column) {
    this.checkCoordinates(row, column);

    return this._dots[row][column].hasBomb();
  }

  getBombs() {
    return this._bombsList;
  }

  getNumRevealedDots() {
    let count = 0;

    for (var i = 0; i < this._dots.length; i++) {
      let row = this._dots[i];

      for (var j = 0; j < row.length; j++) {
        if (row[j].isRevealed()) count++;
      }
    }

    return count;
  }

  toggleFlag(row, column) {
    this.checkCoordinates(row, column);

    let dot = this._dots[row][column].getDot();

    if (this._gameStatus === constants.GAME_PLAYING) {

      if (dot.isRevealed()) {
        console.log("Cannot flag a dot that is already revealed.");
      } else {
        dot = this._dots[row][column].toggleFlag();
        if (dot.isFlagged()) {
          this._numDotsFlagged++;
        } else {
          this._numDotsFlagged--;
        }
      }

      if (this._isDebugMode || this._isConsoleMode) this.showBoard();

      return dot;

    } else {
      this.showGameStatusMessage();
      return false;
    }
  }

  getNumDotsFlagged() {
    return this._numDotsFlagged;
  }

  getGameStatus() {
    return this._gameStatus;
  }

  showGameStatusMessage() {
     if (this._gameStatus === constants.GAME_WON) {

      console.log(`${constants.GAME_OVER_MSG}. You already won! Want to play again?`);

    } else if (this._gameStatus === constants.GAME_LOST) {

      console.log(`${constants.GAME_OVER_MSG}! You already lost. Please try again.`);

    }
  }

  checkCoordinates(row, column) {
    if (typeof row === "undefined" || typeof column === "undefined" || 
      row > this._rows || column > this._columns || 
      row < 0 || column < 0) {

      throw new Error("Row or column number is invalid.");
    }
  }

  getNumDots() {
    return this._rows * this._columns;
  }

  showBoard() {
    for (var i = 0; i < this._rows; i++) {
      let str = "";
      for (var j = 0; j < this._columns; j++) {
        let dot = this._dots[i][j];

        str += `${dot.getId()}` + 
                `${this._isDebugMode || (this._isConsoleMode && dot.shouldShowNumNeighborBombs()) ? ':' + dot.numNeighborBombs() : '  '}` + 
                `${dot.isRevealed() ? ':R' : '  '}` + 
                `${dot.isFlagged() ? ':F' : '  '}` + 
                `${dot.hasBomb() && (this._isDebugMode || this._gameStatus !== constants.GAME_PLAYING) ? ':B' : '  '}` +
                `|`;
      }
      console.log(str);
    }
    console.log(`********************`);
  }
}

module.exports = Board;

/*let textGame = new Board({
  rows: 9,
  columns: 9,
  bombs: 3,
  isDebugMode: true,
  isConsoleMode: true
});

textGame.showBoard();*/