import { GEOMETRY_TYPES } from './constants'

const isGeometryInstance = (geometry = {}) => geometry.toJson && geometry.type && Object.values(GEOMETRY_TYPES).includes(geometry.type)
const getPolylinePaths = (polyline = {}) => polyline.paths || polyline.curvePaths
const getPolygonRings = (polygon = {}) => polygon.rings || polygon.curveRings

/**
 * For geometry objects, please refer: https://developers.arcgis.com/documentation/common-data-types/geometry-objects.htm
 * 
 * @param {Object} geometryJson 
 */
export const getGeometryTypeFromJson = (geometryJson = {}) => {
  const { POINT, MULTIPOINT, POLYLINE, POLYGON, EXTENT } = GEOMETRY_TYPES
  if ('x' in geometryJson) {
    return POINT
  } else if ('xmin' in geometryJson) {
    return EXTENT
  } else if (geometryJson.rings || geometryJson.curveRings) {
    return POLYGON
  } else if (geometryJson.paths || geometryJson.curvePaths) {
    return POLYLINE
  } else if (geometryJson.points) {
    return MULTIPOINT
  } else {
    return null
  }
}

/**
 * get geometry type by given geometry instance of geometry json object
 * 
 * @param {Geometry|GeometryJson} geometry 
 */
export const getGeometryType = (geometry = {}) => {
  if (isGeometryInstance(geometry)) {
    return geometry.type
  } else {
    return getGeometryTypeFromJson(geometry)
  }
}

/**
 * multi point, multi polyline, multi polygon
 * @param {Geometry|GeometryJson} geometry
 */
export const isMultiGeometry = (geometry = {}) => {
  const type = getGeometryType(geometry)
  const { POINT, MULTIPOINT, POLYLINE, POLYGON, EXTENT } = GEOMETRY_TYPES
  switch (type) {
    case MULTIPOINT:
      return true
    case POLYLINE:
      return getPolylinePaths(geometry).length > 1
    case POLYGON:
      return getPolygonRings(geometry).length > 1
    case POINT:
    case EXTENT:
      return false
    default:
      return false
  }
}