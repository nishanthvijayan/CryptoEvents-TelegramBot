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

const sendCoinNews = async (messageText, coinmarketcalApi) => {
  try {
    const symbols = messageText.toUpperCase().split(' ');
    const coinIds = await coinmarketcalApi.getCoinIdsFromSymbols(symbols);

    if (coinIds.length === 0) {
      return 'Unknown symbol. Please enter a valid trade symbol';
    }

    const events = await coinmarketcalApi.getEvents({
      coins: coinIds,
    });

    if (!events || !Array.isArray(events) || events.length < 1) {
      return `No events found for ${coinIds.join(', ')}`;
    }

    const returnMessage = `Events & News related to ${coinIds.join(', ')}
    \n${events.map(formatEventText).join('\n')}`;

    return returnMessage;
  } catch (e) {
    console.log(e);
    return 'Something went wrong';
  }
};

const sendStartMessage = () => 'Enter a coin symbol to get its news. For example: BCH';

const sendAboutMessage = () => `v${version}. Created by Nishanth Vijayan.
    \nThis bot is open-source. You'll find its source code at:
    \nhttps://github.com/nishanthvijayan/CryptoEvents-TelegramBot
    \nIf you found this bot useful, don't forget to star the project :)
    \nPlease direct your complaints & feedback to nishanthvijayan1995@gmail.com
  `;

const initializeResponseHandler = coinmarketcalApi => (messageText) => {
  if (messageText.startsWith('/start')) {
    sendStartMessage();
  } else if (messageText.startsWith('/')) {
    sendAboutMessage();
  } else if (messageText.startsWith('/about')) {
    sendAboutMessage();
  } else {
    sendCoinNews(messageText, coinmarketcalApi);
  }
};

module.exports = {
  initializeResponseHandler,
};

