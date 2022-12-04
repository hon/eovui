export type OptionType = {
  [key: string]: any
}

/**
 * Whether a value is an 'object' type or not 
 * @param {any} value
 * @return {boolean}
 */
export function isObject(value: any): boolean {
  return (value && typeof value === 'object' && !Array.isArray(value));
}

const options = {
  /**
   * Deep merge default and new options
   *
   * @param {OptionType} target - default options
   * @param {OptionType} source - new options
   * @return {OptionType} deep merged options
   */
  setOptions(target: OptionType, source: OptionType): OptionType {
    let output = Object.assign({}, target);
    if (isObject(target) && isObject(source)) {
      Object.keys(source).forEach(key => {
        if (isObject(source[key])) {
          if (!(key in target))
            Object.assign(output, { [key]: source[key] });
          else
            output[key] = this.setOptions(target[key], source[key]);
        } else {
          Object.assign(output, { [key]: source[key] });
        }
      });
    }
    return output;

  }
}

export default options

