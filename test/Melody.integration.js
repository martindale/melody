describe('Melody', function() {
  this.timeout(60000);
  describe('web server', function() {
    it('should run', function(done) {
      var melody = require('../lib/melody');
      melody.start(done);
    });
  });
});
