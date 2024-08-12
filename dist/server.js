"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fastify_1 = __importDefault(require("fastify"));
const cors_1 = __importDefault(require("@fastify/cors"));
const route_1 = require("./route/route");
const luxon_1 = require("luxon");
const server = (0, fastify_1.default)({});
async function startServer() {
    try {
        await Promise.all([
            server.register(cors_1.default, {
                origin: ['http://localhost:8081', 'http://localhost:3000'],
                methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS']
            }),
            (0, route_1.registerRoutes)(server)
        ]);
        await server.listen({ port: 9841 });
        console.info(`Server started in ${luxon_1.DateTime.now().setZone('America/Sao_Paulo').toJSDate().toString()}`);
    }
    catch (err) {
        server.log.error(err);
        process.exit(1);
    }
}
startServer().catch(err => {
    console.error(err);
    process.exit(1);
});
