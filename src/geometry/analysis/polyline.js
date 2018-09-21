import Loader from 'esri-module-loader'

/**
 * polyline should use spatialReference { wkid: 4326 }
 * 
 * @param {Polyline}  polyline
 * @param {Object}    options { lengthUnit: units.KILOMETERS, reverse: false }
 * @return {Array} [{
 *   length, curvature,
 *   points: [{ x, y, lat, lng, accumulatedLength }],
 *   segments: [{ startPointIndex, endPointIndex, length, forwardAngle }]
 * }]
 */
export const getLineInfo = (polyline, options = {}) => {
  
  return loadModules([
    'Graphic', 'Polyline', 'SpatialReference',
    'webMercatorUtils', 'geodesicUtils', 'units'
  ]).then(({
    Graphic, Polyline, SpatialReference, webMercatorUtils, geodesicUtils, units
  }) => {
    const LENGTH_UNIT = options.lengthUnit || units.KILOMETERS
    const SPR = new SpatialReference({ wkid: 4326 })
    const reverse = options.reverse || false

    const lineinfo = {}
    if(polyline.spatialReference.wkid == 102100){
      polyline = webMercatorUtils.webMercatorToGeographic(polyline)
    }

    const cornerCount = polyline.paths[0].length
    lineinfo.cornerCount = cornerCount
    const segmentLines = []
    const points = []
    points.push(polyline.getPoint(0, 0))
    for (let i = 1; i < cornerCount; i++) {
      points.push(polyline.getPoint(0, i))
      const line = new Polyline(SPR)
      line.addPath([]);
      line.insertPoint(0, 0, polyline.getPoint(0, i - 1))
      line.insertPoint(0, 1, polyline.getPoint(0, i))
      segmentLines.push(line)
    }

    const lineLengths = geodesicUtils.geodesicLengths(segmentLines, LENGTH_UNIT);
    lineinfo.segments = []
    lineinfo.segments.push({
      forwardAngle: 0,
      sumLength: 0,
      length: 0,
      lon: points[0].x,
      lat: points[0].y
    })
    let totalLength = 0
    lineLengths.forEach((length, i, arr) => {
      let angle = 0
      if (i < cornerCount - 2) {
        angle = 180 - measureAngle(points[i], points[i + 1], points[i + 2])
      }
      totalLength += length
      lineinfo.segments.push({
        forwardAngle: angle,
        sumLength: totalLength,
        length,
        lon: points[i + 1].x,
        lat: points[i + 1].y
      })
    })
    lineinfo.totalLength = totalLength

    const straightLine = new Polyline(SPR)
    straightLine.addPath([])
    straightLine.insertPoint(0, 0, points[0])
    straightLine.insertPoint(0, 1, points[cornerCount - 1])
    const straightLength = geodesicUtils.geodesicLengths([straightLine], LENGTH_UNIT)[0]
    lineinfo.curvature = totalLength/straightLength
    return lineinfo
  })
}