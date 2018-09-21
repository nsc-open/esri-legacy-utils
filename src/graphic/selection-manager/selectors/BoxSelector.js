import BaseSelector from './BaseSelector'
import Loader from 'esri-module-loader'
import { SELECTOR_TYPE } from '../constants'

class BoxSelector extends BaseSelector {
  
  constructor (args) {
    super(args)

    this.type = SELECTOR_TYPE.BOX
    
    this._tempGraphicsLayer = null
    this._startPoint = null
    this._boxGraphic = null

    this._ready = false
    this._modules = {}
    this._handlers = []

    this._init()
  }

  _init () {
    Loader.loadModules([
      'GraphicsLayer', 'Color', 'SimpleLineSymbol', 'Graphic', 'Polygon',
      'Extent', 'SpatialReference', 'geometryEngine'
    ]).then(modules => {
      this._modules = modules
      this._createTempGraphicsLayer() 
      this._ready = true
    })
  }

  _createTempGraphicsLayer () {
    const { map } = this.selectionManager
    const { GraphicsLayer } = this._modules
    const graphicsLayer = new GraphicsLayer({ id: '__box_selector_temp_graphics_layer__' })
    map.addLayer(this._tempGraphicsLayer = graphicsLayer)
  }

  _removeTempGraphicsLayer () {
    const { map } = this.selectionManager
    if (this._tempGraphicsLayer) {
      map.removeLayer(this._tempGraphicsLayer)
    }
  }

  _bindEvents () {
    const { map } = this.selectionManager
    this._handlers = [
      map.on('mouse-drag-start', this._mapMouseDownHandler),
      map.on('mouse-drag', this._mapMouseMoveHandler),
      map.on('mouse-drag-end', this._mapMouseUpHandler)
    ]
  }

  _unbindEvents () {
    this._handlers.forEach(h => h.remove())
  }

  _createLineSymbol () {
    const { SimpleLineSymbol, Color } = this._modules
    return new SimpleLineSymbol( SimpleLineSymbol.STYLE_SOLID, new Color([255, 0, 0]), 1)
  }

  _mapMouseDownHandler = e => {
    if (!this._ready) {
      return
    }

    e.stopPropagation()

    const { Graphic, Polygon, SpatialReference } = this._modules
    const { mapPoint } = e
    const polygon = new Polygon(new SpatialReference({ wkid: 102100 }))

    this._startPoint = mapPoint
    this._boxGraphic = new Graphic(polygon, this._createLineSymbol())
    this._tempGraphicsLayer.add(this._boxGraphic)
  }

  _mapMouseMoveHandler = e => {
    if (this._startPoint) {
      e.stopPropagation()

      const { Extent, Polygon } = this._modules
      const { mapPoint } = e
      const ext = new Extent({
        xmin: Math.min(this._startPoint.x, mapPoint.x), ymin: Math.min(this._startPoint.y, mapPoint.y),
        xmax: Math.max(this._startPoint.x, mapPoint.x), ymax: Math.max(this._startPoint.y, mapPoint.y),
        spatialReference: { wkid: 102100 }
      })
      this._boxGraphic.setGeometry(Polygon.fromExtent(ext))
      this._boxGraphic.draw()
    }
  }

  _mapMouseUpHandler = e => {
    if (this._boxGraphic) {
      e.stopPropagation()

      this._computeIntersects(this._boxGraphic.geometry)
      this._tempGraphicsLayer.remove(this._boxGraphic)
      this._boxGraphic = null
      this._startPoint = null
    }
  }

  _computeIntersects (boxGeometry) {
    const { selectionManager } = this
    const { geometryEngine } = this._modules
    const selectedGraphics = selectionManager.graphicsLayer.graphics.filter(g => geometryEngine.intersects(boxGeometry, g.geometry))
    selectionManager.select(selectedGraphics)
  }

  destroy () {
    this._removeTempGraphicsLayer()
  }

  activate () {
    this._bindEvents()
    this.selectionManager.map.disableMapNavigation()
  }

  deactivate () {
    this._unbindEvents()
    this.selectionManager.map.enableMapNavigation()
  }
}

export default BoxSelector