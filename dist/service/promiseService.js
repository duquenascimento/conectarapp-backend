"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.rejectPendingRequest = exports.resolvePendingRequest = exports.addPendingRequest = exports.pendingRequests = void 0;
exports.pendingRequests = new Map();
const addPendingRequest = (requestId) => {
    return new Promise((resolve, reject) => {
        exports.pendingRequests.set(requestId, { resolve, reject });
    });
};
exports.addPendingRequest = addPendingRequest;
const resolvePendingRequest = (requestId, data) => {
    const pending = exports.pendingRequests.get(requestId);
    if (pending) {
        pending.resolve(data);
        exports.pendingRequests.delete(requestId);
    }
};
exports.resolvePendingRequest = resolvePendingRequest;
const rejectPendingRequest = (requestId, error) => {
    const pending = exports.pendingRequests.get(requestId);
    if (pending) {
        pending.reject(error);
        exports.pendingRequests.delete(requestId);
    }
};
exports.rejectPendingRequest = rejectPendingRequest;
