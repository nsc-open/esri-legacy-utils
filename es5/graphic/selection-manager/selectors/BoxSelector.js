'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _BaseSelector2 = require('./BaseSelector');

var _BaseSelector3 = _interopRequireDefault(_BaseSelector2);

var _esriModuleLoader = require('esri-module-loader');

var _esriModuleLoader2 = _interopRequireDefault(_esriModuleLoader);

var _constants = require('../constants');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var BoxSelector = function (_BaseSelector) {
  _inherits(BoxSelector, _BaseSelector);

  function BoxSelector(args) {
    _classCallCheck(this, BoxSelector);

    var _this = _possibleConstructorReturn(this, (BoxSelector.__proto__ || Object.getPrototypeOf(BoxSelector)).call(this, args));

    _this._mapMouseDownHandler = function (e) {
      if (!_this._ready) {
        return;
      }

      e.stopPropagation();

      var _this$_modules = _this._modules,
          Graphic = _this$_modules.Graphic,
          Polygon = _this$_modules.Polygon,
          SpatialReference = _this$_modules.SpatialReference;
      var mapPoint = e.mapPoint;

      var polygon = new Polygon(new SpatialReference({ wkid: 102100 }));

      _this._startPoint = mapPoint;
      _this._boxGraphic = new Graphic(polygon, _this._createLineSymbol());
      _this._tempGraphicsLayer.add(_this._boxGraphic);
    };

    _this._mapMouseMoveHandler = function (e) {
      if (_this._startPoint) {
        e.stopPropagation();

        var _this$_modules2 = _this._modules,
            Extent = _this$_modules2.Extent,
            Polygon = _this$_modules2.Polygon;
        var mapPoint = e.mapPoint;

        var ext = new Extent({
          xmin: Math.min(_this._startPoint.x, mapPoint.x), ymin: Math.min(_this._startPoint.y, mapPoint.y),
          xmax: Math.max(_this._startPoint.x, mapPoint.x), ymax: Math.max(_this._startPoint.y, mapPoint.y),
          spatialReference: { wkid: 102100 }
        });
        _this._boxGraphic.setGeometry(Polygon.fromExtent(ext));
        _this._boxGraphic.draw();
      }
    };

    _this._mapMouseUpHandler = function (e) {
      if (_this._boxGraphic) {
        e.stopPropagation();

        _this._computeIntersects(_this._boxGraphic.geometry);
        _this._tempGraphicsLayer.remove(_this._boxGraphic);
        _this._boxGraphic = null;
        _this._startPoint = null;
      }
    };

    _this.type = _constants.SELECTOR_TYPE.BOX;

    _this._tempGraphicsLayer = null;
    _this._startPoint = null;
    _this._boxGraphic = null;

    _this._ready = false;
    _this._modules = {};
    _this._handlers = [];

    _this._init();
    return _this;
  }

  _createClass(BoxSelector, [{
    key: '_init',
    value: function _init() {
      var _this2 = this;

      _esriModuleLoader2.default.loadModules(['GraphicsLayer', 'Color', 'SimpleLineSymbol', 'Graphic', 'Polygon', 'Extent', 'SpatialReference', 'geometryEngine']).then(function (modules) {
        _this2._modules = modules;
        _this2._createTempGraphicsLayer();
        _this2._ready = true;
      });
    }
  }, {
    key: '_createTempGraphicsLayer',
    value: function _createTempGraphicsLayer() {
      var map = this.selectionManager.map;
      var GraphicsLayer = this._modules.GraphicsLayer;

      var graphicsLayer = new GraphicsLayer({ id: '__box_selector_temp_graphics_layer__' });
      map.addLayer(this._tempGraphicsLayer = graphicsLayer);
    }
  }, {
    key: '_removeTempGraphicsLayer',
    value: function _removeTempGraphicsLayer() {
      var map = this.selectionManager.map;

      if (this._tempGraphicsLayer) {
        map.removeLayer(this._tempGraphicsLayer);
      }
    }
  }, {
    key: '_bindEvents',
    value: function _bindEvents() {
      var map = this.selectionManager.map;

      this._handlers = [map.on('mouse-drag-start', this._mapMouseDownHandler), map.on('mouse-drag', this._mapMouseMoveHandler), map.on('mouse-drag-end', this._mapMouseUpHandler)];
    }
  }, {
    key: '_unbindEvents',
    value: function _unbindEvents() {
      this._handlers.forEach(function (h) {
        return h.remove();
      });
    }
  }, {
    key: '_createLineSymbol',
    value: function _createLineSymbol() {
      var _modules = this._modules,
          SimpleLineSymbol = _modules.SimpleLineSymbol,
          Color = _modules.Color;

      return new SimpleLineSymbol(SimpleLineSymbol.STYLE_SOLID, new Color([255, 0, 0]), 1);
    }
  }, {
    key: '_computeIntersects',
    value: function _computeIntersects(boxGeometry) {
      var selectionManager = this.selectionManager;
      var geometryEngine = this._modules.geometryEngine;

      var selectedGraphics = selectionManager.graphicsLayer.graphics.filter(function (g) {
        return geometryEngine.intersects(boxGeometry, g.geometry);
      });
      selectionManager.select(selectedGraphics);
    }
  }, {
    key: 'destroy',
    value: function destroy() {
      this._removeTempGraphicsLayer();
    }
  }, {
    key: 'activate',
    value: function activate() {
      this._bindEvents();
      this.selectionManager.map.disableMapNavigation();
    }
  }, {
    key: 'deactivate',
    value: function deactivate() {
      this._unbindEvents();
      this.selectionManager.map.enableMapNavigation();
    }
  }]);

  return BoxSelector;
}(_BaseSelector3.default);

exports.default = BoxSelector;