'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.isMultiGeometry = exports.getGeometryType = exports.getGeometryTypeFromJson = undefined;

var _constants = require(' ./constants');

var isGeometryInstance = function isGeometryInstance() {
  var geometry = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
  return geometry.toJson && geometry.type && Object.values(_constants.GEOMETRY_TYPES).includes(geometry.type);
};
var getPolylinePaths = function getPolylinePaths() {
  var polyline = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
  return polyline.paths || polyline.curvePaths;
};
var getPolygonRings = function getPolygonRings() {
  var polygon = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
  return polygon.rings || polygon.curveRings;
};

/**
 * For geometry objects, please refer: https://developers.arcgis.com/documentation/common-data-types/geometry-objects.htm
 * 
 * @param {Object} geometryJson 
 */
var getGeometryTypeFromJson = exports.getGeometryTypeFromJson = function getGeometryTypeFromJson() {
  var geometryJson = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
  var POINT = _constants.GEOMETRY_TYPES.POINT,
      MULTIPOINT = _constants.GEOMETRY_TYPES.MULTIPOINT,
      POLYLINE = _constants.GEOMETRY_TYPES.POLYLINE,
      POLYGON = _constants.GEOMETRY_TYPES.POLYGON,
      EXTENT = _constants.GEOMETRY_TYPES.EXTENT;

  if ('x' in geometryJson) {
    return POINT;
  } else if ('xmin' in geometryJson) {
    return EXTENT;
  } else if (geometryJson.rings || geometryJson.curveRings) {
    return POLYGON;
  } else if (geometryJson.paths || geometryJson.curvePaths) {
    return POLYLINE;
  } else if (geometryJson.points) {
    return MULTIPOINT;
  } else {
    return null;
  }
};

/**
 * get geometry type by given geometry instance of geometry json object
 * 
 * @param {Geometry|GeometryJson} geometry 
 */
var getGeometryType = exports.getGeometryType = function getGeometryType() {
  var geometry = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

  if (isGeometryInstance(geometry)) {
    return geometry.type;
  } else {
    return getGeometryTypeFromJson(geometry);
  }
};

/**
 * multi point, multi polyline, multi polygon
 * @param {Geometry|GeometryJson} geometry
 */
var isMultiGeometry = exports.isMultiGeometry = function isMultiGeometry() {
  var geometry = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

  var type = getGeometryType(geometry);
  var POINT = _constants.GEOMETRY_TYPES.POINT,
      MULTIPOINT = _constants.GEOMETRY_TYPES.MULTIPOINT,
      POLYLINE = _constants.GEOMETRY_TYPES.POLYLINE,
      POLYGON = _constants.GEOMETRY_TYPES.POLYGON,
      EXTENT = _constants.GEOMETRY_TYPES.EXTENT;

  switch (type) {
    case MULTIPOINT:
      return true;
    case POLYLINE:
      return getPolylinePaths(geometry).length > 1;
    case POLYGON:
      return getPolygonRings(geometry).length > 1;
    case POINT:
    case EXTENT:
      return false;
    default:
      return false;
  }
};