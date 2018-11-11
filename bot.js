const TelegramBot = require('node-telegram-bot-api');
const { version } = require('./package.json');

const formatEventText = (event) => {
  const {
    title,
    description,
  } = event;

  const date = new Date(event.date_event).toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return `${date}\n${
    title}\n${
    description}\n`;
};

const sendCoinNews = async (coinmarketcalApi, bot, msg) => {
  try {
    const symbols = msg.text.toUpperCase().split(' ');
    const coinIds = await coinmarketcalApi.getCoinIdsFromSymbols(symbols);

    if (coinIds.length === 0) {
      bot.sendMessage(msg.chat.id, 'Unknown symbol. Please enter a valid trade symbol');
      return;
    }

    const events = await coinmarketcalApi.getEvents({
      coins: coinIds,
    });

    if (!events || !Array.isArray(events) || events.length < 1) {
      bot.sendMessage(msg.chat.id, `No events found for ${coinIds.join(', ')}`);
      return;
    }

    const returnMessage = `Events & News related to ${coinIds.join(', ')}
    \n${events.map(formatEventText).join('\n')}`;

    bot.sendMessage(msg.chat.id, returnMessage);
  } catch (e) {
    bot.sendMessage(msg.chat.id, 'Something went wrong');
    console.log(e);
  }
};

const sendStartMessage = (bot, msg) => {
  bot.sendMessage(msg.chat.id, 'Enter a coin symbol to get its news. For example: BCH');
};

const sendAboutMessage = (bot, msg) => {
  bot.sendMessage(msg.chat.id, `v${version}. Created by Nishanth Vijayan.`);
};

const initializeBot = (telegramToken, coinmarketcalApi) => {
  const bot = new TelegramBot(telegramToken);

  bot.on('message', (msg) => {
    console.log(msg);

    if (msg.text.startsWith('/start')) {
      sendStartMessage(bot, msg);
    } else if (msg.text.startsWith('/')) {
      sendAboutMessage(bot, msg);
    } else if (msg.text.startsWith('/about')) {
      sendAboutMessage(bot, msg);
    } else {
      sendCoinNews(coinmarketcalApi, bot, msg);
    }
  });

  return bot;
};

module.exports = {
  initializeBot,
};

