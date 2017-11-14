const mongoose = require('mongoose');

mongoose.Promise = global.Promise;

const collection = mongoose.connect('mongodb://localhost/book', err => {
  console.log('Connect db');
});
