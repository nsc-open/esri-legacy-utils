import BaseSelector from './BaseSelector'

class PointerSelector extends BaseSelector {
  
  constructor (args) {
    super(args)
    this._handlers = []
  }

  _bindEvents () {
    const { map, graphicsLayer } = this.selectionManager
    this._handlers = [
      graphicsLayer.on('click', this._graphicClickHandler),
      graphicsLayer.on('mouse-over', this._graphicMouseOverHandler),
      graphicsLayer.on('mouse-out', this._graphicMouseOutHandler),
      map.on('click', this._mapClickHandler)
    ]
  }

  _unbindEvents () {
    this._handlers.forEach(h => h.remove())
  }

  _graphicClickHandler = e => {
    if (!this._isActive()) {
      return
    }

    e.stopPropagation()
    const { graphic } = e
    const { selectionManager } = this
    
    if (selectionManager.includes(graphic)) {
      selectionManager.remove(graphic)
    } else {
      if (this._isMultiSelect()) {
        selectionManager.add(graphic)
      } else {
        selectionManager.select([graphic])
      }
    }
  }

  _graphicMouseOverHandler = () => {
    if (this._isActive()) {
      this.selectionManager.map.setMapCursor('pointer')
    }
  }

  _graphicMouseOutHandler = () => {
    if (this._isActive()) {
      this.selectionManager.map.setMapCursor('default')
    }
  }

  _mapClickHandler = e => {
    if (this._isActive()) {
      e.stopPropagation()
      this.selectionManager.clear()
    }
  }

  activate () {
    this._bindEvents()
  }

  deactivate () {
    this._unbindEvents()
  }
}

export default PointerSelector