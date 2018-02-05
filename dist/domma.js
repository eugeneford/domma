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
    var _this = this;

    _classCallCheck(this, Domma);

    this.config = {
      childList: true,
      attributes: true,
      attributeOldValue: true,
      characterData: true,
      characterDataOldValue: true,
      subtree: true
    };

    this.driver = new _mutationDriver2.default(options);
    this.transactionStatus = 'resolved';
    this.transactionObserver = new MutationObserver(this.driver.conductTransaction);
    this.mutationObserver = new MutationObserver(function (mutations) {
      if (_this.isTransactionPending()) return;
      _this.driver.addAdditiveMutations(mutations);
    });
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

      var liveDOM = this.driver.referenceMap.composeLiveReference(staticDOM);

      this.connectLiveDocument(liveDOM);
    }
  }, {
    key: 'connectLiveDocument',
    value: function connectLiveDocument(liveDOM) {
      this.mutationObserver.disconnect();
      this.driver.connectLiveDocument(liveDOM);
      this.mutationObserver.observe(liveDOM, this.config);
    }
  }, {
    key: 'isTransactionResolved',
    value: function isTransactionResolved() {
      return this.transactionStatus === 'resolved';
    }
  }, {
    key: 'isTransactionPending',
    value: function isTransactionPending() {
      return this.transactionStatus === 'pending';
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
                return 'pending';

              case 5:
                this.transactionStatus = _context.sent;
                _context.next = 8;
                return this.transactionObserver.observe(liveDOM, this.config);

              case 8:
                _context.next = 10;
                return transaction(liveDOM);

              case 10:
                _context.next = 12;
                return this.transactionObserver.disconnect();

              case 12:
                _context.next = 14;
                return 'resolved';

              case 14:
                this.transactionStatus = _context.sent;
                return _context.abrupt('return', this.driver.getLastTransaction());

              case 16:
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

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _anodum = __webpack_require__(4);

var _mutationTypes = __webpack_require__(7);

var _mutationTypes2 = _interopRequireDefault(_mutationTypes);

var _squashMutations = __webpack_require__(5);

var _squashMutations2 = _interopRequireDefault(_squashMutations);

var _referenceMap = __webpack_require__(8);

var _referenceMap2 = _interopRequireDefault(_referenceMap);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var MutationDriver = function () {
  function MutationDriver(options) {
    _classCallCheck(this, MutationDriver);

    this.additiveMutations = [];
    this.lastTransaction = undefined;
    this.referenceMap = new _referenceMap2.default(options);

    this.conductTransaction = this.conductTransaction.bind(this);
    this.conductMutation = this.conductMutation.bind(this);
    this.reduceAdditiveMutationsOfNode = this.reduceAdditiveMutationsOfNode.bind(this);
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
    key: 'getLastTransaction',
    value: function getLastTransaction() {
      return this.lastTransaction;
    }
  }, {
    key: 'ejectMutationsFromReferenceOfNode',
    value: function ejectMutationsFromReferenceOfNode(liveElement) {
      var _this = this;

      (0, _anodum.traverseNode)(liveElement, function (lNode) {
        var containerId = _this.referenceMap.getReferenceId(lNode);
        var containerNode = _this.referenceMap.getReference(lNode);
        var mutations = _this.getAdditiveMutationsOfNode(lNode);

        if ((0, _anodum.isElementNode)(containerNode)) {
          containerNode.removeAttribute(_this.referenceMap.options.referenceAttribute);
        }

        mutations.forEach(function (mutation) {
          switch (mutation.type) {
            case _mutationTypes2.default.attributes:
              {
                var attributeName = mutation.attributeName,
                    oldValue = mutation.oldValue;

                if (oldValue) {
                  _this.referenceMap.setReferenceAttribute(containerId, attributeName, oldValue);
                } else {
                  _this.referenceMap.removeReferenceAttribute(containerId, attributeName);
                }
                break;
              }
            case _mutationTypes2.default.childList:
              {
                var addedNodes = mutation.addedNodes,
                    removedNodes = mutation.removedNodes,
                    nextSibling = mutation.nextSibling,
                    previousSibling = mutation.previousSibling;


                addedNodes.forEach(function (addedLiveNode) {
                  if ((0, _anodum.isTextNode)(addedLiveNode)) {
                    var liveList = Array.prototype.slice.call(addedLiveNode.parentNode.childNodes);
                    var liveIndex = liveList.indexOf(addedLiveNode);
                    var staticNode = containerNode.childNodes[liveIndex];
                    containerNode.removeChild(staticNode);
                  }

                  var id = _this.referenceMap.getReferenceId(addedLiveNode);
                  if (!_this.referenceMap.isReferenceId(id)) return;
                  _this.referenceMap.removeReference(id);
                  _this.referenceMap.flush();
                  addedLiveNode.removeAttribute(_this.options.referenceAttribute);
                });

                removedNodes.forEach(function (removedLiveNode) {
                  if ((0, _anodum.isTextNode)(removedLiveNode)) {
                    var textMutations = _this.getAdditiveMutationsOfNode(removedLiveNode);
                    var staticNode = removedLiveNode.cloneNode(true);

                    textMutations.forEach(function (textMutation) {
                      staticNode.nodeValue = textMutation.oldValue;
                    });

                    if (containerNode.firstChild) {
                      containerNode.insertBefore(staticNode, containerNode.firstChild);
                    } else {
                      containerNode.appendChild(staticNode, containerNode.firstChild);
                    }
                  }
                });
                break;
              }
            default:
              {
                break;
              }
          }
        });
      });
    }
  }, {
    key: 'addAdditiveMutations',
    value: function addAdditiveMutations(mutations) {
      this.additiveMutations = this.additiveMutations.concat(mutations);
    }
  }, {
    key: 'reduceAdditiveMutationsOfNode',
    value: function reduceAdditiveMutationsOfNode(liveNode) {
      var _this2 = this;

      var types = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : _mutationTypes2.default.all;

      var additiveMutations = this.getAdditiveMutationsOfNode(liveNode, types);

      additiveMutations.forEach(function (mutation) {
        var index = _this2.additiveMutations.indexOf(mutation);
        _this2.additiveMutations.splice(index, 1);
        mutation.addedNodes.forEach(function (node) {
          return _this2.reduceAdditiveMutationsOfNode(node);
        });
        mutation.removedNodes.forEach(function (node) {
          return _this2.reduceAdditiveMutationsOfNode(node);
        });
      });
    }
  }, {
    key: 'getAdditiveMutationsOfNode',
    value: function getAdditiveMutationsOfNode(liveNode) {
      var types = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : _mutationTypes2.default.all;

      return this.additiveMutations.filter(function (mutation) {
        var sameTarget = mutation.target === liveNode;
        var validType = types.indexOf(mutation.type) > -1;
        return sameTarget && validType;
      });
    }
  }, {
    key: 'conductAttributeMutation',
    value: function conductAttributeMutation(mutation) {
      var liveNode = mutation.target;
      var referenceId = this.referenceMap.getReferenceId(liveNode);
      var attribute = mutation.attributeName;

      if (liveNode.hasAttribute(attribute)) {
        var value = liveNode.getAttribute(attribute);
        this.referenceMap.setReferenceAttribute(referenceId, attribute, value);
      } else {
        this.referenceMap.removeReferenceAttribute(referenceId, attribute);
      }
    }
  }, {
    key: 'conductCharacterDataMutation',
    value: function conductCharacterDataMutation(mutation) {
      var liveNode = mutation.target.parentNode;
      var referenceId = this.referenceMap.getReferenceId(liveNode);
      this.reduceAdditiveMutationsOfNode(mutation.target, [_mutationTypes2.default.characterData]);
      this.referenceMap.replaceReference(liveNode, referenceId);
      this.ejectMutationsFromReferenceOfNode(liveNode);
    }
  }, {
    key: 'conductChildListMutation',
    value: function conductChildListMutation(mutation) {
      var liveNode = mutation.target;
      var referenceId = this.referenceMap.getReferenceId(liveNode);
      var addedNodes = mutation.addedNodes,
          removedNodes = mutation.removedNodes,
          nextSibling = mutation.nextSibling,
          previousSibling = mutation.previousSibling;

      // for target.innerHTML or target.replacedChild

      if (addedNodes.length && removedNodes.length && !nextSibling && !previousSibling) {
        this.reduceAdditiveMutationsOfNode(liveNode, [_mutationTypes2.default.childList]);
      }

      this.referenceMap.replaceReference(liveNode, referenceId);
      this.ejectMutationsFromReferenceOfNode(liveNode);
    }
  }, {
    key: 'conductMutation',
    value: function conductMutation(mutation) {
      switch (mutation.type) {
        case _mutationTypes2.default.attributes:
          if (!this.referenceMap.hasReference(mutation.target)) return;
          this.conductAttributeMutation(mutation);
          break;
        case _mutationTypes2.default.characterData:
          if (!this.referenceMap.hasReference(mutation.target.parentNode)) return;
          this.conductCharacterDataMutation(mutation);
          break;
        default:
          if (!this.referenceMap.hasReference(mutation.target)) return;
          this.conductChildListMutation(mutation);
          break;
      }
    }
  }, {
    key: 'conductTransaction',
    value: function conductTransaction(mutations) {
      var transaction = (0, _squashMutations2.default)(mutations);
      transaction.forEach(this.conductMutation);
      this.lastTransaction = transaction;
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

          if (!prioritizedMutation) mutations.unshift(rawMutation);
          break;
        }
      default:
        {
          mutations.unshift(rawMutation);
        }
    }
  });

  return mutations.reverse();
};

