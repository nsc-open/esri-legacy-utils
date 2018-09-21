'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _BaseSelector2 = require('./BaseSelector');

var _BaseSelector3 = _interopRequireDefault(_BaseSelector2);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var PointerSelector = function (_BaseSelector) {
  _inherits(PointerSelector, _BaseSelector);

  function PointerSelector(args, _ref) {
    var _ref$multiSelect = _ref.multiSelect,
        multiSelect = _ref$multiSelect === undefined ? true : _ref$multiSelect;

    _classCallCheck(this, PointerSelector);

    var _this = _possibleConstructorReturn(this, (PointerSelector.__proto__ || Object.getPrototypeOf(PointerSelector)).call(this, args));

    _this._graphicClickHandler = function (e) {
      e.stopPropagation();
      var graphic = e.graphic;
      var selectionManager = _this.selectionManager;


      if (selectionManager.includes(graphic)) {
        selectionManager.remove(graphic);
      } else {
        if (_this._multiSelect) {
          selectionManager.add(graphic);
        } else {
          selectionManager.select([graphic]);
        }
      }
    };

    _this._graphicMouseOverHandler = function () {
      _this.selectionManager.map.setMapCursor('pointer');
    };

    _this._graphicMouseOutHandler = function () {
      _this.selectionManager.map.setMapCursor('default');
    };

    _this._mapClickHandler = function (e) {
      _this.selectionManager.clear();
    };

    _this._multiSelect = multiSelect;
    _this._handlers = [];
    return _this;
  }

  _createClass(PointerSelector, [{
    key: '_bindEvents',
    value: function _bindEvents() {
      var _selectionManager = this.selectionManager,
          map = _selectionManager.map,
          graphicsLayer = _selectionManager.graphicsLayer;

      this._handlers = [graphicsLayer.on('click', this._graphicClickHandler), graphicsLayer.on('mouse-over', this._graphicMouseOverHandler), graphicsLayer.on('mouse-out', this._graphicMouseOutHandler), map.on('click', this._mapClickHandler)];
    }
  }, {
    key: '_unbindEvents',
    value: function _unbindEvents() {
      this._handlers.forEach(function (h) {
        return h.remove();
      });
    }
  }, {
    key: 'activate',
    value: function activate() {
      this._bindEvents();
    }
  }, {
    key: 'deactivate',
    value: function deactivate() {
      this._unbindEvents();
    }
  }]);

  return PointerSelector;
}(_BaseSelector3.default);

exports.default = PointerSelector;