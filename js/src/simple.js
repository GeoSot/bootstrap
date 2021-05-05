/**
 * --------------------------------------------------------------------------
 * Bootstrap (v5.0.0): simple.js
 * Licensed under MIT (https://github.com/twbs/bootstrap/blob/main/LICENSE)
 * --------------------------------------------------------------------------
 */

import {
  defineJQueryPlugin, emulateTransitionEnd, execute, getElementFromSelector, getTransitionDurationFromElement, isDisabled, isVisible,
  typeCheckConfig
} from './util/index'
import Data from './dom/data'
import EventHandler from './dom/event-handler'
import Manipulator from './dom/manipulator'
import BaseComponent from './base-component'
import SelectorEngine from './dom/selector-engine'
import Offcanvas from './offcanvas'

/**
 * ------------------------------------------------------------------------
 * Constants
 * ------------------------------------------------------------------------
 */

const NAME = 'simple'
const DATA_API_KEY = '.data-api'

const EVENT_DISPOSE = 'dispose'
const EVENT_DISPOSED = 'disposed'
const EVENT_HIDE = 'hide'
const EVENT_HIDDEN = 'hidden'
const EVENT_SHOW = 'show'
const EVENT_SHOWN = 'shown'

const CLASS_NAME_FADE = 'fade'
const DefaultType = {
  showClass: 'string',
  transitioningClass: 'string'
}

const Default = {
  showClass: 'show',
  transitioningClass: 'transitioning'
}

/**
 * ------------------------------------------------------------------------
 * Class Definition
 * ------------------------------------------------------------------------
 */

class Simple extends BaseComponent {
  constructor(element, config) {
    super(element)

    this._config = this._getConfig(config)
    this._setDismissListener()
    this._setDataTriggerListener()
  }

  // Getters

  static get DefaultType() {
    return DefaultType
  }

  static get Default() {
    return Default
  }

  toggle(relatedTarget) {
    return this._isShown() ? this.hide(relatedTarget) : this.show(relatedTarget)
  }

  // Public

  show(relatedTarget) {
    if (this._isTransitioning() || this._isShown()) {
      return
    }

    const showEvent = EventHandler.trigger(this._element, this._eventName(EVENT_SHOW), { relatedTarget })

    if (showEvent.defaultPrevented) {
      return
    }

    const complete = () => {
      this._element.classList.remove(this._config.transitioningClass)
      this._element.classList.add(this._config.showClass)
      this._afterShow()
      EventHandler.trigger(this._element, this._eventName(EVENT_SHOWN))
    }

    this._beforeShow()
    this._queueCallback(this._element, complete, this._isAnimated())
  }

  hide(relatedTarget) {
    if (this._isTransitioning() || !this._isShown()) {
      return
    }

    const hideEvent = EventHandler.trigger(this._element, this._eventName(EVENT_HIDE), { relatedTarget })

    if (hideEvent.defaultPrevented) {
      return
    }

    this._element.blur()
    this._element.classList.add(this._config.transitioningClass)
    const complete = () => {
      this._element.classList.remove(this._config.transitioningClass)
      this._element.classList.remove(this._config.showClass)
      this._afterHide()
      EventHandler.trigger(this._element, this._eventName(EVENT_HIDDEN))
    }

    this._beforeHide()
    this._queueCallback(this._element, complete, this._isAnimated())
  }

  dispose() {
    const disposeEvent = EventHandler.trigger(this._element, this._eventName(EVENT_DISPOSE))

    if (disposeEvent.defaultPrevented) {
      return
    }

    if (this._isShown()) {
      this.hide()
    }

    super.dispose()
    EventHandler.trigger(this._element, this._eventName(EVENT_DISPOSED))
  }

  // Private

  _isShown() {
    return this._element.classList.contains(this._config.showClass)
  }

  _isAnimated() {
    return this._element.classList.contains(CLASS_NAME_FADE)
  }

  _isTransitioning() {
    return this._element.classList.contains(this._config.transitioningClass)
  }

  _getConfig(config) {
    config = {
      ...Default,
      ...Manipulator.getDataAttributes(this._element),
      ...(typeof config === 'object' && config ? config : {})
    }

    typeCheckConfig(NAME, config, this.constructor.DefaultType)

    return config
  }

  _afterShow() {
  }

  _beforeShow() {
  }

  _afterHide() {
  }

  _beforeHide() {
  }

  // eslint-disable-next-line no-unused-vars
  _mayCloseOpen(allReadyOpen, aboutToOpen) {
  }

  _queueCallback(elem, completeCallBack, animated) {
    if (animated) {
      const transitionDuration = getTransitionDurationFromElement(elem)
      EventHandler.one(elem, 'transitionend', () => execute(completeCallBack))
      emulateTransitionEnd(elem, transitionDuration)
      return
    }

    execute(completeCallBack)
  }

  _eventName(name) {
    return name + this.constructor.EVENT_KEY
  }

  _setDismissListener() {
    EventHandler.on(this._element, this._eventName('click.dismiss'), `[data-bs-dismiss="${this.constructor.NAME}"]`, () => this.hide())
  }

  _setDataTriggerListener() {
    /**
     * ------------------------------------------------------------------------
     * Data Api implementation
     * ------------------------------------------------------------------------
     */
    EventHandler.on(document, this._eventName('click') + DATA_API_KEY, `[data-bs-toggle="${this.constructor.NAME}"]`, event => {
      const target = getElementFromSelector(event.target)

      if (['A', 'AREA'].includes(event.target.tagName)) {
        event.preventDefault()
      }

      if (isDisabled(event.target)) {
        return
      }

      // avoid conflict when clicking a toggler of an offcanvas, while another is open
      const allReadyOpen = SelectorEngine.findOne('offcavnas.show')
      if (allReadyOpen && allReadyOpen !== target) {
        this._mayCloseOpen(allReadyOpen, event.target)
      }

      EventHandler.one(target, EVENT_HIDDEN, () => {
        // focus on trigger when it is closed
        if (isVisible(this)) {
          this.focus()
        }
      })
    })
  }

  // Static

  static jQueryInterface(config) {
    return this.each(function () {
      const data = Data.get(this, this.constructor.DATA_KEY) || new this(this, typeof config === 'object' ? config : {})

      if (typeof config !== 'string') {
        return
      }

      if (data[config] === undefined || config.startsWith('_') || config === 'constructor') {
        throw new TypeError(`No method named "${config}"`)
      }

      data[config](this)
    })
  }
}

/**
 * ------------------------------------------------------------------------
 * jQuery
 * ------------------------------------------------------------------------
 * add .Toast to jQuery only if jQuery is present
 */

defineJQueryPlugin(NAME, Simple)

export default Simple
