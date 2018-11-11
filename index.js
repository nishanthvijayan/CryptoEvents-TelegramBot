const CoinMarketCalendarClient = require('./Coinmarketcal');
const { initializeBot } = require('./bot');

const {
  clientId,
  clientSecret,
  telegramToken,
} = require('./secrets.json');


const coinmarketcalApi = new CoinMarketCalendarClient({
  clientId,
  clientSecret,
});

const bot = initializeBot(telegramToken, coinmarketcalApi);

exports.handler = async (event) => {
    console.log(event);
    bot.processUpdate(event);

    return {
        statusCode: 200,
        body: 'success',
    };
};