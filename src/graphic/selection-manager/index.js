import EventEmitter from 'eventemitter3'
import differenceBy from 'lodash.differenceby'
import shortid from 'shortid'

import highlighter from './highlight'
import BoxSelector from './selectors/BoxSelector'
import PointerSelector from './selectors/PointerSelector'

const defaultGraphicComparator = (g1, g2) => g1 === g2
const defaultHighlighter = highlighter

class GraphicSelectionManager extends EventEmitter {

  constructor ({
    map,
    graphicsLayer,
    highlighter = defaultHighlighter,
    comparator = defaultGraphicComparator
  }) {
    super()

    if (!map) {
      throw Error('map instance is required')
    }

    /* public attributes */
    this.map = map
    this.graphicsLayer = graphicsLayer ? graphicsLayer : map.graphics
    this.selections = [] // [{ gid, graphic }]

    /* private attributes */
    this._comparator = comparator
    this._highlighter = highlighter
    this._selector = null
    this._active = false
    this._originSymbolsMapping = {} // { [gid]: symbol }
  }

  /* private methods */

  _setSelections (newSelections) {
    const oldSelections = this.selections
    this.selections = newSelections
    this._update(newSelections, oldSelections)
    this.emit('change', this.getSelections())
  }

  _saveOriginSymbol ({ gid, graphic }) {
    this._originSymbolsMapping[gid] = graphic.symbol
  }

  _restoreOriginSymbol ({ gid, graphic }) {
    graphic.setSymbol(this._originSymbolsMapping[gid])
  }

  _highlight (item) {
    this._saveOriginSymbol(item)
    this._highlighter(item.graphic)
  }

  _cancelHighlight (item) {
    this._restoreOriginSymbol(item)
  }

  /**
   * diff new selections and old selections, make sure graphics are highlighted correctly
   */
  _update (newSelections, oldSelections) {
    const itemsToAdd = differenceBy(newSelections, oldSelections, s => s.gid)
    const itemsToRemove = differenceBy(oldSelections, newSelections, s => s.gid)
    itemsToAdd.forEach(item => this._highlight(item))
    itemsToRemove.forEach(item => this._cancelHighlight(item))
  }

  /* public methods */

  /**
   * return whether graphics is in the selections or not
   */
  includes (graphic) {
    const match = this.selections.find(s => this._comparator(s.graphic, graphic))
    return !!match
  }

  select (graphics) {
    this._setSelections(graphics.map(graphic => ({ gid: shortid.generate(), graphic })))
    this.emit('select', graphics)
  }

  clear () {
    this._setSelections([])
    this._originSymbolsMapping = {}
    this.emit('clear')
  }

  add (graphic) {
    if (this.includes(graphic)) {
      return false
    }
    const { selections } = this
    selections.push({ gid: shortid.generate(), graphic })
    this._setSelections(selections)
    this.emit('add', graphic, this.getSelections())
  }

  remove (graphic) {
    if (!this.includes(graphic)) {
      return false
    }
    const { selections } = this
    this._setSelections(selections.filter(s => !this._comparator(s.graphic, graphic)))
    this.emit('remove', graphic, this.getSelections())
  }

  getSelections () {
    return this.selections.map(s => s.graphic)
  }

  /**
   * activate to enable user selection in the map
   */
  activate ({
    mode = GraphicSelectionManager.MODE.POINTER,
    multiSelect = true
  }) {
    let selectorConstructor = null
    if (mode === GraphicSelectionManager.MODE.POINTER) {
      selectorConstructor = PointerSelector
    } else if (mode === GraphicSelectionManager.MODE.BOX) {
      selectorConstructor = BoxSelector
    }

    if (!selectorConstructor) {
      throw new Error(`unknown select mode ${mode}`)
    }

    this._selector = new selectorConstructor(this, { multiSelect })
    this._active = true
  }

  /**
   * deactivate to disable user selection in the map
   */
  deactivate () {
    if (this._selector) {
      this._selector.deactivate()
      this._selector.destroy()
      this._selector = null
    }
    this._active = false
  }
}

GraphicSelectionManager.MODE = {
  POINTER: 'pointer',
  BOX: 'box'
}

export default GraphicSelectionManager