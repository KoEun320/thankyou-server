const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

var AccountSchema = mongoose.Schema({
  email: {type: String, require: true, unique: true},
  username: {type: String, require: true},
  password: {type: String, require: true},
  created: { type: Date, default: Date.now }
});

// generates hash
AccountSchema.methods.generateHash = function(password) {
  return bcrypt.hashSync(password, 8);
};

// compares the password
AccountSchema.methods.validateHash = function(password) {
  return bcrypt.compareSync(password, this.password);
};

module.exports = mongoose.model('Account', AccountSchema);
