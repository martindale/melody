var Maki = require('maki');
var melody = new Maki();

var Passport = require('maki-passport-local');
var passport = new Passport({
  resource: 'Person'
});

var Post = melody.define('Post', {
  attributes: {
    content: { type: String , max: 140 },
    _author: { type: melody.mongoose.SchemaTypes.ObjectId , ref: 'Person' }
  }
});

var Person = melody.define('Person', {
  attributes: {
    email: { type: String , max: 200 },
    username: { type: String , slug: true , max: 200 },
    password: { type: String , masked: true , max: 200 }
  },
  replicate: false
});

module.exports = melody;
