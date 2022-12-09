/**
 * Wrapper of native Event apis of the browser
 */

import {default as optionsUtil, OptionType} from "./utils/options";

export default class Evt {
  options: OptionType
  event: CustomEvent<any>
  type: string

  // instance of some event type that implement the native Event interface.
  target: EventTarget
  constructor(options: OptionType) {
    this.target = options.target

    const defaultOptions: OptionType = {
      // prefix of event type
      prefix: 'eov-',
    }

    this.options = optionsUtil.setOptions(defaultOptions, options)
  }

  /**
   * Create an new event
   */
  new(type: string, detail: CustomEventInit<any>) {
    this.type = this.options.prefix + type
    this.event = new CustomEvent(this.type, detail)
    return this
  }

  /**
   * Listen to an event
   */
  on(type: string, callback: EventListenerOrEventListenerObject, options?: boolean | AddEventListenerOptions) {
    this.target.addEventListener(type, callback, options)
    return this
  }

  /**
   * Remove event
   */
  off(type: string, callback: EventListenerOrEventListenerObject, options?: boolean | AddEventListenerOptions) {
    this.target.removeEventListener(type, callback, options)
    return this
  }

  /**
   * Dispatch an event
   */
  emit(type: string, detail: CustomEventInit<any>): boolean {
    this.new(type, detail)
    return this.target.dispatchEvent(this.event)
  }
}
