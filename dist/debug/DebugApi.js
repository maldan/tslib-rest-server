"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DebugApi = void 0;
const WS_Decorator_1 = require("../core/WS_Decorator");
const WebServer_1 = require("../WebServer");
class DebugApi {
    static get_index() {
        return 'sas';
    }
    static get_cacheInfo() {
        return WebServer_1.WebServer.cache.stat;
    }
}
DebugApi.path = 'debug';
__decorate([
    WS_Decorator_1.Config({
        useJsonWrapper: false,
    })
], DebugApi, "get_index", null);
exports.DebugApi = DebugApi;
