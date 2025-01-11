"use strict";
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.db = void 0;
var client_1 = require("@prisma/client");
var globalForPrisma = globalThis;
exports.db = (_a = globalForPrisma.prisma) !== null && _a !== void 0 ? _a : new client_1.PrismaClient({
    transactionOptions: {
        timeout: 10000,
        maxWait: 5000,
    },
});
if (process.env.NODE_ENV !== 'production')
    globalForPrisma.prisma = exports.db;
