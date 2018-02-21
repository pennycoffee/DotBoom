let constants = require("./Constants");

let BoardUI = require("./BoardUI");

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