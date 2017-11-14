var express = require('express'),
  path = require('path'),
  bodyParser = require('body-parser'),
  mongoose = require('mongoose');
var redisClient = require('redis').createClient;
var redis = redisClient(6379, 'localhost');
var app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));

var db = require('./models/db'),
  dbProducts = require('./models/product');

var Product = mongoose.model('Product');
const port = 3000;
app.use(express.static(__dirname + '/node_modules'));
app.get('/products', function(req, res, next) {
  res.sendFile(__dirname + '/index.html');
});
var server = require('http').createServer(app);
var io = require('socket.io')(server);

io.on('connection', function(client) {
  console.log('Client connected...');
  client.on('hello', function(data) {
    console.log(data);
  });
  client.on('save', function(data) {
    var newProduct = Product(data);
    var errMes = '';
    console.log(newProduct);
    newProduct.save(function(err, doc) {
      if (err) {
        client.emit('error', { errot: 'Product Creation was Unsuccesfull' });
      } else {
        client.emit('success', {
          message: 'Successfully Created Product',
          data: doc
        });
      }
    });
  });

  client.on('get', function(data) {
    findProductInCache(Product, redis, data.name, function(book) {
      if (!book) {
        client.emit('errorGet', 'Product not found');
      } else {
        client.emit('successGet', { message: 'Successfully', data: book });
      }
    });
  });
});

server.listen(port, () => {
  console.log('Listen on port: ' + port);
});

function findProductInCache(db, redis, name, callback) {
  console.log(name);
  redis.get(name, function(err, reply) {
    if (err) callback(null);
    else if (reply) {
      //Book exists in cache
      console.log('get in cache');
      callback(JSON.parse(reply));
    } else {
      //Book doesn't exist in cache - we need to query the main database
      db.find({ name: name }, function(err, docs) {
        if (err) {
          callback(null);
        } else {
          redis.set(name, JSON.stringify(docs),'EX',60*2, function() {
            callback(docs);
          });
        }
      });
    }
  });
}
