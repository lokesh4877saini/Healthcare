const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ImageSchema = new Schema({
  imageUrl: { type: String}
  // Other fields as needed
});

const Image = mongoose.model('Image', ImageSchema);

module.exports = Image;
