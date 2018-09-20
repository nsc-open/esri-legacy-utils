import EventEmitter from 'eventemitter3'
import differenceWith from 'lodash.differencewith'
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
    this.selections = []

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
    this.emit('change', this.selections)
  }

  _saveOriginSymbol (graphic) {

  }

  _restoreOriginSymbol (graphic) {

  }

  _highlight (graphic) {
    this._saveOriginSymbol(graphic)
    this._highlighter(graphic)
  }

  _cancelHighlight (graphic) {
    this._restoreOriginSymbol(graphic)
  }

  /**
   * diff new selections and old selections, make sure graphics are highlighted correctly
   */
  _update (newSelections, oldSelections) {
    const graphicsToAdd = differenceWith(newSelections, oldSelections)
    const graphicsToRemove = differenceWith(oldSelections, newSelections)
    graphicsToAdd.forEach(g => this._highlight(g))
    graphicsToRemove.forEach(g => this._cancelHighlight(g))
  }

  /* public methods */

  /**
   * return whether graphics is in the selections or not
   */
  includes (graphic) {
    const match = this.selections.find(g => this._comparator(g, graphic))
    return !!match
  }

  select (graphics) {
    this._setSelections(graphics)
    this.emit('select', this.selections)
  }

  clear () {
    this._setSelections([])
    this.emit('clear')
  }

  add (graphic) {
    if (this.includes(graphic)) {
      return false
    }
    const { selections } = this
    selections.push(graphic)
    this._setSelections(selections)
    this.emit('add', graphic, this.selections)
  }

  remove (graphic) {
    if (!this.includes(graphic)) {
      return false
    }
    const { selections } = this
    this._setSelections(selections.filter(g => !this._comparator(g, graphic)))
    this.emit('remove', graphic, this.selections)
  }

  getSelections () {
    
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