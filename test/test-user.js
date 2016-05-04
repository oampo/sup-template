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

describe('User endpoints', function() {
    beforeEach(function(done) {
        mongoose.connection.db.dropDatabase(done);
    });

    describe('/users', function() {
        beforeEach(function() {
            this.pattern = new UrlPattern('/users');
        });

        describe('GET', function() {
            it('should return an empty list of users initially', function() {
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

            it('should return a list of users', function() {
                var user = {
                    username: 'joe'
                };
                return chai.request(app)
                    .post(this.pattern.stringify())
                    .send(user)
                    .then(function(res) {
                        return chai.request(app)
                            .get(this.pattern.stringify());
                    }.bind(this))
                    .then(function(res) {
                        res.should.have.status(200);
                        res.type.should.equal('application/json');
                        res.charset.should.equal('utf-8');
                        res.body.should.be.an('array');
                        res.body.length.should.equal(1);
                        res.body[0].should.be.an('object');
                        res.body[0].should.have.property('username');
                        res.body[0].username.should.be.a('string');
                        res.body[0].username.should.equal(user.username);
                        res.body[0].should.have.property('_id');
                        res.body[0]._id.should.be.a('string');
                    });

            });
        });
        describe('POST', function() {
            it('should allow adding a user', function() {
                var user = {
                    username: 'joe'
                };
                return chai.request(app)
                    .post(this.pattern.stringify())
                    .send(user)
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
                        res.body.should.have.property('username');
                        res.body.username.should.be.a('string');
                        res.body.username.should.equal(user.username);
                        res.body.should.have.property('_id');
                        res.body._id.should.be.a('string');
                    });
            });
            it('should reject users without a username', function() {
                var user = {};
                var spy = chai.spy();
                return chai.request(app)
                    .post(this.pattern.stringify())
                    .send(user)
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
                        res.body.message.should.equal('Missing field: username');
                    });
            });
            it('should reject non-string usernames', function() {
                var user = {
                    username: 42
                };
                var spy = chai.spy();
                return chai.request(app)
                    .post(this.pattern.stringify())
                    .send(user)
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
                        res.body.message.should.equal('Incorrect field type: username');
                    });
            });
        });
    });

    describe('/users/:userId', function() {
        beforeEach(function() {
            this.pattern = new UrlPattern('/users/:userId');
        });

        describe('GET', function() {
            it('should 404 on non-existent users', function() {
                var spy = chai.spy();
                return chai.request(app)
                    .get(this.pattern.stringify({userId: '000000000000000000000000'}))
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
                        res.body.message.should.equal('User not found');
                    });
            });

            it('should return a single user', function() {
                var user = {
                    username: 'joe'
                };
                var params;
                return chai.request(app)
                    .post('/users')
                    .send(user)
                    .then(function(res) {
                        params = this.pattern.match(res.headers.location);
                        return chai.request(app)
                            .get(this.pattern.stringify({
                                userId: params.userId
                            }));
                    }.bind(this))
                    .then(function(res) {
                        res.should.have.status(200);
                        res.type.should.equal('application/json');
                        res.charset.should.equal('utf-8');
                        res.body.should.be.an('object');
                        res.body.should.have.property('username');
                        res.body.username.should.be.a('string');
                        res.body.username.should.equal(user.username);
                        res.body.should.have.property('_id');
                        res.body._id.should.be.a('string');
                        res.body._id.should.equal(params.userId)
                    });
            });
        });

        describe('PUT', function() {
            it('should allow editing a user', function() {
                var oldUser = {
                    username: 'joe'
                };
                var newUser = {
                    username: 'joe2'
                };
                var params;
                return chai.request(app)
                    .post('/users')
                    .send(oldUser)
                    .then(function(res) {
                        params = this.pattern.match(res.headers.location);
                        return chai.request(app)
                            .put(this.pattern.stringify({
                                userId: params.userId
                            }))
                            .send(newUser);
                    }.bind(this))
                    .then(function(res) {
                        res.should.have.status(200);
                        res.type.should.equal('application/json');
                        res.charset.should.equal('utf-8');
                        res.body.should.be.an('object');
                        res.body.should.be.empty;

                        return chai.request(app)
                            .get(this.pattern.stringify({
                                userId: params.userId
                            }));
                    }.bind(this))
                    .then(function(res) {
                        res.body.should.be.an('object');
                        res.body.should.have.property('username');
                        res.body.username.should.be.a('string');
                        res.body.username.should.equal(newUser.username);
                        res.body.should.have.property('_id');
                        res.body._id.should.be.a('string');
                        res.body._id.should.equal(params.userId);
                    });
            });
            it('should create a user if they don\'t exist', function() {
                var user = {
                    _id: '000000000000000000000000',
                    username: 'joe'
                };
                return chai.request(app)
                    .put(this.pattern.stringify({
                        userId: user._id
                    }))
                    .send(user)
                    .then(function(res) {
                        res.should.have.status(200);
                        res.type.should.equal('application/json');
                        res.charset.should.equal('utf-8');
                        res.body.should.be.an('object');
                        res.body.should.be.empty;

                        return chai.request(app)
                            .get(this.pattern.stringify({
                                userId: user._id
                            }));
                    }.bind(this))
                    .then(function(res) {
                        res.body.should.be.an('object');
                        res.body.should.have.property('username');
                        res.body.username.should.be.a('string');
                        res.body.username.should.equal(user.username);
                        res.body.should.have.property('_id');
                        res.body._id.should.be.a('string');
                        res.body._id.should.equal(user._id);
                    });
            });
            it('should reject users without a username', function() {
                var user = {
                    _id: '000000000000000000000000'
                };
                var spy = chai.spy();
                return chai.request(app)
                    .put(this.pattern.stringify({
                        userId: user._id
                    }))
                    .send(user)
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
                        res.body.message.should.equal('Missing field: username');
                    });
            });
            it('should reject non-string usernames', function() {
                var user = {
                    _id: '000000000000000000000000',
                    username: 42
                };
                var spy = chai.spy();
                return chai.request(app)
                    .put(this.pattern.stringify({
                        userId: user._id
                    }))
                    .send(user)
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
                        res.body.message.should.equal('Incorrect field type: username');
                    });
            });
        });

        describe('DELETE', function() {
            it('should 404 on non-existent users', function() {
                var spy = chai.spy();
                return chai.request(app)
                    .delete(this.pattern.stringify({userId: '000000000000000000000000'}))
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
                        res.body.message.should.equal('User not found');
                    });
            });
            it('should delete a user', function() {
                var user = {
                    username: 'joe'
                };
                var params;
                return chai.request(app)
                    .post('/users')
                    .send(user)
                    .then(function(res) {
                        params = this.pattern.match(res.headers.location);
                        return chai.request(app)
                            .delete(this.pattern.stringify({
                                userId: params.userId
                            }));
                    }.bind(this))
                    .then(function(res) {
                        res.should.have.status(200);
                        res.type.should.equal('application/json');
                        res.charset.should.equal('utf-8');
                        res.body.should.be.an('object');
                        res.body.should.be.empty;
                        var spy = chai.spy();
                        return chai.request(app)
                            .get(this.pattern.stringify({
                                userId: params.userId
                            }))
                            .then(spy)
                            .then(function() {
                                spy.should.not.have.been.called();
                            })
                            .catch(function(err) {
                                var res = err.response;
                                res.should.have.status(404);
                            });
                    }.bind(this))
            });
        });
    });
});
