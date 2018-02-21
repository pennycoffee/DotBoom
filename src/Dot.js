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