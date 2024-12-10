"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerRoutes = void 0;
const authRoute_1 = require("./authRoute");
const productRoute_1 = require("./productRoute");
const favoriteRoute_1 = require("./favoriteRoute");
const cartRoute_1 = require("./cartRoute");
const priceRoute_1 = require("./priceRoute");
const confirmRoute_1 = require("./confirmRoute");
const registerRoute_1 = require("./registerRoute");
const restaurantRoute_1 = require("./restaurantRoute");
const registerRoutes = async (server) => {
    await Promise.all([server.register(authRoute_1.authRoute),
        server.register(productRoute_1.productRoute),
        server.register(favoriteRoute_1.favoriteRoute),
        server.register(cartRoute_1.cartRoute),
        server.register(priceRoute_1.priceRoute),
        server.register(confirmRoute_1.confirmRoute),
        server.register(registerRoute_1.registerRoute),
        server.register(restaurantRoute_1.restaurantRoute)
    ]);
};
exports.registerRoutes = registerRoutes;
