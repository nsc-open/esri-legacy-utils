import BaseOperation from './BaseOperation'

const OP_TYPE = 'box-select'
class BoxSelectOperation extends BaseOperation {
  constructor (args) {
    super(args)

    this.graphicsLayer = null
    this.startPoint = null
    this.boxGraphic = null
    this.eventHandlers = []
    this.type = OP_TYPE
  }

  _createGraphicsLayer () {
    const { map, constructorMapping } = this
    const { GraphicsLayer } = constructorMapping
    const graphicsLayer = new GraphicsLayer({ id: 'GraphicBoxSelectTempGraphicsLayer' })
    map.addLayer(graphicsLayer)
    return graphicsLayer
  }

  _removeGraphicsLayer () {
    if (this.graphicsLayer) {
      this.map.removeLayer(this.graphicsLayer)
    }
  }

  _reset () {
    this._dettachEvents()
    this._removeGraphicsLayer()
    this.boxGraphic = null
    this.startPoint = null
    this.map.enableMapNavigation()
  }

  _attachEvents () {
    this.eventHandlers.push(this.map.on('mouse-drag-start', this._mapMouseDownHandler))
    this.eventHandlers.push(this.map.on('mouse-drag', this._mapMouseMoveHandler))
    this.eventHandlers.push(this.map.on('mouse-drag-end', this._mapMouseUpHandler))
  }

  _dettachEvents () {
    this.eventHandlers.forEach(h => h.remove())
  }

  _createLineSymbol () {
    const { SimpleLineSymbol, Color } = this.constructorMapping
    return new SimpleLineSymbol( SimpleLineSymbol.STYLE_SOLID, new Color([255, 0, 0]), 1)
  }

  _mapMouseDownHandler = e => {
    if (this.boxGraphic) {
      return
    }

    const { Graphic, Polygon, SpatialReference } = this.constructorMapping
    const { mapPoint } = e
    const polygon = new Polygon(new SpatialReference({ wkid: 102100 }))

    this.startPoint = mapPoint
    this.boxGraphic = new Graphic(polygon, this._createLineSymbol())
    this.graphicsLayer.add(this.boxGraphic)
  }

  _mapMouseMoveHandler = e => {
    if (this.boxGraphic) {
      const { Extent, Polygon } = this.constructorMapping
      const { mapPoint } = e
      const ext = new Extent({
        xmin: Math.min(this.startPoint.x, mapPoint.x), ymin: Math.min(this.startPoint.y, mapPoint.y),
        xmax: Math.max(this.startPoint.x, mapPoint.x), ymax: Math.max(this.startPoint.y, mapPoint.y),
        spatialReference: { wkid: 102100 }
      })
      this.boxGraphic.setGeometry(Polygon.fromExtent(ext))
      this.boxGraphic.draw()
    }
  }

  _mapMouseUpHandler = e => {
    if (this.boxGraphic) {
      this._computeIntersects(this.boxGraphic.geometry)
      this.graphicsLayer.remove(this.boxGraphic)
      this._reset()
    }
  }

  _computeIntersects (boxGeometry) {
    const { geometryEngine } = this.constructorMapping
    const selectedGraphics = this.operandGraphics.filter(g => geometryEngine.intersects(boxGeometry, g.geometry))
    this.emit('completed', selectedGraphics)
  }

  start () {
    this._reset()
    this.graphicsLayer = this._createGraphicsLayer()
    this._attachEvents()
    this.map.disableMapNavigation()
    this.emit('started')
  }

  // update (params) {}

  cancel () {
    this._reset()
    this.map.enableMapNavigation()
    this.emit('cancelled')
  }

  // complete () {}
}

BoxSelectOperation.TYPE = OP_TYPE

export default BoxSelectOperation
