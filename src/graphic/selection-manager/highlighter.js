import Loader from 'esri-module-loader'
import { GEOMETRY_TYPES } from '../../geometry/constants'
import { getGeometryTypeFromJson } from '../../geometry/utils'

const { POINT, MULTIPOINT, POLYLINE, POLYGON, EXTENT } = GEOMETRY_TYPES

export default graphic => {
  let symbols

  const setSymbol = g => {
    const type = getGeometryTypeFromJson(g)
    let symbol
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
    g.setSymbol(symbol)
  }

  return (g => {
    if (!symbols) {
      Loader.loadModules([
        'SimpleMarkerSymbol', 'SimpleLineSymbol', 'SimpleFillSymbol', 'Color'
      ]).then(({ SimpleMarkerSymbol, SimpleLineSymbol, SimpleFillSymbol, Color }) => {
        const lightBlue = new Color([6, 253, 255])
        const fillColor = new Color([6, 253, 255, .5])
        symbols = {
          point: new SimpleMarkerSymbol(SimpleMarkerSymbol.STYLE_CIRCLE, 10, new SimpleLineSymbol(SimpleLineSymbol.STYLE_SOLID, lightBlue, 1), fillColor),
          line: new SimpleLineSymbol(SimpleLineSymbol.STYLE_DASH , lightBlue, 3),
          area: new SimpleFillSymbol(SimpleFillSymbol.STYLE_SOLID, lineSymbol, fillColor)
        }
        setSymbol(g)
      })
    } else {
      setSymbol(g)
    }
  })(graphic)
}

