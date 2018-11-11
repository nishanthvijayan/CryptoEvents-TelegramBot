const CoinMarketCalendarClient = require('./Coinmarketcal');
const { initializeResponseHandler } = require('./bot');
const axios = require('axios');

const {
  clientId,
  clientSecret,
  telegramToken,
} = require('./secrets.json');


const coinmarketcalApi = new CoinMarketCalendarClient({
  clientId,
  clientSecret,
});

const RESPONSE_URL = `https://api.telegram.org/bot${telegramToken}/sendMessage`;
const responseHandler = initializeResponseHandler(coinmarketcalApi);

exports.handler = async (event) => {
  const messageText = event.message.text;
  const chatId = event.message.chat.id;
  const responseMsg = {
    text: (await responseHandler(messageText)),
    chat_id: chatId,
  };

  await axios.post(RESPONSE_URL, responseMsg);

  return {
    statusCode: 200,
    body: 'success',
  };
};
