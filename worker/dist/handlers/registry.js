"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handlerRegistry = void 0;
const scout_handler_1 = require("./scout.handler");
const compressor_handler_1 = require("./compressor.handler");
exports.handlerRegistry = {
    scout: scout_handler_1.scoutHandler,
    compressor: compressor_handler_1.compressorHandler,
};
