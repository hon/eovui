export { default as Evt} from "./evt";
export {
  default as Plugin,
  PluginManager,
  PluginRegister,
  IPlugin
} from "./plugin";

export {default as optionsUtil, OptionType} from './options'

// 任意对象类型
export interface AnyObject {
  [key: string]: any
}

/**
 * 将html string转化为template
 * 通过这个函数就可以将外部的html文件解析成template
 *
 * @param {string} htmlString     - 合法的html
 * @param {Object} attrs          - template元素的属性
 * @param {HTMLElement}           - 父元素
 * @returns {HTMLTemplateElement} - 被添加的template元素
 *
 * ref: 
 * https://stackoverflow.com/questions/494143/creating-a-new-dom-element-from-an-html-string-using-built-in-dom-methods-or-pro
 */
export function addTemplateElement(htmlString: string, attrs: Object, parent: HTMLElement | ShadowRoot) {
  let el = document.createElement('template')
  
  // 设置template的属性
  for (const [k, v] of Object.entries(attrs)) {
    el.setAttribute(k, v)
  }

  el.innerHTML = htmlString.trim()
  parent.append(el)
  return el
}
console.log('@eovui/utils, version: 0.0.1')


