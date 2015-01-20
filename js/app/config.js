/**
 * General configuration information
 * @module app/config
 */
define(function(){
    "use strict"

    /**
     * @alias module:app/config
     * @namespace
     * @property {object}  config                   - Configuration options
     * @property {object}  config.game              - General game configuration
     * @property {number}  config.game.width        - Width of the canvas in px
     * @property {number}  config.game.height       - Height of the canvas in px
     *
     * @property {object}  config.grid              - Grid settings
     * @property {number}  config.grid.size         - Width/Height of the grid in px
     * @property {number}  config.grid.numCells     - Number of cells per row/column
     * @property {number}  config.grid.linesVisible - Hide/show grid lines
     *
     * @property {object}  config.color             - Color options
     * @property {number}  config.color.unbreakable  - Color of the central unbreakable blocks
     * @property {number}  config.color.available    - List of colors used for levels in ascending order
     *
     * @property {object}  config.generator              - Generator settings
     * @property {number}  config.generator.defaultWait  - Time in seconds to wait before dropping a quad
     */
    var config = {
        game : {
            width : 700,
            height : 700
        },
        grid : {
            size : 480,
            numCells : 20,
            linesVisible : true
        },
        color : {
            unbreakable : 0xFFFFFF,
            available : [0xFF8C00, 0x00008B]
        },
        generator : {
            defaultWait : 4
        }
    };

    return config;
})
