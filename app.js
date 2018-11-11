const CoinMarketCalendarClient = require('./Coinmarketcal');
const { startServer } = require('./server');
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

startServer(bot);
