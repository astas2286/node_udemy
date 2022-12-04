const mongoose = require('mongoose')
const dotenv = require('dotenv');
const app = require('./app')

dotenv.config({
  path: './config.env',
});

const DB = process.env.DATABASE.replace('<PASSWORD>', process.env.DATABASE_PASSWORD)

mongoose.connect(DB, {
  useNewUrlParser: true,
  useCreateIndex: true,
  useFindAndModify: false
}).then(() => console.log('CONNECTED TO DB SUCCESSFUL!'))

const port = process.env.PORT || 3007;
app.listen(port, () => {
  console.log(`App is running on port ${port}`);
});