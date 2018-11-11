#!/usr/bin/env node

const axios = require('axios');
const cache = require('memory-cache');

const WEEK_IN_MS = (7 * 24 * 60 * 60 * 1000);

module.exports = class CoinMarketCalendarClient {
  constructor({ clientId, clientSecret }) {
    this.clientId = clientId;
    this.clientSecret = clientSecret;
    this.accessToken = null;
  }


  async authenticate() {
    const cachedAccessToken = cache.get('access_token');
    if (cachedAccessToken) {
      this.accessToken = cachedAccessToken;
      return;
    }

    const authUrl = 'https://api.coinmarketcal.com/oauth/v2/token';

    try {
      const authResponse = await axios(authUrl, {
        params: {
          grant_type: 'client_credentials',
          client_id: this.clientId,
          client_secret: this.clientSecret,
        },
      });

      if (authResponse.data && authResponse.data.access_token) {
        this.accessToken = authResponse.data.access_token;
        cache.put('access_token', this.accessToken, authResponse.data.expires_in * 1000);
      }
    } catch (e) {
      if (e.response && e.response.status === 400) {
        console.log('Something went wrong. Check if your client credentials are correct');
      } else if (e.code === 'ENOTFOUND') {
        console.log('Unable to connect to server. Check your internet connection');
      } else {
        console.log(e);
      }
    }
  }


  async getCoins() {
    // If cache has fresh,non-empty coin list, return that.
    const cachedCoinList = cache.get('coins');
    if (cachedCoinList && Array.isArray(cachedCoinList) && cachedCoinList.length > 0) {
      return cachedCoinList;
    }


    const coinsUrl = 'https://api.coinmarketcal.com/v1/coins';

    if (this.accessToken == null) {
      await this.authenticate();
    }

    try {
      const response = await axios(coinsUrl, {
        params: {
          access_token: this.accessToken,
        },
      });

      const coins = response.data;

      if (coins && Array.isArray(coins) && coins.length > 0) {
        cache.put('coins', coins, WEEK_IN_MS);
        return coins;
      }
    } catch (e) {
      if (e.response && e.response.status === 401) {
        console.log('Authentication failed. Try again.');
        this.accessToken = null;
        cache.del('access_token');
      } else if (e.code === 'ENOTFOUND') {
        console.log('Unable to connect to server. Check your internet connection');
      } else {
        console.log(e);
      }
    }

    return null;
  }


  async getCategories() {
    // If cache has fresh,non-empty category list, return that.
    const cachedCategoryList = cache.get('categories');
    if (cachedCategoryList && Array.isArray(cachedCategoryList) && cachedCategoryList.length > 0) {
      return cachedCategoryList;
    }

    const categoriesUrl = 'https://api.coinmarketcal.com/v1/categories';

    if (this.accessToken == null) {
      await this.authenticate();
    }

    try {
      const response = await axios(categoriesUrl, {
        params: {
          access_token: this.accessToken,
        },
      });

      const categories = response.data;

      if (categories && Array.isArray(categories) && categories.length > 0) {
        cache.put('categories', categories, WEEK_IN_MS);
        return categories;
      }
    } catch (e) {
      if (e.response && e.response.status === 401) {
        console.log('Authentication failed. Try again.');
        this.accessToken = null;
        cache.del('access_token');
      } else if (e.code === 'ENOTFOUND') {
        console.log('Unable to connect to server. Check your internet connection');
      } else {
        console.log(e);
      }
    }

    return null;
  }


  async getEvents({
    page = 1, max = 150, coins, categories,
  }) {
    const eventsUrl = 'https://api.coinmarketcal.com/v1/events';

    if (this.accessToken == null) {
      await this.authenticate();
    }

    const params = { access_token: this.accessToken, page, max };

    if (coins) {
      params.coins = coins.join(',');
    }

    if (categories) {
      params.categories = categories.join(',');
    }

    try {
      const eventsResponse = await axios(eventsUrl, { params });

      if (eventsResponse.data) {
        return eventsResponse.data;
      }
    } catch (e) {
      if (e.response && e.response.status === 401) {
        console.log('Authentication failed. Try again.');
        this.accessToken = null;
        cache.del('access_token');
      } else if (e.code === 'ENOTFOUND') {
        console.log('Unable to connect to server. Check your internet connection');
      } else {
        console.log(e);
      }
    }

    return null;
  }

  async getCoinIdsFromSymbols(coinSymbols) {
    if (coinSymbols == null || !Array.isArray(coinSymbols) || coinSymbols.length === 0) {
      return [];
    }

    const coinList = await this.getCoins();

    return coinList
      .filter(coin => coinSymbols.includes(coin.symbol.toUpperCase()))
      .map(coin => coin.id);
  }
};
