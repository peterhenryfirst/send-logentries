var should = require('chai').should(),
	chai = require('chai'),
	expect = chai.expect,
	should = chai.should(),
	mockery = require('mockery'),
	sinon = require('sinon'),
	sinonChai = require('sinon-chai');

chai.use(sinonChai);

/*
describe('init module', function () {
	it('initialize with default token', function () {});
});
*/

describe('send-logentries tests', function() {
	
	var sendLogentries,
		logentriesStub, settingsStub,
		loggerStub;
	
	beforeEach(function(done) {
		mockery.enable({
			warnOnReplace: false,
			warnOnUnregistered: false,
			useCleanCache: true
		});

		//logentriesStub = sinon.stub();
		//settingsStub = sinon.stub();
		loggerStub = sinon.stub();

		mockery.registerMock('node-logentries', {
			logger: loggerStub
		});

		done();
	});
	
	afterEach(function(done) {
		mockery.disable();

		//loggerStub.restore();

		done();
	});
	
	it('Exist send-logentries with basic properties', function() {
		sendLogentries = require('../lib/send-logentries');

		should.exist(sendLogentries);
		sendLogentries.should.be.an('object');

		expect(sendLogentries).to.have.property('setSettings').and.to.be.a('function');
		expect(sendLogentries).to.have.property('init').and.to.be.a('function');
		
		expect(sendLogentries).to.have.property('start').and.to.be.a('function');
		expect(sendLogentries).to.have.property('end').and.to.be.a('function');
		
		expect(sendLogentries).to.have.property('responseTime').and.to.be.a('function');

	});

	describe('init function', function() {
		it('Get null if setting is an empty object (not found) ', function() {
			sendLogentries = require('../lib/send-logentries');

			var result = sendLogentries.init('noname');
			
			expect(result).to.be.null;
		});

		it('Get an object if the name arg do not exist in settings', function() {
			var objectExpected = { log: 'ok' },
				result;
			loggerStub.returns(objectExpected);
			
			sendLogentries = require('../lib/send-logentries');
			result = sendLogentries.init('noname', {
				"default": {
					"token": "----"
				},
			});
			
			expect(loggerStub).to.have.been.calledOnce;
			expect(result).to.deep.equal(objectExpected);
		});

		it('Get an object if the name arg exist in settings', function() {
			var objectExpected = {
					log: 'ok'
				},
				result;
			loggerStub.returns(objectExpected);
			
			sendLogentries = require('../lib/send-logentries');
			result = sendLogentries.init('noname', {
				"noname": {
					"token": "----"
				},
			});
			
			expect(loggerStub).to.have.been.calledOnce;
			expect(result).to.deep.equal(objectExpected);
		});

		//TODO: test with string token
	});

	describe('responseTime function', function() {
		var onHeadersStub, responseOnCloseStub, nextStub, resquestStub, fnStub;

		beforeEach(function(done) {
			mockery.enable({
				warnOnReplace: false,
				warnOnUnregistered: false,
				useCleanCache: true
			});

			onHeadersStub = sinon.stub();
			responseOnCloseStub = sinon.stub();
			nextStub = sinon.stub();
			resquestStub = sinon.stub();
			fnStub = sinon.stub();

			mockery.registerMock('on-headers', onHeadersStub);

			done();
		});
		
		afterEach(function(done) {
			done();
		});
		it('return function', function() {
			
			sendLogentries = require('../lib/send-logentries');

			var responseFunction = sendLogentries.responseTime();
			
			expect(responseFunction).to.be.a('function');
		});

		it('onHeaders, response.on and next is called', function() {
			sendLogentries = require('../lib/send-logentries');

			var responseFunction = sendLogentries.responseTime();

			responseFunction({}, {
				on: responseOnCloseStub
			}, nextStub);

			expect(onHeadersStub).to.have.been.calledOnce;
			expect(responseOnCloseStub).to.have.been.calledOnce;
			expect(nextStub).to.have.been.calledOnce;
		});

		it('onHeaders call to fn', function() {

			sendLogentries = require('../lib/send-logentries');

			var responseFunction = sendLogentries.responseTime(fnStub);
			
			onHeadersStub.callsArg(1);

			responseFunction({
				route: {
					path: ''
				},
				headers: {
					host: ''
				}
			}, {
				on: responseOnCloseStub
			}, nextStub);

			expect(onHeadersStub).to.have.been.calledOnce;
			expect(responseOnCloseStub).to.have.been.calledOnce;
			expect(nextStub).to.have.been.calledOnce;
			expect(fnStub).to.have.been.calledOnce;
			expect(fnStub.args[0][0]).and.to.be.a('number');
		});

		it('onHeaders do not call to log info function if not exist', function() {
			var logStub = sinon.stub(),
				objectExpected = {
					log: logStub
				};

			loggerStub.returns(objectExpected);

			sendLogentries = require('../lib/send-logentries');
			sendLogentries.init('noname', {
				"noname": {
					"token": "----"
				}
			});

			var responseFunction = sendLogentries.responseTime();
			
			onHeadersStub.callsArg(1);

			responseFunction({route: {
					path: ''
				}, headers: {
					host: ''
				}
			}, {
				on: responseOnCloseStub
			}, nextStub);

			expect(onHeadersStub).to.have.been.calledOnce;
			expect(responseOnCloseStub).to.have.been.calledOnce;
			expect(nextStub).to.have.been.calledOnce;
			expect(logStub).to.not.have.been.calledOnce;
		});

		it('onHeaders do call to log info function with the correct object', function() {
			var logStub = sinon.stub(),
				objectExpected = {
					info: logStub
				};

			loggerStub.returns(objectExpected);

			sendLogentries = require('../lib/send-logentries');
			sendLogentries.init('noname', {
				"noname": {
					"token": "----"
				}
			});

			var responseFunction = sendLogentries.responseTime();
			
			onHeadersStub.callsArg(1);

			responseFunction({route: {
					path: 'test-route'
				}, headers: {
					host: 'test-host'
				}
			}, {
				on: responseOnCloseStub,
				statusCode: 200
			}, nextStub);

			expect(onHeadersStub).to.have.been.calledOnce;
			expect(responseOnCloseStub).to.have.been.calledOnce;
			expect(nextStub).to.have.been.calledOnce;
			expect(logStub).to.have.been.calledOnce;

			var arg = logStub.args[0][0];
			expect(arg.route).to.equal('test-route');
			expect(arg.host).to.equal('test-host');
			expect(arg.statusCode).to.equal(200);
			expect(arg.TotalTime).to.be.a('number');
			expect(arg.unit).to.equal('ms');
		});
	});
	
	//TODO: test for setSetting function
});

