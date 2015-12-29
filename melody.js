var config = require('./config');
var crypto = require('crypto');
var melody = require('./lib/melody');

melody.start(function(err) {
  var Person = melody.resources.Person;
  var usernames = Object.keys(config.users);

  usernames.forEach(function(username) {
    Person.get({
      username: username
    }, function(err, person) {
      if (err || person) return;
      var user = config.users[username];
      var password = crypto.randomBytes(12).toString('base64');

      user.username = username;
      user.password = password;

      Person.create(user, function(err, person) {
        if (err) return console.error(err);
        console.log('Created user "'+person.username+'", password:', password);
      });

    });
  });
});
