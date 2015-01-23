/**
 * Exposes a singleton Grid which defines the main gameplay field
 * @module app/grid
 */
define(["app/config", "Phaser"], function(config, Phaser){
    "use strict"

    /**
     * A group of four Blocks arranged in a square.
     * @constructor
     * @alias module:app/grid
     */
    var Grid = function(){
        this.cellSize = config.grid.size / config.grid.numCells;

        // Center the grid
        this.offsets = {
            x : config.game.width/2 - config.grid.size/2,
            y : config.game.height/2 - config.grid.size/2
        }

        /**
         * The coordinate of the middle of the indestructible quad
         *
         * @type {object}
         */
        this.middle = {x: config.grid.numCells/2,
                       y: config.grid.numCells/2};

        /**
         * The contents of the grid
         * @type {Block[][]}
         */
        this.contents = new Array(config.grid.numCells);
        for (var i=0; i < config.grid.numCells; ++i) {
            this.contents[i] = new Array(config.grid.numCells);
        }
    };

    /**
     * Show the grid of 'cells' that the blocks can be moved around on
     */
    Grid.prototype.display = function(game) {
        this.graphics = game.add.graphics(this.offsets.x, this.offsets.y);
        this.graphics.lineStyle(1, 0xFFFFFF, 0.2);

        if (config.grid.linesVisible) {
            // Draw rows and columns (start from one so the top and left aren't drawn twice)
            for (var i=1; i < config.grid.numCells; ++i) {
                this.graphics.drawRect(0, i*this.cellSize, config.grid.size, 1);
                this.graphics.drawRect(i*this.cellSize, 0, 1, config.grid.size);
            }
        }

        // Draw a border around the grid area
        this.graphics.drawRect(0, 0, config.grid.size, 1);
        this.graphics.drawRect(0, 0, 1, config.grid.size);
        this.graphics.drawRect(0, config.grid.size, config.grid.size, 1);
        this.graphics.drawRect(config.grid.size, 0, 1, config.grid.size);
        return this;
    }

    /**
     * Convert a coordinate in the grid to a point on the canvas
     *
     * @param {object} coord - An x, y coordinate on the grid
     * @returns {Phaser.Point} - The point at the upper left of the given cell coordinate
     */
    Grid.prototype.coordToPoint = function(coord) {
        var self=this;
        return new Phaser.Point(
            self.cellSize*coord.x + self.offsets.x,
            self.cellSize*coord.y + self.offsets.y
        );
    }

    /**
     * Utility function to retrieve item from grid.
     *
     * @param {number|object} x - The x coordinate or x, y object
     * @param {number} y - The y coordinate
     *
     * @returns {Block|null} The Block located at {x, y} or null if none exists
     */
    Grid.prototype.at = function(x, y) {
        var coord;
        if (typeof(x) == "object") {
            coord = x;
        } else {
            coord = {x: x, y:y};
        }

        if (!this.contents[coord.y]) {
            return null;
        } else {
            return this.contents[coord.y][coord.x];
        }
    }

    /**
     * Convert a direction and a position to a point on the canvas. The returned
     * position is the top left corner of the cell within the grid that is positioned
     * as far as possible in `direction` along column/row `position`.
     *
     * @param {string} direction - One of "left", "right", "top", or "bottom"
     * @param {number} position - A number indicating the row/column
     * @param {number} offset - A number indicating how far past the position, the
     *                          result should be padded
     * @returns {Phaser.Point}
     */
    Grid.prototype.directionToPoint = function(direction, position, offset) {
        var offset = offset || 0;
        switch(direction.toLowerCase()) {
        case "top":
            return this.coordToPoint({x: position, y: -1*offset});
            break;
        case "right":
            return this.coordToPoint({x: config.grid.numCells-1+offset,
                                      y: position});
            break;
        case "bottom":
            return this.coordToPoint({x: config.grid.numCells-1-position,
                                      y: config.grid.numCells-1+offset});
            break;
        case "left":
            return this.coordToPoint({x: -1*offset,
                                      y: config.grid.numCells-1-position});
            break;
        default:
            throw("Invalid argument to 'directionToPoint': " + direction);
        }
    }

    /**
     * Get the first free position on the grid when comming from `direction` at
     * `position`. This is the coordinate that a block should take if it is being
     * 'dropped'.
     *
     * @param {string} direction - One of "left", "right", "top", or "bottom"
     * @param {number} position - The index of the row or column of the block
     *                               being 'dropped'
     * @param {number} offset - Offset the returned coordinate by this value
     * @returns - The first free position when comming from `direction` at `position`
     */
    Grid.prototype.getFirstAvailable = function(direction, position, offset) {
        var coord;
        var offset = offset || 0;
        switch(direction.toLowerCase()) {
        case "top":
            for (var i=0; i < config.grid.numCells; ++i) {
                if (this.at(position, i)) {
                    coord = {x: position, y: i-1-offset};
                    break;
                }
            }
            break;
        case "right":
            for (var i=config.grid.numCells; i >= 0; --i) {
                if (this.at(i, position)) {
                    coord = {x: i+1+offset, y: position};
                    break;
                }
            }
            break;
        case "bottom":
            for (var i=config.grid.numCells-1; i >= 0; --i) {
                if (this.at(config.grid.numCells-1-position, i)) {
                    coord = {x: config.grid.numCells-1-position, y: i+1+offset};
                    break;
                }
            }
            break;
        case "left":
            for (var i=0; i < config.grid.numCells; ++i) {
                if (this.at(i, config.grid.numCells-1-position)) {
                    coord = {x: i-1-offset, y: config.grid.numCells-1-position};
                    break;
                }
            }
            break;
        default:
            throw("Invalid argument to 'getFirstAvailable': " + direction);
        }
        return coord;
    }

    /**
     * Slide the contents of the grid in 'direction'
     *
     * @param {string} direction - One of "top", "bottom", "left", or "right"
     */
    Grid.prototype.slide = function(direction) {
        var temporary = new Array(config.grid.numCells);
        for (var i=0; i < config.grid.numCells; ++i) {
            temporary[i] = new Array(config.grid.numCells);
        }
        switch(direction.toLowerCase()){
        case "top":
            var invalid = this.contents[0].some(function(val){
                return typeof(val) !== "undefined";
            });

            if (invalid) {
                return false;
            }

            this.contents.map(function(val, index){
                if (index != 0)
                    temporary[index-1] = val;
            }.bind(this));

            temporary.map(function(row){
                row.map(function(block){
                    if (block)
                        block.slide("top");
                }.bind(this));
            }.bind(this));
            this.middle.y -= 1;
            this.contents = temporary;
            return true;

        case "bottom":
            var invalid = this.contents[config.grid.numCells-1]
                .some(function(val){
                    return typeof(val) !== "undefined";
                });

            if (invalid) {
                return false;
            }

            this.contents.map(function(val, index){
                if (index != config.grid.numCells-1)
                    temporary[index+1] = val;
            }.bind(this));

            temporary.map(function(row){
                row.map(function(block){
                    if (block)
                        block.slide("bottom");
                }.bind(this));
            }.bind(this));
            this.middle.y += 1;
            this.contents = temporary;
            return true;

        case "left":
            for (var i=0; i < config.grid.numCells; ++i){
                if (this.at(0, i))
                    return false;
            }

            this.contents.map(function(row, y){
                row.map(function(val, x){
                    temporary[y][x-1] = val;
                }.bind(this));
            }.bind(this));

            temporary.map(function(row){
                row.map(function(block){
                    if (block)
                        block.slide("left");
                }.bind(this));
            }.bind(this));
            this.middle.x -= 1;
            this.contents = temporary;
            return true;
        case "right":
            for (var i=0; i < config.grid.numCells; ++i){
                if (this.at(config.grid.numCells-1, i))
                    return false;
            }

            this.contents.map(function(row, y){
                row.map(function(val, x){
                    temporary[y][x+1] = val;
                }.bind(this));
            }.bind(this));

            temporary.map(function(row){
                row.map(function(block){
                    if (block)
                        block.slide("right");
                }.bind(this));
            }.bind(this));
            this.middle.x += 1;
            this.contents = temporary;
            return true;
        default:
            throw("Invalid argument to Quad.slide: " + direction)
        }
    }

    /**
     * Alias for Grid.slide("top")
     */
    Grid.prototype.slideUp = function(){
        return this.slide("top");
    }

    /**
     * Alias for Grid.slide("bottom")
     */
    Grid.prototype.slideDown = function(){
        return this.slide("bottom");
    }

    /**
     * Alias for Grid.slide("left")
     */
    Grid.prototype.slideLeft = function(){
        return this.slide("left");
    }

    /**
     * Alias for Grid.slide("right")
     */
    Grid.prototype.slideRight = function(){
        return this.slide("right");
    }

    /**
     * Remove any 'floating' single blocks
     *
     * @returns the number of blocks destoyed
     */
    Grid.prototype.cleanup = function(){
        var totalCleared = 0;
        for (var i=0; i < config.grid.numCells; ++i) {
            for (var j=0; j < config.grid.numCells; ++j) {
                if (this.at(i, j) &&
                    !this.at(i+1, j) && !this.at(i, j+1) &&
                    !this.at(i-1, j) && !this.at(i, j-1)) {
                    this.at(i, j).destroy();
                    totalCleared += 1;
                }
            }
        }
        return totalCleared;
    }

    /**
     * The singleton gameplay grid
     * @type {Grid}
     */
    var grid = new Grid();

    return grid;
})
