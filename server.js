const Koa = require('koa');
const bodyParser = require('koa-bodyparser');

const startServer = (bot) => {
  const app = new Koa();
  app.use(bodyParser());

  app.use(async (ctx) => {
    if (ctx.request.path === '/') {
      bot.processUpdate(ctx.request.body);
    }
    ctx.status = 200;
    ctx.body = {
      status: 'success',
    };
  });

  const port = process.env.PORT || 3000;
  app.listen(port, () => {
    console.log(`listening to port ${port}`);
  });
};

module.exports = { startServer };
