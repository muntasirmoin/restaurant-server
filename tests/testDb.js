"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.clearTestDB = exports.disconnectTestDB = exports.connectTestDB = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const dotenv_1 = __importDefault(require("dotenv"));
const socket_io_1 = require("socket.io");
const sockets_1 = require("../src/app/sockets");
dotenv_1.default.config();
const TEST_DB_URL = process.env.TEST_DB_URL;
const connectTestDB = () => __awaiter(void 0, void 0, void 0, function* () {
    if (!TEST_DB_URL) {
        throw new Error("TEST_DB_URL is not set in .env -- point it at a dedicated test database (e.g. restaurant_test), never your real one");
    }
    yield mongoose_1.default.connect(TEST_DB_URL);
    (0, sockets_1.initSocket)(new socket_io_1.Server());
});
exports.connectTestDB = connectTestDB;
const disconnectTestDB = () => __awaiter(void 0, void 0, void 0, function* () {
    yield mongoose_1.default.connection.dropDatabase();
    yield mongoose_1.default.connection.close();
});
exports.disconnectTestDB = disconnectTestDB;
const clearTestDB = () => __awaiter(void 0, void 0, void 0, function* () {
    const collections = mongoose_1.default.connection.collections;
    for (const key in collections) {
        yield collections[key].deleteMany({});
    }
});
exports.clearTestDB = clearTestDB;
