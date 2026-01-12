"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.scoreAggregationQueue = void 0;
const bullmq_1 = require("bullmq");
const redisClient_1 = __importDefault(require("./redisClient"));
exports.scoreAggregationQueue = new bullmq_1.Queue('score-aggregation', {
    connection: redisClient_1.default,
});
