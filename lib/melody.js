var config = require('../config');

var Maki = require('maki');
var melody = new Maki(config);

var Identity = require('maki-identity-mnemonic');
var identity = new Identity({
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

//var fabric = require('maki-service-fabric');

melody.use(require('maki-client-level'));
melody.use(identity);
melody.use(auth);
//melody.use(fabric);

var Peer = melody.define('Peer', {
  components: {
    query: 'maki-peer-list'
  },
  attributes: {
    id: { type: String , required: true },
    address: String,
    _identity: { type: melody.mongoose.SchemaTypes.ObjectId , ref: 'Identity' }
  }
});

var Identity = melody.define('Identity', {
  components: {
    query: 'maki-identities'
  },
  attributes: {
    name: { type: String },
    key: {
      hd: { type: Boolean },
      public: { type: String , slug: true , unique: true }
    }
  }
});

var PostSchema = {
  //title: { type: String , max: 240 , slug: true },
  content: { type: String },
  created: { type: Date , default: Date.now },
  _identity: { type: melody.mongoose.SchemaTypes.ObjectId , ref: 'Identity', required: true },
  _author: {
    type: melody.mongoose.SchemaTypes.ObjectId,
    ref: 'Person',
    populate: ['query', 'get', 'create'],
    //required: true
  }
};

if (config.config.characterLimit) {
  PostSchema.content.max = config.config.characterLimit;
}

var Post = melody.define('Post', {
  /*auth: {
    'create': 'admin'
  },*/
  attributes: PostSchema,
  components: {
    query: 'melody-posts'
  },
  icon: 'file text'
});

var Person = melody.define('Person', {
  auth: ['admin'],
  components: {
    'get': 'melody-profile'
  },
  replicate: false,
  icon: 'user',
  attributes: {
    email: { type: String , max: 200 },
    name: { type: String , max: 200 , slug: true , required: true },
    created: { type: Date , default: Date.now },
    _identity: { type: melody.mongoose.SchemaTypes.ObjectId , ref: 'Identity', required: true },
    //_id: { type: melody.mongoose.SchemaTypes.ObjectId , id: true },
    stats: {
      posts: { type: Number , default: 0 }
    }
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

function populateIdentity(next, done) {
  var self = this;
  Identity.get({ 'key.public': self._identity }, function(err, identity) {
    if (identity) {
      console.log('yesss:', identity);
      self._identity = identity._id;
    }
    next();
  });
}

Post.pre('create', populateIdentity);
Person.pre('create', populateIdentity);
Post.pre('create', function(next, done) {
  var post = this;
  var query = { _identity: post._identity };

  console.log('person:pre:create', 'query', query);

  Person.get(query, function(err, person) {
    if (err) console.error(err);

    console.log('creating post, person:', person);

    post._author = person._id;
    next();
  });
});
Post.post('create', function(next, done) {
  var post = this;
  console.log('Post.post create', post._author);
  console.log('new value', post._author.stats.posts + 1);

  Post.count({ _author: post._author._id }, function(err, count) {
    if (err) {
      console.error(err);
      return done(err);
    }
    Person.patch({ _id: post._author._id }, [
      { op: 'replace', path: '/stats/posts', value: count }
    ], function(err) {
      console.log('Post.create post post (!)', err);
      next(err);
    });
  });


});

melody.define('Index', {
  routes: { query: '/' },
  templates: { query: 'index' },
  components: {
    query: 'melody-index'
  },
  static: true,
  //internal: true,
  requires: {
    'Post': {
      populate: '_author'
    }
  }
});

module.exports = melody;
