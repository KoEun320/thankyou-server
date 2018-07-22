const mongoose = require('mongoose');

var PostSchema = mongoose.Schema({
  writerId: {type: String, require: true},
  writer: String,
  content: {type: String, require: true},
  like: {type: Number, default: 0, min: 0},
  isPublic: Boolean,
  imgUrl: String,
  created: { type: String, default: Date.now.toString() },
  likeId: [{type:String}]
});

module.exports = mongoose.model('Post', PostSchema);
