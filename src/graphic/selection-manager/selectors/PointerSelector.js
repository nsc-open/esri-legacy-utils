import BaseSelector from './BaseSelector'
import { SELECTOR_TYPE } from '../constants'

class PointerSelector extends BaseSelector {
  
  constructor (args, { multiSelect = true }) {
    super(args)
    this.type = SELECTOR_TYPE.POINTER

    this._multiSelect = multiSelect
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
    e.stopPropagation()
    const { graphic } = e
    const { selectionManager } = this
    
    if (selectionManager.includes(graphic)) {
      selectionManager.remove(graphic)
    } else {
      if (this._multiSelect) {
        selectionManager.add(graphic)
      } else {
        selectionManager.select([graphic])
      }
    }
  }

  _graphicMouseOverHandler = () => {
    this.selectionManager.map.setMapCursor('pointer')
  }

  _graphicMouseOutHandler = () => {
    this.selectionManager.map.setMapCursor('default')
  }

  _mapClickHandler = e => {
    this.selectionManager.clear()
  }

  activate () {
    this._bindEvents()
  }

  deactivate () {
    this._unbindEvents()
  }
}

export default PointerSelector