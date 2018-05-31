const Koa = require('koa');
const bodyParser = require('koa-bodyparser');
const TelegramBot = require('node-telegram-bot-api');

const CoinMarketCalendarClient = require('./Coinmarketcal');
const Cache = require('./Cache');

const pkgName = require('./package.json').name;
const {
  clientId,
  clientSecret,
  telegramToken
} = require('./secrets.json');

const app = new Koa();
const bot = new TelegramBot(telegramToken);
const coinmarketcalApi = new CoinMarketCalendarClient({
  clientId,
  clientSecret
});

const lastMessage = {}

function printEvents(events) {
  return events.map((event) => {
    const {
      title,
      description
    } = event;

    const date = new Date(event.date_event).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });

    const validity = event.percentage;

    const coin = event.coins
      .filter(({
        id
      }) => id !== 'custom_coin')
      .map(({
        symbol
      }) => symbol)
      .join(', ');

    const type = event.categories.map(category => category.name).join(', ');

    return date + '\n' +
      title + '\n' +
      description + '\n'
  }).join("\n");
}


async function getCoinIdsFromSymbols(coinSymbols) {
  if (coinSymbols == null || !Array.isArray(coinSymbols) || coinSymbols.length === 0) {
    return [];
  }

  const coinList = await coinmarketcalApi.getCoins();

  return coinList
    .filter(coin => coinSymbols.includes(coin.symbol.toUpperCase()))
    .map(coin => coin.id);
}


async function getCategoryIdsFromNames(categoryNames) {
  if (categoryNames == null || !Array.isArray(categoryNames) || categoryNames.length === 0) {
    return [];
  }

  const categoryList = await coinmarketcalApi.getCategories();

  return categoryList
    .filter(category => categoryNames.includes(category.name.toUpperCase()))
    .map(category => category.id);
}


async function fetchEvents({
  coinSymbols = [],
  categoryNames = []
}) {
  const [categoryIds, coinIds] = await Promise.all([
    getCategoryIdsFromNames(categoryNames),
    getCoinIdsFromSymbols(coinSymbols),
  ]);

  const events = await coinmarketcalApi.getEvents({
    coins: coinIds,
    categories: categoryIds
  });

  if (events && Array.isArray(events) && events.length > 0) {
    return printEvents(events);
  } else {
    return 'No events found';
  }
}



app.use(bodyParser());

app.use(async ctx => {
  if (ctx.request.path == `/`) {
    bot.processUpdate(ctx.request.body);
  }
  ctx.status = 200;
  ctx.body = {
    status: 'success'
  }
});


function sendCoinNews(msg) {
  try {
    const symbols = msg.text.toUpperCase().split(" ");
    fetchEvents({
      coinSymbols: symbols
    }).then((message) => {
      bot.sendMessage(msg.chat.id, message);
    });
  } catch (e) {
    bot.sendMessage(msg.chat.id, "Something went wrong");
    console.log(e);
  }
}


function sendStartMessage(msg) {
  bot.sendMessage(msg.chat.id, "Enter a coin symbol to get its news. For example: omg");
}


function sendAboutMessage(msg) {
  bot.sendMessage(msg.chat.id, "v0.0.1. Created by Nishanth Vijayan.");
}


bot.on('message', msg => {
  console.log(msg);

  if (msg.text.startsWith("/start")) {
    sendStartMessage(msg);
  } else if (msg.text.startsWith("/")) {
    sendAboutMessage(msg)
  } else if (msg.text.startsWith("/about")) {
    bot.sendMessage(msg.chat.id, "Unknown command");
  } else {
    sendCoinNews(msg);
  }
});

app.listen(3000);