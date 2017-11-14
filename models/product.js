var mongoose = require('mongoose');

var ProductSchema = mongoose.Schema;
ProductSchema = new mongoose.Schema({
  name: String,
  description: String,
  price: Number
});
mongoose.model('Product', ProductSchema);
