class CacheItem {
  value: unknown = null;
  duration: number = 10;

  constructor(value: unknown, duration: number) {
    this.value = value;
    this.duration = duration;
  }
}

export class CacheMan {
  _cache: Record<string, CacheItem> = {};
  _intervalId: any = 0;

  constructor() {}

  init(): void {
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

  destroy(): void {
    clearInterval(this._intervalId);
  }

  async smart<T>(key: string, value: () => Promise<T>, time: number = 10): Promise<T> {
    if (this._cache[key]) {
      console.log(`Get from cache ${this._cache[key].duration}`);
      return this._cache[key].value as T;
    }
    console.log(`Add to cache ${time}`);
    const item = await value();
    this._cache[key] = new CacheItem(item, time);
    return item as T;
  }

  /*putIfNotExists<T>(key: string, value: unknown, time: number = 10): T {
    if (!this._cache[key]) {
      this._cache[key] = new CacheItem(value, time);
    }
    return value as T;
  }*/

  put(key: string, value: unknown, time: number = 10): void {
    this._cache[key] = new CacheItem(value, time);
  }

  get<T>(key: string, defaultValue: unknown = null): T {
    if (this._cache[key]) {
      return this._cache[key].value as T;
    }
    return defaultValue as T;
  }

  get stat(): { size: number; amount: number } {
    let size = 0;
    let amount = 0;
    for (const key in this._cache) {
      amount += 1;
      try {
        size += (this._cache[key].value as any).length;
      } catch {}
    }

    return {
      size,
      amount,
    };
  }
}
