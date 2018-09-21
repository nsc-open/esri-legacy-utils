'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _esriModuleLoader = require('esri-module-loader');

var _esriModuleLoader2 = _interopRequireDefault(_esriModuleLoader);

var _constants = require('../../geometry/constants');

var _utils = require('../../geometry/utils');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var POINT = _constants.GEOMETRY_TYPES.POINT,
    MULTIPOINT = _constants.GEOMETRY_TYPES.MULTIPOINT,
    POLYLINE = _constants.GEOMETRY_TYPES.POLYLINE,
    POLYGON = _constants.GEOMETRY_TYPES.POLYGON,
    EXTENT = _constants.GEOMETRY_TYPES.EXTENT;

var SYMBOLS_CACHE = void 0;

var setSymbol = function setSymbol(graphic) {
  var type = (0, _utils.getGeometryTypeFromJson)(graphic.geometry);
  var symbol = void 0;
  switch (type) {
    case POINT:
    case MULTIPOINT:
      symbol = SYMBOLS_CACHE.point;
      break;
    case POLYLINE:
      symbol = SYMBOLS_CACHE.line;
      break;
    case POLYGON:
    case EXTENT:
      symbol = SYMBOLS_CACHE.area;
      break;
  }
  graphic.setSymbol(symbol);
};

exports.default = function (graphic) {
  if (!SYMBOLS_CACHE) {
    _esriModuleLoader2.default.loadModules(['SimpleMarkerSymbol', 'SimpleLineSymbol', 'SimpleFillSymbol', 'Color']).then(function (_ref) {
      var SimpleMarkerSymbol = _ref.SimpleMarkerSymbol,
          SimpleLineSymbol = _ref.SimpleLineSymbol,
          SimpleFillSymbol = _ref.SimpleFillSymbol,
          Color = _ref.Color;

      var lightBlue = new Color([6, 253, 255]);
      var fillColor = new Color([6, 253, 255, .5]);
      var lineSymbol = new SimpleLineSymbol(SimpleLineSymbol.STYLE_DASH, lightBlue, 3);
      SYMBOLS_CACHE = {
        point: new SimpleMarkerSymbol(SimpleMarkerSymbol.STYLE_CIRCLE, 10, new SimpleLineSymbol(SimpleLineSymbol.STYLE_SOLID, lightBlue, 1), fillColor),
        line: lineSymbol,
        area: new SimpleFillSymbol(SimpleFillSymbol.STYLE_SOLID, lineSymbol, fillColor)
      };
      setSymbol(graphic);
    });
  } else {
    setSymbol(graphic);
  }
};