class BaseSelector {
  
  constructor (selectionManager, {
    multiSelect = true
  }) {
    this.selectionManager = selectionManager
    this._multiSelect = multiSelect
  }

  _isActive () {
    return this.selectionManager._active
  }

  _isMultiSelect () {
    return this._multiSelect
  }
}

export default BaseSelector