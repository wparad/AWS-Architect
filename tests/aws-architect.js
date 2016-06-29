'use strict';
var esprima = require('esprima');
var mocha = require('mocha');
var assert = require('chai').assert;
var fs = require('fs');
var path = require('path');

describe('bin/aws-architect.js', function() {
	describe('Syntax', function () {
		it('Should be valid node', function(){
			try {
				var app = require('../bin/aws-architect');
				assert(true);
			}
			catch(e) {
				console.error(e);
				assert(false, JSON.stringify(e, null, 2));
			}
		});
	});
});