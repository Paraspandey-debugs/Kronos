"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.compressorHandler = void 0;
const compressorHandler = async (payload) => {
    console.log(` Compressing data for: ${payload.file || 'unknown'}`);
    await new Promise(resolve => setTimeout(resolve, 1500));
    return {
        compressionRatio: '60%',
        status: 'success',
    };
};
exports.compressorHandler = compressorHandler;
