(function webpackUniversalModuleDefinition(root, factory) {
	if(typeof exports === 'object' && typeof module === 'object')
		module.exports = factory(require("anodum"));
	else if(typeof define === 'function' && define.amd)
		define(["anodum"], factory);
	else if(typeof exports === 'object')
		exports["domma"] = factory(require("anodum"));
	else
		root["domma"] = factory(root["anodum"]);
})(typeof self !== 'undefined' ? self : this, function(__WEBPACK_EXTERNAL_MODULE_4__) {
return /******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, {
/******/ 				configurable: false,
/******/ 				enumerable: true,
/******/ 				get: getter
/******/ 			});
/******/ 		}
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = 0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, exports, __webpack_require__) {

module.exports = __webpack_require__(1);


/***/ }),
/* 1 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _mutationDriver = __webpack_require__(2);

var _mutationDriver2 = _interopRequireDefault(_mutationDriver);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Domma = function () {
  function Domma(options) {
    _classCallCheck(this, Domma);

    this.driver = new _mutationDriver2.default(options);
    this.observer = new MutationObserver(this.driver.conductMutations);
    this.config = {
      childList: true,
      attributes: true,
      attributeOldValue: true,
      subtree: true
    };
  }

  _createClass(Domma, [{
    key: 'connectStaticDocument',
    value: function connectStaticDocument(staticDOM) {
      this.driver.connectStaticDocument(staticDOM);
    }
  }, {
    key: 'composeLiveDocument',
    value: function composeLiveDocument() {
      var staticDOM = this.driver.getStaticDocument();

      if (!staticDOM) {
        throw new ReferenceError('static document is not connected');
      }

      var liveDOM = this.driver.composeLiveNode(staticDOM);

      this.driver.connectLiveDocument(liveDOM);
    }
  }, {
    key: 'connectLiveDocument',
    value: function connectLiveDocument(liveDOM) {
      this.driver.connectLiveDocument(liveDOM);
    }
  }, {
    key: 'conductTransaction',
    value: function () {
      var _ref = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee(transaction) {
        var liveDOM;
        return regeneratorRuntime.wrap(function _callee$(_context) {
          while (1) {
            switch (_context.prev = _context.next) {
              case 0:
                liveDOM = this.driver.getLiveDocument();

                if (liveDOM) {
                  _context.next = 3;
                  break;
                }

                throw new ReferenceError('live document is not connected');

              case 3:
                _context.next = 5;
                return this.observer.observe(liveDOM, this.config);

              case 5:
                _context.next = 7;
                return transaction(liveDOM);

              case 7:
                _context.next = 9;
                return this.observer.disconnect();

              case 9:
                return _context.abrupt('return', this.driver.getLastConductedMutations());

              case 10:
              case 'end':
                return _context.stop();
            }
          }
        }, _callee, this);
      }));

      function conductTransaction(_x) {
        return _ref.apply(this, arguments);
      }

      return conductTransaction;
    }()
  }]);

  return Domma;
}();

exports.default = Domma;

/***/ }),
/* 2 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _generateUuid = __webpack_require__(3);

var _generateUuid2 = _interopRequireDefault(_generateUuid);

var _anodum = __webpack_require__(4);

var _squashMutations = __webpack_require__(5);

var _squashMutations2 = _interopRequireDefault(_squashMutations);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var MutationDriver = function () {
  function MutationDriver(options) {
    _classCallCheck(this, MutationDriver);

    this.options = _extends({
      bindAttribute: 'data-uuid',
      forEachElementBind: function forEachElementBind() {}
    }, options);

    this.map = {};
    this.lastConductedMutations = undefined;
    this.conductMutations = this.conductMutations.bind(this);
    this.conductMutation = this.conductMutation.bind(this);
  }

  _createClass(MutationDriver, [{
    key: 'connectStaticDocument',
    value: function connectStaticDocument(staticDOM) {
      if (!(0, _anodum.isDocumentNode)(staticDOM)) {
        throw new TypeError('staticDOM is not a Document');
      }

      this.staticDOM = staticDOM;
    }
  }, {
    key: 'connectLiveDocument',
    value: function connectLiveDocument(liveDOM) {
      if (!(0, _anodum.isDocumentNode)(liveDOM)) {
        throw new TypeError('liveDOM is not a Document');
      }

      this.liveDOM = liveDOM;
    }
  }, {
    key: 'composeLiveNode',
    value: function composeLiveNode(staticNode) {
      var _this = this;

      if (!(0, _anodum.isDocumentNode)(staticNode) && !(0, _anodum.isElementNode)(staticNode)) {
        throw new TypeError('staticNode is not neither Document nor Element');
      }

      var staticRoot = (0, _anodum.isDocumentNode)(staticNode) ? staticNode : staticNode.ownerDocument;
      var liveNode = staticNode.cloneNode(true);

      (0, _anodum.traverseNode)(liveNode, function (lNode, path) {
        if (!(0, _anodum.isElementNode)(lNode)) return;
        if ((0, _anodum.isChildOfTag)(lNode, 'svg')) return;

        var sNode = (0, _anodum.getNodeByTreePath)(staticRoot, path);
        var id = (0, _generateUuid2.default)();

        lNode.setAttribute(_this.options.bindAttribute, id);
        _this.map[id] = { staticElement: sNode };

        _this.options.forEachElementBind(lNode);
      }, true);

      return liveNode;
    }
  }, {
    key: 'getStaticDocument',
    value: function getStaticDocument() {
      return this.staticDOM;
    }
  }, {
    key: 'getLiveDocument',
    value: function getLiveDocument() {
      return this.liveDOM;
    }
  }, {
    key: 'getLastConductedMutations',
    value: function getLastConductedMutations() {
      return this.lastConductedMutations;
    }
  }, {
    key: 'isReferenceId',
    value: function isReferenceId(id) {
      return Object.prototype.hasOwnProperty.call(this.map, id);
    }
  }, {
    key: 'getReferenceId',
    value: function getReferenceId(liveElement) {
      if (!(0, _anodum.isElementNode)(liveElement)) {
        throw new TypeError('liveElement is not an Element node');
      }

      if (liveElement.ownerDocument !== this.liveDOM) {
        throw new ReferenceError('liveElement doesn\'t belong to connected live document');
      }

      return liveElement.getAttribute(this.options.bindAttribute);
    }
  }, {
    key: 'hasReference',
    value: function hasReference(liveElement) {
      return Object.prototype.hasOwnProperty.call(this.map, this.getReferenceId(liveElement));
    }
  }, {
    key: 'getReference',
    value: function getReference(liveElement) {
      var id = this.getReferenceId(liveElement);
      if (!this.isReferenceId(id)) return undefined;
      return this.map[id].staticElement;
    }
  }, {
    key: 'conductMutation',
    value: function conductMutation(mutation) {
      var liveNode = mutation.target;
      var staticNode = this.getReference(liveNode);

      if (!staticNode) return;

      console.log(staticNode);

      switch (mutation.type) {
        case 'attributes':
          {
            var attribute = mutation.attributeName;
            var value = liveNode.getAttribute(attribute);
            staticNode.setAttribute(attribute, value);
            break;
          }
        case 'childList':
          {
            break;
          }
        default:
          {
            break;
          }
      }
    }
  }, {
    key: 'conductMutations',
    value: function conductMutations(mutations) {
      var conductedMutations = (0, _squashMutations2.default)(mutations);
      conductedMutations.forEach(this.conductMutation);
      this.lastConductedMutations = conductedMutations;
    }
  }]);

  return MutationDriver;
}();

exports.default = MutationDriver;

/***/ }),
/* 3 */
/***/ (function(module, exports) {

module.exports = function () {
  var lut = [];
  for (var i = 0; i < 256; i++) {
    lut[i] = (i < 16 ? '0' : '') + i.toString(16);
  }

  var getRandomNumber = function () {
    return Math.random() * 0x100000000 >>> 0;
  };

  var d0 = getRandomNumber();
  var d1 = getRandomNumber();
  var d2 = getRandomNumber();
  var d3 = getRandomNumber();
  return lut[d0 & 0xff] + lut[d0 >> 8 & 0xff] + lut[d0 >> 16 & 0xff] + lut[d0 >> 24 & 0xff] + '-' + lut[d1 & 0xff] + lut[d1 >> 8 & 0xff] + '-' + lut[d1 >> 16 & 0x0f >>> 0x40] + lut[d1 >> 24 & 0xff] + '-' + lut[d2 & 0x3f >>> 0x80] + lut[d2 >> 8 & 0xff] + '-' + lut[d2 >> 16 & 0xff] + lut[d2 >> 24 & 0xff] + lut[d3 & 0xff] + lut[d3 >> 8 & 0xff] + lut[d3 >> 16 & 0xff] + lut[d3 >> 24 & 0xff];
};

/***/ }),
/* 4 */
/***/ (function(module, exports) {

module.exports = __WEBPACK_EXTERNAL_MODULE_4__;

/***/ }),
/* 5 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});

exports.default = function (rawMutations) {
  var mutations = [];

  rawMutations.reverse().forEach(function (rawMutation) {
    switch (rawMutation.type) {
      case 'attributes':
        {
          var prioritizedMutation = mutations.find(function (mutation) {
            var isSameTarget = mutation.target === rawMutation.target;
            var isSameAttribute = mutation.attributeName === rawMutation.attributeName;
            return isSameTarget && isSameAttribute;
          });

          if (!prioritizedMutation) mutations.push(rawMutation);
          break;
        }
      default:
        {
          mutations.push(rawMutation);
        }
    }
  });

  return mutations;
};

/***/ })
/******/ ])["default"];
});