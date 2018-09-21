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

exports.default = function (graphic) {
  var symbols = void 0;

  var setSymbol = function setSymbol(g) {
    var type = (0, _utils.getGeometryTypeFromJson)(g);
    var symbol = void 0;
    switch (type) {
      case POINT:
      case MULTIPOINT:
        symbol = symbols.point;
        break;
      case POLYLINE:
        symbol = symbols.line;
        break;
      case POLYGON:
      case EXTENT:
        symbol = symbols.area;
        break;
    }
    g.setSymbol(symbol);
  };

  return function (g) {
    if (!symbols) {
      _esriModuleLoader2.default.loadModules(['SimpleMarkerSymbol', 'SimpleLineSymbol', 'SimpleFillSymbol', 'Color']).then(function (_ref) {
        var SimpleMarkerSymbol = _ref.SimpleMarkerSymbol,
            SimpleLineSymbol = _ref.SimpleLineSymbol,
            SimpleFillSymbol = _ref.SimpleFillSymbol,
            Color = _ref.Color;

        var lightBlue = new Color([6, 253, 255]);
        var fillColor = new Color([6, 253, 255, .5]);
        symbols = {
          point: new SimpleMarkerSymbol(SimpleMarkerSymbol.STYLE_CIRCLE, 10, new SimpleLineSymbol(SimpleLineSymbol.STYLE_SOLID, lightBlue, 1), fillColor),
          line: new SimpleLineSymbol(SimpleLineSymbol.STYLE_DASH, lightBlue, 3),
          area: new SimpleFillSymbol(SimpleFillSymbol.STYLE_SOLID, lineSymbol, fillColor)
        };
        setSymbol(g);
      });
    } else {
      setSymbol(g);
    }
  }(graphic);
};