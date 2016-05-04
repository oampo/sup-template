var runServer = require('../index').runServer;
before(function(done) {
    runServer(function() {
        done()
    });
});

