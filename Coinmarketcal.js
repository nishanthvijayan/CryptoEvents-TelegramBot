#!/usr/bin/env node

const axios = require('axios');
const cache = require('memory-cache');
const coinsList = require('./coins.json');
const categoriesList = require('./categories.json');

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

    return coinsList
      .filter(coin => coinSymbols.includes(coin.symbol.toUpperCase()))
      .map(coin => coin.id);
  }
};
