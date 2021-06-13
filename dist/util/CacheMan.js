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
Object.defineProperty(exports, "__esModule", { value: true });
exports.CacheMan = void 0;
class CacheItem {
    constructor(value, duration) {
        this.value = null;
        this.duration = 10;
        this.value = value;
        this.duration = duration;
    }
}
class CacheMan {
    constructor() {
        this._cache = {};
        this._intervalId = 0;
    }
    init() {
        // Cache scheduller
        this._intervalId = setInterval(() => {
            for (const key in this._cache) {
                this._cache[key].duration -= 1;
                if (this._cache[key].duration <= 0) {
                    delete this._cache[key];
                }
            }
        }, 1000);
    }
    destroy() {
        clearInterval(this._intervalId);
    }
    smart(key, value, time = 10) {
        return __awaiter(this, void 0, void 0, function* () {
            if (this._cache[key]) {
                console.log(`Get from cache ${this._cache[key].duration}`);
                return this._cache[key].value;
            }
            console.log(`Add to cache ${time}`);
            const item = yield value();
            this._cache[key] = new CacheItem(item, time);
            return this._cache[key].value;
        });
    }
    /*putIfNotExists<T>(key: string, value: unknown, time: number = 10): T {
      if (!this._cache[key]) {
        this._cache[key] = new CacheItem(value, time);
      }
      return value as T;
    }*/
    put(key, value, time = 10) {
        this._cache[key] = new CacheItem(value, time);
    }
    get(key, defaultValue = null) {
        if (this._cache[key]) {
            return this._cache[key].value;
        }
        return defaultValue;
    }
    get stat() {
        let size = 0;
        let amount = 0;
        for (const key in this._cache) {
            amount += 1;
            try {
                size += this._cache[key].value.length;
            }
            catch (_a) { }
        }
        return {
            size,
            amount,
        };
    }
}
exports.CacheMan = CacheMan;
