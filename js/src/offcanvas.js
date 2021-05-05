/**
 * --------------------------------------------------------------------------
 * Bootstrap (v5.0.1): offcanvas.js
 * Licensed under MIT (https://github.com/twbs/bootstrap/blob/master/LICENSE)
 * --------------------------------------------------------------------------
 */

import { defineJQueryPlugin } from './util/index'
import ScrollBarHelper from './util/scrollbar'
import EventHandler from './dom/event-handler'
import SelectorEngine from './dom/selector-engine'
import Backdrop from './util/backdrop'
import Simple from './simple'

/**
 * ------------------------------------------------------------------------
 * Constants
 * ------------------------------------------------------------------------
 */

const NAME = 'offcanvas'
const DATA_KEY = 'bs.offcanvas'
const EVENT_KEY = `.${DATA_KEY}`
const DATA_API_KEY = '.data-api'
const EVENT_LOAD_DATA_API = `load${EVENT_KEY}${DATA_API_KEY}`
const ESCAPE_KEY = 'Escape'

const Default = {
  backdrop: true,
  keyboard: true,
  scroll: false
}

const DefaultType = {
  backdrop: 'boolean',
  keyboard: 'boolean',
  scroll: 'boolean'
}

const OPEN_SELECTOR = '.offcanvas.show'

const EVENT_FOCUSIN = 'focusin'
const EVENT_KEYDOWN_DISMISS = 'keydown.dismiss'

/**
 * ------------------------------------------------------------------------
 * Class Definition
 * ------------------------------------------------------------------------
 */

class Offcanvas extends Simple {
  constructor(element, config) {
    super(element, config)

    this._backdrop = this._initializeBackDrop()
    this._addEventListeners()
  }

  // Getters

  static get Default() {
    return Default
  }

  static get NAME() {
    return NAME
  }

  // Public

  _beforeShow() {
    this._element.style.visibility = 'visible'

    this._backdrop.show()

    if (!this._config.scroll) {
      new ScrollBarHelper().hide()
      this._enforceFocusOnElement(this._element)
    }

    this._element.removeAttribute('aria-hidden')
    this._element.setAttribute('aria-modal', true)
    this._element.setAttribute('role', 'dialog')
  }

  _beforeHide() {
    this._backdrop.hide()
  }

  _afterHide() {
    this._element.setAttribute('aria-hidden', true)
    this._element.removeAttribute('aria-modal')
    this._element.removeAttribute('role')
    this._element.style.visibility = 'hidden'

    if (!this._config.scroll) {
      new ScrollBarHelper().reset()
    }
  }

  dispose() {
    this._backdrop.dispose()
    super.dispose()
    EventHandler.off(document, this._eventName(EVENT_FOCUSIN))
  }

  // Private

  _initializeBackDrop() {
    return new Backdrop({
      isVisible: this._config.backdrop,
      isAnimated: true,
      rootElement: this._element.parentNode,
      clickCallback: () => this.hide()
    })
  }

  _enforceFocusOnElement(element) {
    EventHandler.off(document, this._eventName(EVENT_FOCUSIN)) // guard against infinite focus loop
    EventHandler.on(document, this._eventName(EVENT_FOCUSIN), event => {
      if (document !== event.target &&
        element !== event.target &&
        !element.contains(event.target)) {
        element.focus()
      }
    })
    element.focus()
  }

  // eslint-disable-next-line no-unused-vars
  _mayCloseOpen(allReadyOpen, aboutToOpen) {
    Offcanvas.getInstance(allReadyOpen).hide()
  }

  _addEventListeners() {
    EventHandler.on(this._element, this._eventName(EVENT_KEYDOWN_DISMISS), event => {
      if (this._config.keyboard && event.key === ESCAPE_KEY) {
        this.hide()
      }
    })
  }
}

EventHandler.on(window, EVENT_LOAD_DATA_API, () =>
  SelectorEngine.find(OPEN_SELECTOR).forEach(el => Offcanvas.getOrCreateInstance(el).show())
)

/**
 * ------------------------------------------------------------------------
 * jQuery
 * ------------------------------------------------------------------------
 */

defineJQueryPlugin(Offcanvas)

export default Offcanvas
