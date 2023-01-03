/**
 * Wrapper of HTMLElement
 */

export default class HTMLEovElement extends HTMLElement {
  constructor(opts: unknown) {
    super()
  }
  // prefix 存在有两个目的
  // 1. 统一定义自定义元素的名称前缀
  // 2. 统一定义css class name前缀
  static prefix: string = 'eov'

  static tagName: string

  /**
   * 定义元素，封装了customElemtns.define
   * 第三方开发者可以基于此定义自定义的tag name:
   * ```javascript
   * import Icon from  '@shui/icon'
   * class MyIcon extends Icon {}
   * customElements.define("my-icon", MyIcon);
   * // 实例化eov-my-icon有两种方式
   * // 1. <eov-my-icon></eov-my-icon>
   * // 2. 通过javascript
   * const myRating = document.createElement("my-icon");
   * ```
   * Reference: https://github.com/elix/plain-example
   *
   * 这里封装的目的是为了统一管理自定义组件的prefix和name
   *
   * @param {string} name - 自定义元素的名称（不需要前缀）
   * @param {CustomElementConstructor} c - 构造函数
   * @returns {void}
   */
  static define(
    name: string,
    c: CustomElementConstructor = this.prototype.constructor as CustomElementConstructor) {
    this.tagName = `${HTMLEovElement.prefix}-${name}`
    
    // Do not define more then once
    if (window.customElements.get(this.tagName) === undefined) {
      window.customElements.define(`${HTMLEovElement.prefix}-${name}`, c)
    }
  }
  
  /**
   * 一个页面里面的某个组件可以通过调用style静态方法进行配置样式
   *
   * @param {unknown} opts 配置信息
   * @return 配置信息
   */
  static style(opts: unknown) {
    return Object.assign({
      // css文件路径
      url: '',  

      // 主题名称
      theme: 'default',  

      // css变量
      vars: {},  
    }, opts)
  }
}


