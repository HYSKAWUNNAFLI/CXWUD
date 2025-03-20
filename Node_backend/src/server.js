require('dotenv').config();
const express = require('express');
const { engine } = require('express-handlebars');
const { sequelize, connectDB } = require('./models/db');
const routes = require('./routes/Route'); // Đảm bảo đúng tên file (Route.js)

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.engine('hbs', engine({ extname: '.hbs' }));
app.set('view engine', 'hbs');
app.set('views', __dirname + '/views');

app.use('/', routes);

(async () => {
  await connectDB();
  await sequelize.sync();
  app.listen(PORT, () => {
    console.log(`🚀 Server running at http://localhost:${PORT}`);
  });
})();
