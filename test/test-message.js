global.databaseUri = 'mongodb://localhost/sup-dev';

var chai = require('chai');
var chaiHttp = require('chai-http');
var spies = require('chai-spies');
var mongoose = require('mongoose');
var UrlPattern = require('url-pattern');
var app = require('../index').app;

var should = chai.should();

chai.use(chaiHttp);
chai.use(spies);

describe('Message endpoints', function() {
    var server;
    beforeEach(function(done) {
        mongoose.connection.db.dropDatabase(function(err, res) {
            this.alice = {
                username: 'alice',
                _id: 'AAAAAAAAAAAAAAAAAAAAAAAA'
            };

            this.bob = {
                username: 'bob',
                _id: 'BBBBBBBBBBBBBBBBBBBBBBBB'
            };

            this.chuck = {
                username: 'chuck',
                _id: 'CCCCCCCCCCCCCCCCCCCCCCCC'
            };

            // Create users
            var promiseA = chai.request(app)
                    .put('/users/' + this.alice._id)
                    .send(this.alice);
            var promiseB = chai.request(app)
                    .put('/users/' + this.bob._id)
                    .send(this.bob);
            var promiseC = chai.request(app)
                    .put('/users/' + this.chuck._id)
                    .send(this.chuck);
            Promise.all([promiseA, promiseB, promiseC]).then(function() {
                done();
            });
        }.bind(this));
    });

    describe('/messages', function() {
        beforeEach(function() {
            this.pattern = new UrlPattern('/messages');
        });

        describe('GET', function() {
            it('should return an empty list of messages initially', function() {
                return chai.request(app)
                    .get(this.pattern.stringify())
                    .then(function(res) {
                        res.should.have.status(200);
                        res.type.should.equal('application/json');
                        res.charset.should.equal('utf-8');
                        res.body.should.be.an('array');
                        res.body.length.should.equal(0);
                    });
            });

            it('should return a list of messages', function() {
                var messageA = {
                    from: this.alice._id,
                    to: this.bob._id,
                    text: 'Hi Bob'
                };
                var messageB = {
                    from: this.alice._id,
                    to: this.chuck._id,
                    text: 'Hi Chuck'
                };
                var messageC = {
                    from: this.bob._id,
                    to: this.chuck._id,
                    text: 'Hi Chuck'
                };

                var promiseA = chai.request(app)
                    .post(this.pattern.stringify())
                    .send(messageA);
                var promiseB = chai.request(app)
                    .post(this.pattern.stringify())
                    .send(messageB);
                var promiseC = chai.request(app)
                    .post(this.pattern.stringify())
                    .send(messageC);

                return promiseA.then(function() {
                    return promiseB;
                }).then(function() {
                    return promiseC
                })
                .then(function(res) {
                    return chai.request(app)
                        .get(this.pattern.stringify());
                }.bind(this))
                .then(function(res) {
                    res.should.have.status(200);
                    res.type.should.equal('application/json');
                    res.charset.should.equal('utf-8');
                    res.body.should.be.an('array');
                    res.body.length.should.equal(3);

                    var message = res.body[0];
                    message.should.be.an('object');
                    message.should.have.property('text');
                    message.text.should.be.a('string');
                    message.text.should.equal(messageA.text);
                    message.should.have.property('to');
                    message.from.should.be.an('object');
                    message.from.should.have.property('username');
                    message.from.username.should.equal(this.alice.username);
                    message.to.should.be.an('object');
                    message.to.should.have.property('username');
                    message.to.username.should.equal(this.bob.username);

                    var message = res.body[1];
                    message.should.be.an('object');
                    message.should.have.property('text');
                    message.text.should.be.a('string');
                    message.text.should.equal(messageB.text);
                    message.should.have.property('to');
                    message.from.should.be.an('object');
                    message.from.should.have.property('username');
                    message.from.username.should.equal(this.alice.username);
                    message.to.should.be.an('object');
                    message.to.should.have.property('username');
                    message.to.username.should.equal(this.chuck.username);

                    var message = res.body[2];
                    message.should.be.an('object');
                    message.should.have.property('text');
                    message.text.should.be.a('string');
                    message.text.should.equal(messageC.text);
                    message.should.have.property('to');
                    message.from.should.be.an('object');
                    message.from.should.have.property('username');
                    message.from.username.should.equal(this.bob.username);
                    message.to.should.be.an('object');
                    message.to.should.have.property('username');
                    message.to.username.should.equal(this.chuck.username);
                }.bind(this));
            });
            it('should allow filtering by from', function() {
                var messageA = {
                    from: this.alice._id,
                    to: this.bob._id,
                    text: 'Hi Bob'
                };
                var messageB = {
                    from: this.alice._id,
                    to: this.chuck._id,
                    text: 'Hi Chuck'
                };
                var messageC = {
                    from: this.bob._id,
                    to: this.chuck._id,
                    text: 'Hi Chuck'
                };

                var promiseA = chai.request(app)
                    .post(this.pattern.stringify())
                    .send(messageA);
                var promiseB = chai.request(app)
                    .post(this.pattern.stringify())
                    .send(messageB);
                var promiseC = chai.request(app)
                    .post(this.pattern.stringify())
                    .send(messageC);

                return promiseA.then(function() {
                    return promiseB;
                }).then(function() {
                    return promiseC
                })
                .then(function(res) {
                    var url = this.pattern.stringify() + '?from=' + this.alice._id;
                    return chai.request(app)
                        .get(url);
                }.bind(this))
                .then(function(res) {
                    res.should.have.status(200);
                    res.type.should.equal('application/json');
                    res.charset.should.equal('utf-8');
                    res.body.should.be.an('array');
                    res.body.length.should.equal(2);

                    var message = res.body[0];
                    message.should.be.an('object');
                    message.should.have.property('text');
                    message.text.should.be.a('string');
                    message.text.should.equal(messageA.text);
                    message.should.have.property('to');
                    message.from.should.be.an('object');
                    message.from.should.have.property('username');
                    message.from.username.should.equal(this.alice.username);
                    message.to.should.be.an('object');
                    message.to.should.have.property('username');
                    message.to.username.should.equal(this.bob.username);

                    var message = res.body[1];
                    message.should.be.an('object');
                    message.should.have.property('text');
                    message.text.should.be.a('string');
                    message.text.should.equal(messageB.text);
                    message.should.have.property('to');
                    message.from.should.be.an('object');
                    message.from.should.have.property('username');
                    message.from.username.should.equal(this.alice.username);
                    message.to.should.be.an('object');
                    message.to.should.have.property('username');
                    message.to.username.should.equal(this.chuck.username);
                }.bind(this));
            });
            it('should allow filtering by to', function() {
                var messageA = {
                    from: this.alice._id,
                    to: this.bob._id,
                    text: 'Hi Bob'
                };
                var messageB = {
                    from: this.alice._id,
                    to: this.chuck._id,
                    text: 'Hi Chuck'
                };
                var messageC = {
                    from: this.bob._id,
                    to: this.chuck._id,
                    text: 'Hi Chuck'
                };

                var promiseA = chai.request(app)
                    .post(this.pattern.stringify())
                    .send(messageA);
                var promiseB = chai.request(app)
                    .post(this.pattern.stringify())
                    .send(messageB);
                var promiseC = chai.request(app)
                    .post(this.pattern.stringify())
                    .send(messageC);

                return promiseA.then(function() {
                    return promiseB;
                }).then(function() {
                    return promiseC
                })
                .then(function(res) {
                    var url = this.pattern.stringify() + '?to=' + this.chuck._id;
                    return chai.request(app)
                        .get(url);
                }.bind(this))
                .then(function(res) {
                    res.should.have.status(200);
                    res.type.should.equal('application/json');
                    res.charset.should.equal('utf-8');
                    res.body.should.be.an('array');
                    res.body.length.should.equal(2);

                    var message = res.body[0];
                    message.should.be.an('object');
                    message.should.have.property('text');
                    message.text.should.be.a('string');
                    message.text.should.equal(messageB.text);
                    message.should.have.property('to');
                    message.from.should.be.an('object');
                    message.from.should.have.property('username');
                    message.from.username.should.equal(this.alice.username);
                    message.to.should.be.an('object');
                    message.to.should.have.property('username');
                    message.to.username.should.equal(this.chuck.username);

                    var message = res.body[1];
                    message.should.be.an('object');
                    message.should.have.property('text');
                    message.text.should.be.a('string');
                    message.text.should.equal(messageC.text);
                    message.should.have.property('to');
                    message.from.should.be.an('object');
                    message.from.should.have.property('username');
                    message.from.username.should.equal(this.bob.username);
                    message.to.should.be.an('object');
                    message.to.should.have.property('username');
                    message.to.username.should.equal(this.chuck.username);
                }.bind(this));
            });
            it('should allow filtering by from and to', function() {
                var messageA = {
                    from: this.alice._id,
                    to: this.bob._id,
                    text: 'Hi Bob'
                };
                var messageB = {
                    from: this.alice._id,
                    to: this.chuck._id,
                    text: 'Hi Chuck'
                };
                var messageC = {
                    from: this.bob._id,
                    to: this.chuck._id,
                    text: 'Hi Chuck'
                };

                var promiseA = chai.request(app)
                    .post(this.pattern.stringify())
                    .send(messageA);
                var promiseB = chai.request(app)
                    .post(this.pattern.stringify())
                    .send(messageB);
                var promiseC = chai.request(app)
                    .post(this.pattern.stringify())
                    .send(messageC);

                return promiseA.then(function() {
                    return promiseB;
                }).then(function() {
                    return promiseC
                })
                .then(function(res) {
                    var url = this.pattern.stringify() +
                              '?from=' + this.alice._id +
                              '&to=' + this.bob._id;
                    return chai.request(app)
                        .get(url);
                }.bind(this))
                .then(function(res) {
                    res.should.have.status(200);
                    res.type.should.equal('application/json');
                    res.charset.should.equal('utf-8');
                    res.body.should.be.an('array');
                    res.body.length.should.equal(1);

                    var message = res.body[0];
                    message.should.be.an('object');
                    message.should.have.property('text');
                    message.text.should.be.a('string');
                    message.text.should.equal(messageA.text);
                    message.should.have.property('to');
                    message.from.should.be.an('object');
                    message.from.should.have.property('username');
                    message.from.username.should.equal(this.alice.username);
                    message.to.should.be.an('object');
                    message.to.should.have.property('username');
                    message.to.username.should.equal(this.bob.username);
                }.bind(this));
            });
        });
        describe('POST', function() {
            it('should allow adding a message', function() {
                var message = {
                    from: this.alice._id,
                    to: this.bob._id,
                    text: 'Hi Bob'
                };
                return chai.request(app)
                    .post(this.pattern.stringify())
                    .send(message)
                    .then(function(res) {
                        res.should.have.status(201);
                        res.type.should.equal('application/json');
                        res.charset.should.equal('utf-8');
                        res.should.have.header('location');
                        res.body.should.be.an('object');
                        res.body.should.be.empty;

                        return chai.request(app)
                            .get(res.headers.location);
                    })
                    .then(function(res) {
                        res.body.should.be.an('object');
                        res.body.should.have.property('text');
                        res.body.text.should.be.a('string');
                        res.body.text.should.equal(message.text);
                        res.body.should.have.property('to');
                        res.body.from.should.be.an('object');
                        res.body.from.should.have.property('username');
                        res.body.from.username.should.equal(this.alice.username);
                        res.body.to.should.be.an('object');
                        res.body.to.should.have.property('username');
                        res.body.to.username.should.equal(this.bob.username);
                    }.bind(this));
            });
            it('should reject messages without text', function() {;
                var message = {
                    from: this.alice._id,
                    to: this.bob._id
                };
                var spy = chai.spy();
                return chai.request(app)
                    .post(this.pattern.stringify())
                    .send(message)
                    .then(spy)
                    .then(function() {
                        spy.should.not.have.been.called();
                    })
                    .catch(function(err) {
                        var res = err.response;
                        res.should.have.status(422);
                        res.type.should.equal('application/json');
                        res.charset.should.equal('utf-8');
                        res.body.should.be.an('object');
                        res.body.should.have.property('message');
                        res.body.message.should.equal('Missing field: text');
                    });
            });
            it('should reject non-string text', function() {;
                var message = {
                    from: this.alice._id,
                    to: this.bob._id,
                    text: 42
                };
                var spy = chai.spy();
                return chai.request(app)
                    .post(this.pattern.stringify())
                    .send(message)
                    .then(spy)
                    .then(function() {
                        spy.should.not.have.been.called();
                    })
                    .catch(function(err) {
                        var res = err.response;
                        res.should.have.status(422);
                        res.type.should.equal('application/json');
                        res.charset.should.equal('utf-8');
                        res.body.should.be.an('object');
                        res.body.should.have.property('message');
                        res.body.message.should.equal('Incorrect field type: text');
                    });
            });
            it('should reject non-string to', function() {
                var message = {
                    from: this.alice._id,
                    to: 42,
                    text: 'Hi Bob'
                };
                var spy = chai.spy();
                return chai.request(app)
                    .post(this.pattern.stringify())
                    .send(message)
                    .then(spy)
                    .then(function() {
                        spy.should.not.have.been.called();
                    })
                    .catch(function(err) {
                        var res = err.response;
                        res.should.have.status(422);
                        res.type.should.equal('application/json');
                        res.charset.should.equal('utf-8');
                        res.body.should.be.an('object');
                        res.body.should.have.property('message');
                        res.body.message.should.equal('Incorrect field type: to');
                    });
            });
            it('should reject non-string from', function() {
                var message = {
                    from: 42,
                    to: this.bob._id,
                    text: 'Hi Bob'
                };
                var spy = chai.spy();
                return chai.request(app)
                    .post(this.pattern.stringify())
                    .send(message)
                    .then(spy)
                    .then(function() {
                        spy.should.not.have.been.called();
                    })
                    .catch(function(err) {
                        var res = err.response;
                        res.should.have.status(422);
                        res.type.should.equal('application/json');
                        res.charset.should.equal('utf-8');
                        res.body.should.be.an('object');
                        res.body.should.have.property('message');
                        res.body.message.should.equal('Incorrect field type: from');
                    });
            });
            it('should reject messages from non-existent users', function() {
                var message = {
                    from: 'DDDDDDDDDDDDDDDDDDDDDDDD',
                    to: this.bob._id,
                    text: 'Hi Bob'
                };
                var spy = chai.spy();
                return chai.request(app)
                    .post(this.pattern.stringify())
                    .send(message)
                    .then(spy)
                    .then(function() {
                        spy.should.not.have.been.called();
                    })
                    .catch(function(err) {
                        var res = err.response;
                        res.should.have.status(422);
                        res.type.should.equal('application/json');
                        res.charset.should.equal('utf-8');
                        res.body.should.be.an('object');
                        res.body.should.have.property('message');
                        res.body.message.should.equal('Incorrect field value: from');
                    });
            });
            it('should reject messages to non-existent users', function() {
                var message = {
                    from: this.alice._id,
                    to: 'DDDDDDDDDDDDDDDDDDDDDDDD',
                    text: 'Hi Dan'
                };
                var spy = chai.spy();
                return chai.request(app)
                    .post(this.pattern.stringify())
                    .send(message)
                    .then(spy)
                    .then(function() {
                        spy.should.not.have.been.called();
                    })
                    .catch(function(err) {
                        spy.should.not.have.been.called();
                        var res = err.response;
                        res.should.have.status(422);
                        res.type.should.equal('application/json');
                        res.charset.should.equal('utf-8');
                        res.body.should.be.an('object');
                        res.body.should.have.property('message');
                        res.body.message.should.equal('Incorrect field value: to');
                    });
            });
        });
    });

    describe('/messages/:messageId', function() {
        beforeEach(function() {
            this.pattern = new UrlPattern('/messages/:messageId');
        });

        describe('GET', function() {
            it('should 404 on non-existent messages', function() {
                var spy = chai.spy();
                return chai.request(app)
                    .get(this.pattern.stringify({messageId: '000000000000000000000000'}))
                    .then(spy)
                    .then(function() {
                        spy.should.not.have.been.called();
                    })
                    .catch(function(err) {
                        var res = err.response;
                        res.should.have.status(404);
                        res.type.should.equal('application/json');
                        res.charset.should.equal('utf-8');
                        res.body.should.be.an('object');
                        res.body.should.have.property('message');
                        res.body.message.should.equal('Message not found');
                    });
            });
            it('should return a single message', function() {
                var message = {
                    from: this.alice._id,
                    to: this.bob._id,
                    text: 'Hi Bob'
                };
                var params;
                return chai.request(app)
                    .post('/messages')
                    .send(message)
                    .then(function(res) {
                        params = this.pattern.match(res.headers.location);
                        return chai.request(app)
                            .get(this.pattern.stringify({
                                messageId: params.messageId
                            }));
                    }.bind(this))
                    .then(function(res) {
                        res.should.have.status(200);
                        res.type.should.equal('application/json');
                        res.charset.should.equal('utf-8');
                        res.body.should.be.an('object');
                        res.body.should.be.an('object');
                        res.body.should.have.property('text');
                        res.body.text.should.be.a('string');
                        res.body.text.should.equal(message.text);
                        res.body.should.have.property('to');
                        res.body.from.should.be.an('object');
                        res.body.from.should.have.property('username');
                        res.body.from.username.should.equal(this.alice.username);
                        res.body.to.should.be.an('object');
                        res.body.to.should.have.property('username');
                        res.body.to.username.should.equal(this.bob.username);
                    }.bind(this));
            });
        });
    });
});
