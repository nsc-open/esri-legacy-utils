import EventEmitter from 'eventemitter3'
import differenceWith from 'lodash.differencewith'
import differenceBy from 'lodash.differenceby'
import intersectionWith from 'lodash.intersectionwith'
import shortid from 'shortid'

import { SELECTOR_TYPE } from './constants'
import highlighter from './highlighter'
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
    this.graphicsLayer = graphicsLayer || map.graphics
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

  /**
   * select graphics, will override the existing selections
   */
  select (graphics) {
    const oldGraphics = this.getSelections()
    const graphicsToAdd = differenceWith(graphics, oldGraphics, this._comparator)
    const graphicsToRemain = intersectionWith(oldGraphics, graphics, this._comparator)
    
    this._setSelections([
      ...(
        this.selections.filter(item => graphicsToRemain.find(g => this._comparator(g, item.graphic)))
      ),
      ...(
        graphicsToAdd.map(graphic => ({ gid: shortid.generate(), graphic }))
      )
    ])
    this.emit('select', graphics)
  }

  /**
   * clear selections
   */
  clear () {
    this._setSelections([])
    this._originSymbolsMapping = {}
    this.emit('clear')
  }

  /**
   * add graphic into the selections
   */
  add (graphic) {
    if (this.includes(graphic)) {
      return false
    }
    this._setSelections([...this.selections, { gid: shortid.generate(), graphic }])
    this.emit('add', graphic, this.getSelections())
  }

  /**
   * remove graphics from the selections
   */
  remove (graphic) {
    if (!this.includes(graphic)) {
      return false
    }
    const { selections } = this
    this._setSelections(selections.filter(s => !this._comparator(s.graphic, graphic)))
    this.emit('remove', graphic, this.getSelections())
  }

  /**
   * get graphics from the selections
   */
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
    if (this._active) {
      this.deactivate()
    }

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
    this._selector.activate()
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

GraphicSelectionManager.MODE = SELECTOR_TYPE

export default GraphicSelectionManager