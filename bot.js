const { version } = require('./package.json');
const { isNonEmptyArray } = require('./utils');

const formatEventText = (event) => {
  const {
    title: {
      en: englishTitle
    },
  } = event;

  const date = new Date(event.date_event).toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return `${date}\n${
    englishTitle}\n`;
};

const getCoinNews = async (messageText, coinmarketcalApi) => {
  try {
    const symbols = messageText.toUpperCase().split(' ');
    const coinIds = await coinmarketcalApi.getCoinIdsFromSymbols(symbols);

    if (coinIds.length === 0) {
      return 'Unknown symbol. Please enter a valid trade symbol';
    }

    const events = await coinmarketcalApi.getEvents({
      coins: coinIds,
    });

    if (isNonEmptyArray(events)) {

      const returnMessage = `Events & News related to ${coinIds.join(', ')}
      \n${events.map(formatEventText).join('\n')}`;

      return returnMessage;
    } else {
      return `No events found for ${coinIds.join(', ')}`;
    }
  } catch (e) {
    console.log(e);
    return 'Something went wrong';
  }
};

const startMessage = 'Enter a coin symbol to get its news. For example: BCH';

const aboutMessage = `v${version}. Created by Nishanth Vijayan.
    \nThis bot is open-source. You'll find its source code at:
    \nhttps://github.com/nishanthvijayan/CryptoEvents-TelegramBot
    \nIf you found this bot useful, don't forget to star the project :)
    \nPlease direct your complaints & feedback to nishanthvijayan1995@gmail.com
  `;

const initializeResponseHandler = coinmarketcalApi => async (messageText) => {
  if (messageText.startsWith('/start')) {
    return startMessage;
  } else if (messageText.startsWith('/about')) {
    return aboutMessage;
  }

  return getCoinNews(messageText, coinmarketcalApi);
};

module.exports = {
  initializeResponseHandler,
};

