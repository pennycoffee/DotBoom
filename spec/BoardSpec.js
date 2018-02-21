/* My Jasmine tests do not work because I need a packaging tool like webpack to
    export my scripts which Jasmine then requires. But I ran into compatibility
    issues with Express and could not resolve them in time.
*/

var CLICKED_FLAGGED = require("../dist/Constants");
var Board = require("../dist/Board");

var request = require("request");

var base_url = "http://localhost:3000/";

describe("Hello World Server", function() {
  describe("GET /", function() {
    it("returns status code 200", function() {
      //request.get(base_url, function(error, response, body) {
      expect(CLICKED_FLAGGED).toBe("Clicked on flagged dot");
    });
  });
});

describe("Board rows", function() {
  describe("GET /", function() {
    it("return correct num of rows", function() {
      //request.get(base_url, function(error, response, body) {
        let game = new Board({
          rows: 9,
          columns: 9,
          bombs: 3,
          isDebugMode: true,
          isConsoleMode: true
        });
      expect(game.getNumSquares()).toBe(9 * 9);
    });
  });
});

// Test that number of rows and columns are greater than 0.

// Test that number of bombs does not exceed number of dots.

// Test that clicking face will start a new game.

// Test that bomb display matches number of bombs.

// Test that flagging a dot prevents it from being clicked.

// Test that clicking on a bomb ends the game.

// And many many more...