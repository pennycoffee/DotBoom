/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, {
/******/ 				configurable: false,
/******/ 				enumerable: true,
/******/ 				get: getter
/******/ 			});
/******/ 		}
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = 4);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, exports) {

module.exports = {
  CLICKED_FLAGGED: "Clicked on flagged dot",
  CLICKED_REVEALED: "Clicked on revealed dot",
  DOTS_REVEALED: "One or more dots revealed",
  CLICKED_BOMB: "Clicked on bomb",
  WON_GAME: "Clicked on winning dot",
  GAME_PLAYING: "Playing",
  GAME_LOST: "You lost",
  GAME_WON: "You won",
  GAME_OVER_MSG: "GAME OVER",
  CREATE_FAILURE_MSG: "Failed to create game."
}


/***/ }),
/* 1 */
/***/ (function(module, exports, __webpack_require__) {

let Dot = __webpack_require__(2);

let constants = __webpack_require__(0);

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

/***/ }),
/* 2 */
/***/ (function(module, exports) {

class Dot {
  constructor(args) {
    this._id = args.id;
    this._hasBomb = args.hasBomb;
    this._isDebugMode = args.isDebugMode;
    this._isConsoleMode = args.isConsoleMode;
    this._isClicked = false;
    this._numNeighborBombs = 0;
    this._hasNeighborBombs = false;
    this._shouldShowNumNeighborBombs = false;
    this._isFlagged = false;
    this._isRevealed = false;
    this._neighbors = [];
  }

  _clickNeighbors(changedDots) {
    // Check this._isClicked to guard against infinite recursion :-)
    if (!this._isClicked && !this._isRevealed && !this._isFlagged) {

      this._isRevealed = true;
      this._shouldShowNumNeighborBombs = true;
      changedDots.push(this);

      if (!this._hasBomb && !this._hasNeighborBombs) {
        this._neighbors.map((dot) => {dot._clickNeighbors(changedDots)});
      }

      this._isClicked = true;
    }
  }

  /**
   * Returns array of: 
   * One (if dot is flagged, dot has bomb, or already revealed),
   * One or more (else scenario).
   * @returns {Array} 
   *
   * Note: Let parent handle if dot is flagged or has bomb.
   */
  click() {
    let changedDots = [];

    if (this._isFlagged || this._hasBomb || this._isRevealed || this._hasNeighborBombs) {

      changedDots.push(this);

      if (!this._isFlagged && this._hasNeighborBombs) {
        this._isRevealed = true;
        this._shouldShowNumNeighborBombs = true;
      }

    } else {
      // Collect and return array of dots that were modified.
      // Used to help the UI (for example) to re-render changed dots.
      this._clickNeighbors(changedDots);
    }

    return changedDots;
  }

  getDot() {
    return this;
  }

  getId() {
    return this._id;
  }

  isClicked() {
    return this._isClicked;
  }

  setClicked(clicked) {
    this._isClicked = clicked;
  }

  hasBomb() {
    return this._hasBomb;
  }

  setHasBomb(num) {
    this._numNeighborBombs = num;
  }

  numNeighborBombs() {
    return this._numNeighborBombs;
  }

  setNumNeighborBombs(num) {
    return this._numNeighborBombs = num;
  }

  hasNeighborBombs() {
    return this._hasNeighborBombs;
  }

  setHasNeighborBombs(hasNeighborBombs) {
    return this._hasNeighborBombs = hasNeighborBombs;
  }
  
  shouldShowNumNeighborBombs() {
    return this._shouldShowNumNeighborBombs;
  }

  isFlagged() {
    return this._isFlagged;
  }

  isRevealed() {
    return this._isRevealed;
  }

  getNeighbors() {
    return this._neighbors;
  }

  addNeighbor(dot) {
    return this._neighbors.push(dot);
  }

  toggleFlag() {

    if (!this._isRevealed) {
      this._isFlagged = !this._isFlagged;
    }

    return this;
  }
}

module.exports = Dot;

/***/ }),
/* 3 */
/***/ (function(module, exports, __webpack_require__) {

let constants = __webpack_require__(0);

let Board = __webpack_require__(1);

class BoardUI {
  constructor(args) {
    this._rows = args.rows;
    this._columns = args.columns;
    this._bombs = args.bombs || 0;
    this._boardDOM = args.boardDOM;
    this._isDebugMode = args.isDebugMode;
    this._isConsoleMode = args.isConsoleMode;

    this._createDotfield(args);
    this._createBoard(this._rows, this._columns);
  }

  _createDotfield(args) {
    try { 
      this._dotField = new Board({
        rows: this._rows,
        columns: this._columns,
        bombs: this._bombs,
        isDebugMode: this._isDebugMode,
        isConsoleMode: this._isConsoleMode
      });
    } catch (e) {
      throw e;
    }
  }

  _createBoard(rows, columns) {
    try {
      this._boardDOM.setAttribute("style", `width:${this._columns * 30}px; height:${this._rows * 30}px`);

      for (var i = 0; i < rows; i++) {
        for (var j = 0; j < columns; j++) {
          let dotId = `${i}-${j}`,
              dot = document.createElement("div"),
              numNeighborBombs = this._dotField.getDotNumNeighborBombs(i, j),
              dotText = document.createTextNode(numNeighborBombs || ""),
              numNeighborBombStyleClass = "";

          dot.appendChild(dotText);
          this._boardDOM.appendChild(dot);

          dot.id = dotId;
          dot.classList.add("dot");

          switch (numNeighborBombs) {
            case 1:
              numNeighborBombStyleClass = "one";
              break;
            case 2:
              numNeighborBombStyleClass = "two";
              break;
            case 3:
              numNeighborBombStyleClass = "three";
              break;
            case 4:
              numNeighborBombStyleClass = "four";
              break;
            case 5:
              numNeighborBombStyleClass = "five";
              break;
            case 6:
              numNeighborBombStyleClass = "six";
              break;
            case 7:
              numNeighborBombStyleClass = "seven";
              break;
            case 8:
              numNeighborBombStyleClass = "eight";
              break;
          }

          numNeighborBombStyleClass && dot.classList.add(numNeighborBombStyleClass);
        }
      }
    } catch (e) {
      throw e;
    }
  }

  click(row, column) {
    // parseInt applied to fix bug where dot is not recognized after game dimensions changed.
    return this._dotField.click(parseInt(row), parseInt(column));
  }

  toggleFlag(row, column) {
    // parseInt applied to fix bug where dot is not recognized after game dimensions changed.
    return this._dotField.toggleFlag(parseInt(row), parseInt(column));
  }

  getNumDotsFlagged() {
    return this._dotField.getNumDotsFlagged();
  }

  getGameStatus() {
    return this._dotField.getGameStatus();
  }

  cleanup() {
    if (this._isDebugMode) console.log("BoardUI ended game.");

    this._dotField = null;
    delete this._dotField;
  }

  showBoardDebug() {
    this._dotField.showBoard();
  }
}

module.exports = BoardUI;
/*
let boardUI = new BoardUI({
  rows: 9,
  columns: 9,
  bombs: 10,
  boardDOM: document.getElementById("dotfield"),
  isDebugMode: false,
  isConsoleMode: false
});*/

/***/ }),
/* 4 */
/***/ (function(module, exports, __webpack_require__) {

__webpack_require__(5);
__webpack_require__(1);
__webpack_require__(3);
__webpack_require__(0);
__webpack_require__(7);
module.exports = __webpack_require__(2);


/***/ }),
/* 5 */
/***/ (function(module, exports, __webpack_require__) {

__webpack_require__(6);

//var hello = document.getElementById("hello");
//hello.innerHTML = "Hello World!";



/***/ }),
/* 6 */
/***/ (function(module, exports, __webpack_require__) {

module.exports = __webpack_require__.p + "index.html";

/***/ }),
/* 7 */
/***/ (function(module, exports, __webpack_require__) {

let constants = __webpack_require__(0);

let BoardUI = __webpack_require__(3);

class GameUI {
  constructor(args) {
    // Set via _startHelper()
    this._rows = 0;
    this._columns = 0;
    this._bombs = 0;

    this._gameDOM = args.gameDOM;
    this._gameDisplayDOM = args.gameDisplayDOM;
    this._boardDOM = args.boardDOM;
    this._bombsLeftDOM = args.bombsLeftDOM;
    this._faceDOM = args.faceDOM;
    this._timerDOM = args.timerDOM;
    this._timerMax = args.timerMax;
    this._changeRowsDOM = args.changeRowsDOM;
    this._changeColumnsDOM = args.changeColumnsDOM;
    this._changeBombsDOM = args.changeBombsDOM;
    this._changeGameButtonDOM = args.changeGameButtonDOM;
    this._isDebugMode = args.isDebugMode;
    this._isConsoleMode = args.isConsoleMode;

    this._board = null; // Set via _startHelper().

    this._timerId = null;
    this._timerCountUp = 0; // Set _startHelper().

    this._startGame(args);

    this._addEventHandlers();
  }

  _createBoard(args) {
    if (this._isDebugMode) console.log("GameUI created new game.");

    // Kludge for UI: game display squishes too much if too few columns.
    if (args.columns < 6) {
      throw new Error("Please specify at least six columns.");
    }

    try {
      return new BoardUI({
        rows: args.rows,
        columns: args.columns,
        bombs: args.bombs,
        boardDOM: this._boardDOM,
        isDebugMode: this._isDebugMode,
        isConsoleMode: this._isConsoleMode
      });
    } catch (e) {
      throw e;
    }
  }

  _resizeGame() {
    // Kludge: need the extra 5px for perfect alignment. Find CSS solution in v2.
    let width = this._columns * 30 + 5;
    this._gameDOM.setAttribute("style", `width:${width}px;`);
    this._gameDisplayDOM.setAttribute("style", `width:${width}px;`);
  }

  _addEventHandlers() {
    this._addClickHandler();
    this._addRightClickHandler();
    this._addRestartHandler();
    this._addMouseDownHandler();
    this._addMouseUpHandler();
    this._addChangeGameHandler();
  }

  _addClickHandler() {
    this._boardDOM.addEventListener("click", this._clickFunction.bind(this));
  }

  _clickFunction(evt) {
    let dotDOM = evt.target,
        [row, column] = dotDOM.id.split("-"),
        click = this._board.click(row, column),
        status = click.status,
        changedDots = click.dots,
        bombs = click.bombs;

    if (status === constants.GAME_WON || status === constants.GAME_LOST || status === constants.CLICKED_REVEALED || status === constants.CLICKED_FLAGGED) {
      
      // Ignore click.
      
      if (this._isDebugMode) console.log(`click.status = ${status}`);

    } else if (status === constants.CLICKED_BOMB) {

      document.getElementById(bombs[0].getId()).classList.add("click"); // Red background.
      this._addClass(bombs, "revealbomb");

      this._faceDOM.classList.add("sad");

      this._stopTimer();

    } else if (status === constants.WON_GAME) {

      this._addClass(bombs, "flag");
      this._addClass(changedDots, "reveal");

      this._faceDOM.classList.add("sunglasses");

      this._stopTimer();

    } else { // Reveal dots.
      this._addClass(changedDots, "reveal");

      if (!this._timerId) this._startTimer();
    }

    this._setBombsLeft(); // Kludge: Keep this updated. Display zero for bombs left display when user wins or loses.
  }

  _addRightClickHandler() {
    this._boardDOM.addEventListener("contextmenu", this._rightClickFunction.bind(this));
  }

  _rightClickFunction(evt) {
    let flaggedDotDOM = evt.target,
        [row, column] = flaggedDotDOM.id.split("-"),
        flaggedDot = this._board.toggleFlag(row, column);
    
        !flaggedDot.isRevealed() && flaggedDotDOM.classList.toggle("flag");

        this._setBombsLeft();

    evt.preventDefault(); // Do not display context menu.
  }

  _addMouseDownHandler() {
    this._boardDOM.addEventListener("mousedown", (evt) => {
      if (this._board.getGameStatus() === constants.GAME_PLAYING) {
        this._faceDOM.classList.add("ooh");
      }
    });
  }

  _addMouseUpHandler() {
    this._boardDOM.addEventListener("mouseup", (evt) => {
      if (this._board.getGameStatus() === constants.GAME_PLAYING) {
        this._faceDOM.classList.remove("ooh");
      }
    });
  }

  _addChangeGameHandler() {
    this._changeGameButtonDOM.addEventListener("click", (evt) => {
      evt.preventDefault();
      this.restartGame({
        rows: this._changeRowsDOM.value,
        columns: this._changeColumnsDOM.value,
        bombs: this._changeBombsDOM.value
      });
    });
  }

  // Display number of bombs left based on how many dots are flagged.
  // This represents a player's guess.
  _setBombsLeft() {
    let bombsLeft = this._bombs - this._board.getNumDotsFlagged();

    this._bombsLeftDOM.textContent = `${bombsLeft}`.padStart(3,0);
  }

  _addRestartHandler() {
    this._faceDOM.addEventListener("click", (evt) => {
      this.restartGame({
        rows: this._rows,
        columns: this._columns,
        bombs: this._bombs
      }); 
    });
  }

  _addClass(dots, className) {
    if (Array.isArray(dots)) {
      dots.map((dot) => {
        document.getElementById(dot.getId()).classList.add(className);
      });
    }
  }

  _timer() {
    if(this._timerCountUp <= this._timerMax) {
      this._timerDOM.textContent = `${this._timerCountUp++}`.padStart(3,0);
    }
  }

  _startTimer() {
    this._timerId = window.setInterval(this._timer.bind(this), 1000);
  }

  _stopTimer() {
    window.clearInterval(this._timerId);
    this._timerId = null;
    this._timerCountUp = 0;
    this._timerDOM.textContent = "000";
  }

  _removeBoard() {
    let childNode = null;

    while (childNode = this._boardDOM.firstChild) {
      this._boardDOM.removeChild(childNode);
    }

    this._board.cleanup();
    this._board = null;
    delete this._board;
  }

  _startGame(args) {
    if (this._isDebugMode) console.log("GameUI started game.");

    try {
      this._startHelper(args);
    } catch (e) {
      window.alert(e);
    }
  }

  _startHelper(args) {
    this._rows = args.rows;
    this._columns = args.columns;
    this._bombs = args.bombs;

    try {
      this._board = this._createBoard(args);
    } catch (e) {
      throw e;
    }

    this._resizeGame();

    this._stopTimer();

    this._setBombsLeft();
  }  

  getGameStatus() {
    return this._board.getGameStatus();
  }

  restartGame(args) {
    if (this._isDebugMode) console.log("GameUI restarted game.");

    this.endGame();

    try {
      this._startHelper(args);
    } catch (e) {
      window.alert(`${e} Please reload page.`);
    }

    this._faceDOM.classList.remove("sunglasses");
    this._faceDOM.classList.remove("sad");
  }

  endGame() {
    if (this._isDebugMode) console.log("GameUI ended game.");

    this._removeBoard();
  }

  showBoardDebug() {
    this._board.showBoardDebug();
  }
}

let gameUI = new GameUI({
  rows: 9,
  columns: 9,
  bombs: 10,
  gameDOM: document.getElementById("game"),
  gameDisplayDOM: document.getElementById("gamedisplay"),
  boardDOM: document.getElementById("dotfield"),
  bombsLeftDOM: document.getElementById("bombsleft"),
  faceDOM: document.getElementById("face"),
  timerDOM: document.getElementById("timer"),
  changeRowsDOM: document.getElementById("rows"),
  changeColumnsDOM: document.getElementById("columns"),
  changeBombsDOM: document.getElementById("bombs"),
  changeGameButtonDOM: document.getElementById("changegame"),
  timerMax: 999,
  isDebugMode: true,
  isConsoleMode: false
});

/***/ })
/******/ ]);