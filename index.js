const CoinMarketCalendarClient = require('./Coinmarketcal');
const { initializeResponseHandler } = require('./bot');
const axios = require('axios');

const API_KEY = process.env.API_KEY
const TELEGRAM_TOKEN = process.env.TELEGRAM_TOKEN

const coinmarketcalApi = new CoinMarketCalendarClient({ API_KEY });

const RESPONSE_URL = `https://api.telegram.org/bot${TELEGRAM_TOKEN}/sendMessage`;
const responseHandler = initializeResponseHandler(coinmarketcalApi);

exports.handler = async (event) => {
  const messageText = event.message.text;
  const chatId = event.message.chat.id;

  const responseText = await responseHandler(messageText);

  await axios.post(RESPONSE_URL, {
    text: responseText,
    chat_id: chatId,
  });

  return {
    statusCode: 200,
    body: 'success',
  };
};
