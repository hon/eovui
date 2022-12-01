import { mergeDeep } from './helpers'

export default class Chart {
  options: Object

  constructor(options: Object) {
    const defaultOptions = {}

    this.options = mergeDeep(defaultOptions, options)

  }

}
