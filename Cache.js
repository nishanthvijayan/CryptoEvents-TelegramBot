const Configstore = require('conf');

const TEN_YEARS_IN_MS = 10 * 365 * 24 * 60 * 60 * 1000;

module.exports = class Cache {
  constructor() {
    this.store = new Configstore();
  }

  get(key) {
    if (this.store.has(key)) {
      const { validTill, data } = this.store.get(key);

      if (Date.now() < validTill) {
        return data;
      }
    }

    return null;
  }

  set(key, data, ttlInMs = TEN_YEARS_IN_MS) {
    const validTill = Date.now() + ttlInMs;
    return this.store.set(key, { validTill, data });
  }

  delete(key) {
    return this.store.delete(key);
  }
};
