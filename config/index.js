var kadfs = require('kad-fs');

module.exports = {
  service: {
    name: 'Your Stream Name', // change this!
    synopsis: 'Thoughts and musings from me.', // and this...
    mission: 'Self-hosted writing and content sharing, powered by Maki', // also
    icon: 'write' // pick from: http://semantic-ui.com/elements/icon.html
  },
  config: {
    allowPublicRegistration: false, // let other people register
    characterLimit: false // set to a number, such as 140.
  },
  users: { // users will be created on startup, password logged to console
    'admin': { // admin username will be 'admin', change if you'd like
      roles: ['admin'] // what roles this user will have
    }
  },
  database: {
    name: 'melody' // only change if you know what you're doing
  },
  byrd: {
    "ca": [],
    "cert": null,
    "key": null,
    "seeds": [
      //{ "address": "byrd.io", "port": 443, "protocol": "https" },
      { "address": "byrd.ericmartindale.com", "port": 443, "protocol": "https" },
    ],
    "address": "127.0.0.1",
    "port": 8080,
    "protocol": "http",
    "logLevel": 4,
    "datadir": "data/byrd/byrd.db",
    transport: require('../node_modules/byrd/lib/server-transport'),
    storage: kadfs('data/byrd/byrd.db')
  },
  services: {
    http: {
      port: 3000 // you might want this to be some other port, like 80
    }
  }
};
