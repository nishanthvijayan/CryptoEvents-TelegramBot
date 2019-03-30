#!/usr/bin/env node

const axios = require('axios');
const coinsList = require('./coins.json');
const { isNonEmptyArray, isEmptyArray } = require('./utils');

module.exports = class CoinMarketCalendarClient {
  constructor({ apiKey }) {
    this.defaultHeaders = {
      'x-api-key': apiKey,
      'Accept-Encoding': 'deflate, gzip',
      Accept: 'application/json',
    };
  }

  handleAPIError(e) {
    if (e.response && e.response.status === 403) {
      console.log('Authentication failed. Invalid API Key.');
    } else if (e.response && e.response.status === 429) {
      console.log('API usage quota exceeded');
    } else if (e.code === 'ENOTFOUND') {
      console.log('Unable to connect to server. Check your internet connection');
    } else {
      console.log(e);
    }
  }

  async getEvents({
    page = 1, max = 150, coins, categories,
  }) {
    const eventsUrl = 'https://developers.coinmarketcal.com/v1/events';

    const params = { page, max };

    if (isNonEmptyArray(coins)) {
      params.coins = coins.join(',');
    }

    if (isNonEmptyArray(categories)) {
      params.categories = categories.join(',');
    }

    try {
      const eventsResponse = await axios(eventsUrl, { params, headers: this.defaultHeaders });

      if (eventsResponse.data == null) {
        throw Error('Invalid response, Response did not contain body key');
      }

      return eventsResponse.data.body || [];
    } catch (e) {
      this.handleAPIError(e);
    }

    return null;
  }

  async getCoinIdsFromSymbols(coinSymbols) {
    if (isEmptyArray(coinSymbols)) {
      return [];
    }

    return coinsList
      .filter(coin => coinSymbols.includes(coin.symbol.toUpperCase()))
      .map(coin => coin.id);
  }
};
