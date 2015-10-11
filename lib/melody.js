var config = require('../config');

var Maki = require('maki');
var melody = new Maki(config);

var Passport = require('maki-passport-local');
var passport = new Passport({
  resource: 'Person'
});

var Auth = require('maki-auth-simple');
var auth = new Auth({
  resource: 'Person',
  // capabilities are named arrays of the roles that inherit them
  // for example, `'write': ['admin']` indicates that anyone with the 'admin'
  // role will inherit the 'write' capability, whatever you decide that means.
  capabilities: {
    'write': ['admin']
  }
});

melody.use(passport);
melody.use(auth);

var Post = melody.define('Post', {
  auth: {
    'create': 'admin'
  },
  attributes: {
    title: { type: String , max: 240 , slug: true },
    content: { type: String },
    created: { type: Date , default: Date.now },
    _author: {
      type: melody.mongoose.SchemaTypes.ObjectId,
      ref: 'Person',
      populate: ['query', 'get'],
      required: true
    }
  },
  icon: 'file text'
});

var Person = melody.define('Person', {
  auth: ['admin'],
  replicate: false,
  icon: 'user',
  attributes: {
    email: { type: String , max: 200 },
    username: { type: String , slug: true , max: 200 },
    password: { type: String , masked: true , max: 200 },
    created: { type: Date , default: Date.now }
  },
  requires: {
    'Post': {
      limit: 20,
      filter: function() {
        var person = this;
        return { _author: person._id };
      },
      populate: '_author'
    }
  }
});

melody.define('Index', {
  routes: { query: '/' },
  templates: { query: 'index' },
  static: true,
  internal: true,
  requires: {
    'Post': {
      populate: '_author'
    }
  }
});

module.exports = melody;
