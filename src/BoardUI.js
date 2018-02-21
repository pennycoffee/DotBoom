let constants = require("./Constants");

let Board = require("./Board");

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