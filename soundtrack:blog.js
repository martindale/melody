var melody = require('./');
var Remote = require('maki-remote');

var MailPimpTask = new Remote('http://localhost:2525/tasks');

melody.start(function(err) {
  melody.app.post('/contact', function(req, res, next) {
    MailPimpTask.create({
      subject: 'soundtrack.io Contact Form',
      recipient: 'eric@decentralize.fm',
      sender: req.param('from'),
      content: req.param('message')
    }, function(err, task) {
      req.flash('info', 'Mail sent successfully!  We\'ll get in touch shortly.');
      res.redirect('/');
    });
  });
});
