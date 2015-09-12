"use strict";

var _classCallCheck = require("babel-runtime/helpers/class-call-check")["default"];

Object.defineProperty(exports, "__esModule", {
	value: true
});

var Status = function Status(version, warnings) {
	_classCallCheck(this, Status);

	this.version = version;
	this.improperlyConfiguredCron = warnings.improperlyConfiguredCron;
};

exports["default"] = Status;
module.exports = exports["default"];