/***/ }),
/* 6 */,
/* 7 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = {
  all: ['childList', 'attributes', 'characterData'],
  characterData: 'characterData',
  attributes: 'attributes',
  childList: 'childList'
};

/***/ }),
/* 8 */
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

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var ReferenceMap = function () {
  function ReferenceMap(options) {
    _classCallCheck(this, ReferenceMap);

    this.options = _extends({
      referenceAttribute: 'data-uuid',
      forEachReferenceSave: function forEachReferenceSave() {}
    }, options);
    this.map = {};
  }

  _createClass(ReferenceMap, [{
    key: 'saveReference',
    value: function saveReference(liveNode, staticNode) {
      var id = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : (0, _generateUuid2.default)();

      liveNode.setAttribute(this.options.referenceAttribute, id);
      this.map[id] = { staticNode: staticNode };
    }
  }, {
    key: 'composeStaticReference',
    value: function composeStaticReference(liveNode, id) {
      var _this = this;

      var staticNode = liveNode.cloneNode(true);
      var rootPath = (0, _anodum.getTreePathOfNode)(liveNode);

      (0, _anodum.traverseNode)(liveNode, function (lNode, path) {
        if (!(0, _anodum.isElementNode)(lNode)) return;

        path.splice(0, rootPath.length, 0);

        var sNode = (0, _anodum.getNodeByTreePath)(staticNode, path);
        var refId = liveNode === lNode ? id : undefined;

        _this.saveReference(lNode, sNode, refId);
        _this.options.forEachReferenceSave(lNode, sNode);
      }, true);

      return staticNode;
    }
  }, {
    key: 'composeLiveReference',
    value: function composeLiveReference(staticNode, id) {
      var _this2 = this;

      if (!(0, _anodum.isDocumentNode)(staticNode) && !(0, _anodum.isElementNode)(staticNode)) {
        throw new TypeError('staticNode is not neither Document nor Element');
      }

      var staticRoot = (0, _anodum.isDocumentNode)(staticNode) ? staticNode : staticNode.ownerDocument;
      var liveNode = staticNode.cloneNode(true);

      (0, _anodum.traverseNode)(liveNode, function (lNode, path) {
        if (!(0, _anodum.isElementNode)(lNode)) return;

        var sNode = (0, _anodum.getNodeByTreePath)(staticRoot, path);
        var refId = liveNode === lNode ? id : undefined;

        _this2.saveReference(lNode, sNode, refId);
        _this2.options.forEachReferenceSave(lNode, sNode);
      }, true);

      return liveNode;
    }
  }, {
    key: 'isReferenceId',
    value: function isReferenceId(id) {
      return Object.prototype.hasOwnProperty.call(this.map, id);
    }
  }, {
    key: 'getReferenceId',
    value: function getReferenceId(liveNode) {
      if (!(0, _anodum.isElementNode)(liveNode)) return undefined;
      return liveNode.getAttribute(this.options.referenceAttribute);
    }
  }, {
    key: 'getPreviousReferenceId',
    value: function getPreviousReferenceId(liveNode) {
      var referenceId = void 0;
      var node = liveNode.previousElementSibling;
      while (node) {
        referenceId = this.getReferenceId(node);
        if (referenceId) break;
        node = node.previousElementSibling;
      }

      return referenceId;
    }
  }, {
    key: 'getNextReferenceId',
    value: function getNextReferenceId(liveNode) {
      var referenceId = void 0;
      var node = liveNode.nextElementSibling;
      while (node) {
        referenceId = this.getReferenceId(node);
        if (referenceId) break;
        node = node.nextElementSibling;
      }

      return referenceId;
    }
  }, {
    key: 'getParentReferenceId',
    value: function getParentReferenceId(liveNode) {
      var referenceId = void 0;
      var node = liveNode.parentElement;
      while (node) {
        referenceId = this.getReferenceId(node);
        if (referenceId) break;
        node = node.parentElement;
      }

      return referenceId;
    }
  }, {
    key: 'hasReference',
    value: function hasReference(liveNode) {
      return this.isReferenceId(this.getReferenceId(liveNode));
    }
  }, {
    key: 'getReference',
    value: function getReference(liveNode) {
      var id = this.getReferenceId(liveNode);
      if (!this.isReferenceId(id)) return undefined;
      return this.map[id].staticNode;
    }
  }, {
    key: 'setReferenceAttribute',
    value: function setReferenceAttribute(id, attr, value) {
      if (!this.isReferenceId(id)) {
        throw new ReferenceError('reference with specified id is not found');
      }

      var staticNode = this.map[id].staticNode;

      staticNode.setAttribute(attr, value);
    }
  }, {
    key: 'hasReferenceAttribute',
    value: function hasReferenceAttribute(id, attr) {
      if (!this.isReferenceId(id)) {
        throw new ReferenceError('reference with specified id is not found');
      }

      var staticNode = this.map[id].staticNode;

      return staticNode.hasAttribute(attr);
    }
  }, {
    key: 'removeReferenceAttribute',
    value: function removeReferenceAttribute(id, attr) {
      if (!this.isReferenceId(id)) {
        throw new ReferenceError('reference with specified id is not found');
      }

      var staticNode = this.map[id].staticNode;

      staticNode.removeAttribute(attr);
    }
  }, {
    key: 'removeReference',
    value: function removeReference(id) {
      if (!this.isReferenceId(id)) {
        throw new ReferenceError('reference with specified id is not found');
      }

      var staticNode = this.map[id].staticNode;

      return staticNode.parentNode.removeChild(staticNode);
    }
  }, {
    key: 'appendReference',
    value: function appendReference(liveNode, containerId) {
      if (!this.isReferenceId(containerId)) {
        throw new ReferenceError('reference with specified containerId is not found');
      }

      if (!(0, _anodum.isNode)(liveNode)) {
        throw new TypeError('liveNode is not a Node');
      }

      var staticContainer = this.map[containerId].staticNode;
      var staticNode = this.composeStaticReference(liveNode);

      return staticContainer.appendChild(staticNode);
    }
  }, {
    key: 'insertReferenceBefore',
    value: function insertReferenceBefore(liveNode, siblingId) {
      if (!this.isReferenceId(siblingId)) {
        throw new ReferenceError('reference with specified siblingId is not found');
      }

      if (!(0, _anodum.isNode)(liveNode)) {
        throw new TypeError('liveNode is not a Node');
      }

      var siblingNode = this.map[siblingId].staticNode;
      var staticNode = this.composeStaticReference(liveNode);

      return siblingNode.parentNode.insertBefore(staticNode, siblingNode);
    }
  }, {
    key: 'replaceReference',
    value: function replaceReference(liveNode, referenceId) {
      if (!this.isReferenceId(referenceId)) {
        throw new ReferenceError('reference with specified referenceId is not found');
      }

      var oldStaticElement = this.map[referenceId].staticNode;
      var newStaticElement = this.composeStaticReference(liveNode, referenceId);

      return oldStaticElement.parentNode.replaceChild(newStaticElement, oldStaticElement);
    }
  }, {
    key: 'flush',
    value: function flush() {
      var _this3 = this;

      Object.keys(this.map).forEach(function (id) {
        var staticNode = _this3.map[id].staticNode;

        var node = staticNode;

        while (node && !(0, _anodum.isDocumentNode)(node)) {
          if (!node.parentNode) {
            delete _this3.map[id];
            return;
          }
          node = node.parentNode;
        }
      });
    }
  }]);

  return ReferenceMap;
}();

exports.default = ReferenceMap;

/***/ })
/******/ ])["default"];
});