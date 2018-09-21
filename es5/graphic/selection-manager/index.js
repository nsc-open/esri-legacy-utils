'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _eventemitter = require('eventemitter3');

var _eventemitter2 = _interopRequireDefault(_eventemitter);

var _lodash = require('lodash.differencewith');

var _lodash2 = _interopRequireDefault(_lodash);

var _lodash3 = require('lodash.differenceby');

var _lodash4 = _interopRequireDefault(_lodash3);

var _lodash5 = require('lodash.intersectionwith');

var _lodash6 = _interopRequireDefault(_lodash5);

var _shortid = require('shortid');

var _shortid2 = _interopRequireDefault(_shortid);

var _highlighter = require('./highlighter');

var _highlighter2 = _interopRequireDefault(_highlighter);

var _BoxSelector = require('./selectors/BoxSelector');

var _BoxSelector2 = _interopRequireDefault(_BoxSelector);

var _PointerSelector = require('./selectors/PointerSelector');

var _PointerSelector2 = _interopRequireDefault(_PointerSelector);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var defaultGraphicComparator = function defaultGraphicComparator(g1, g2) {
  return g1 === g2;
};
var defaultHighlighter = _highlighter2.default;

var GraphicSelectionManager = function (_EventEmitter) {
  _inherits(GraphicSelectionManager, _EventEmitter);

  function GraphicSelectionManager(_ref) {
    var map = _ref.map,
        graphicsLayer = _ref.graphicsLayer,
        _ref$highlighter = _ref.highlighter,
        highlighter = _ref$highlighter === undefined ? defaultHighlighter : _ref$highlighter,
        _ref$comparator = _ref.comparator,
        comparator = _ref$comparator === undefined ? defaultGraphicComparator : _ref$comparator;

    _classCallCheck(this, GraphicSelectionManager);

    var _this = _possibleConstructorReturn(this, (GraphicSelectionManager.__proto__ || Object.getPrototypeOf(GraphicSelectionManager)).call(this));

    if (!map) {
      throw Error('map instance is required');
    }

    /* public attributes */
    _this.map = map;
    _this.graphicsLayer = graphicsLayer || map.graphics;
    _this.selections = []; // [{ gid, graphic }]

    /* private attributes */
    _this._comparator = comparator;
    _this._highlighter = highlighter;
    _this._selector = null;
    _this._active = false;
    _this._originSymbolsMapping = {}; // { [gid]: symbol }
    return _this;
  }

  /* private methods */

  _createClass(GraphicSelectionManager, [{
    key: '_setSelections',
    value: function _setSelections(newSelections) {
      var oldSelections = this.selections;
      this.selections = newSelections;
      this._update(newSelections, oldSelections);
      this.emit('change', this.getSelections());
    }
  }, {
    key: '_saveOriginSymbol',
    value: function _saveOriginSymbol(_ref2) {
      var gid = _ref2.gid,
          graphic = _ref2.graphic;

      this._originSymbolsMapping[gid] = graphic.symbol;
    }
  }, {
    key: '_restoreOriginSymbol',
    value: function _restoreOriginSymbol(_ref3) {
      var gid = _ref3.gid,
          graphic = _ref3.graphic;

      graphic.setSymbol(this._originSymbolsMapping[gid]);
    }
  }, {
    key: '_highlight',
    value: function _highlight(item) {
      this._saveOriginSymbol(item);
      this._highlighter(item.graphic);
    }
  }, {
    key: '_cancelHighlight',
    value: function _cancelHighlight(item) {
      this._restoreOriginSymbol(item);
    }

    /**
     * diff new selections and old selections, make sure graphics are highlighted correctly
     */

  }, {
    key: '_update',
    value: function _update(newSelections, oldSelections) {
      var _this2 = this;

      var itemsToAdd = (0, _lodash4.default)(newSelections, oldSelections, function (s) {
        return s.gid;
      });
      var itemsToRemove = (0, _lodash4.default)(oldSelections, newSelections, function (s) {
        return s.gid;
      });
      itemsToAdd.forEach(function (item) {
        return _this2._highlight(item);
      });
      itemsToRemove.forEach(function (item) {
        return _this2._cancelHighlight(item);
      });
    }

    /* public methods */

    /**
     * return whether graphics is in the selections or not
     */

  }, {
    key: 'includes',
    value: function includes(graphic) {
      var _this3 = this;

      var match = this.selections.find(function (s) {
        return _this3._comparator(s.graphic, graphic);
      });
      return !!match;
    }

    /**
     * select graphics, will override the existing selections
     */

  }, {
    key: 'select',
    value: function select(graphics) {
      var _this4 = this;

      var oldGraphics = this.getSelections();
      var graphicsToAdd = (0, _lodash2.default)(graphics, oldGraphics, this._comparator);
      var graphicsToRemain = (0, _lodash6.default)(oldGraphics, graphics, this._comparator);

      this._setSelections([].concat(_toConsumableArray(this.selections.filter(function (item) {
        return graphicsToRemain.find(function (g) {
          return _this4._comparator(g, item.graphic);
        });
      })), _toConsumableArray(graphicsToAdd.map(function (graphic) {
        return { gid: _shortid2.default.generate(), graphic: graphic };
      }))));
      this.emit('select', graphics);
    }

    /**
     * clear selections
     */

  }, {
    key: 'clear',
    value: function clear() {
      this._setSelections([]);
      this._originSymbolsMapping = {};
      this.emit('clear');
    }

    /**
     * add graphic into the selections
     */

  }, {
    key: 'add',
    value: function add(graphic) {
      if (this.includes(graphic)) {
        return false;
      }
      this._setSelections([].concat(_toConsumableArray(this.selections), [{ gid: _shortid2.default.generate(), graphic: graphic }]));
      this.emit('add', graphic, this.getSelections());
    }

    /**
     * remove graphics from the selections
     */

  }, {
    key: 'remove',
    value: function remove(graphic) {
      var _this5 = this;

      if (!this.includes(graphic)) {
        return false;
      }
      var selections = this.selections;

      this._setSelections(selections.filter(function (s) {
        return !_this5._comparator(s.graphic, graphic);
      }));
      this.emit('remove', graphic, this.getSelections());
    }

    /**
     * get graphics from the selections
     */

  }, {
    key: 'getSelections',
    value: function getSelections() {
      return this.selections.map(function (s) {
        return s.graphic;
      });
    }

    /**
     * activate to enable user selection in the map
     */

  }, {
    key: 'activate',
    value: function activate(_ref4) {
      var _ref4$mode = _ref4.mode,
          mode = _ref4$mode === undefined ? GraphicSelectionManager.MODE.POINTER : _ref4$mode,
          _ref4$multiSelect = _ref4.multiSelect,
          multiSelect = _ref4$multiSelect === undefined ? true : _ref4$multiSelect;

      var selectorConstructor = null;
      if (mode === GraphicSelectionManager.MODE.POINTER) {
        selectorConstructor = _PointerSelector2.default;
      } else if (mode === GraphicSelectionManager.MODE.BOX) {
        selectorConstructor = _BoxSelector2.default;
      }

      if (!selectorConstructor) {
        throw new Error('unknown select mode ' + mode);
      }

      this._selector = new selectorConstructor(this, { multiSelect: multiSelect });
      this._selector.activate();
      this._active = true;
    }

    /**
     * deactivate to disable user selection in the map
     */

  }, {
    key: 'deactivate',
    value: function deactivate() {
      if (this._selector) {
        this._selector.deactivate();
        this._selector.destroy();
        this._selector = null;
      }
      this._active = false;
    }
  }]);

  return GraphicSelectionManager;
}(_eventemitter2.default);

GraphicSelectionManager.MODE = {
  POINTER: 'pointer',
  BOX: 'box'
};

exports.default = GraphicSelectionManager;