const mongoose = require('mongoose');

const menuSchema = new mongoose.Schema({
  picture: { type: String, required: true }, 
  title: { type: String, required: true },
  description: { type: String },
  price: { type: Number, required: true },
  category: { 
    type: String, 
    enum: ['Breakfast', 'Lunch', 'Dinner', 'Dessert'],
    required: true 
  },
  rating: { 
    type: Number, 
    min: 1, 
    max: 5, 
    default: 0
  }
});

module.exports = mongoose.model('Menu', menuSchema);
