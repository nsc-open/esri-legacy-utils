import Loader from 'esri-module-loader'
import { GEOMETRY_TYPES } from '../../geometry/constants'
import { getGeometryTypeFromJson } from '../../geometry/utils'

const { POINT, MULTIPOINT, POLYLINE, POLYGON, EXTENT } = GEOMETRY_TYPES
let SYMBOLS_CACHE

const setSymbol = graphic => {
  const type = getGeometryTypeFromJson(graphic.geometry)
  let symbol
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
  graphic.setSymbol(symbol)
}

export default graphic => {
  if (!SYMBOLS_CACHE) {
    Loader.loadModules([
      'SimpleMarkerSymbol', 'SimpleLineSymbol', 'SimpleFillSymbol', 'Color'
    ]).then(({ SimpleMarkerSymbol, SimpleLineSymbol, SimpleFillSymbol, Color }) => {
      const lightBlue = new Color([6, 253, 255])
      const fillColor = new Color([6, 253, 255, .5])
      const lineSymbol = new SimpleLineSymbol(SimpleLineSymbol.STYLE_DASH , lightBlue, 3)
      SYMBOLS_CACHE = {
        point: new SimpleMarkerSymbol(SimpleMarkerSymbol.STYLE_CIRCLE, 10, new SimpleLineSymbol(SimpleLineSymbol.STYLE_SOLID, lightBlue, 1), fillColor),
        line: lineSymbol,
        area: new SimpleFillSymbol(SimpleFillSymbol.STYLE_SOLID, lineSymbol, fillColor)
      }
      setSymbol(graphic)
    })
  } else {
    setSymbol(graphic)
  }
}

