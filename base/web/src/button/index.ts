import EovElement from "../eov"
import { addTemplateElement as template } from "../utils"
// 实现参考：
// https://web-components.carbondesignsystem.com/?path=/docs/components-button--default
// https://www.w3.org/TR/wai-aria-practices/examples/button/button.html
// https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Roles/button_role
//
export default class Button extends EovElement{
  // 是否给class属性里面的值增加前缀
  prefixClassName: boolean

  static instances: Button[] = []

  constructor(opts: any) {
    super(opts)

    this.prefixClassName = true
  }

  connectedCallback() {
    let shadow = this.attachShadow({mode: 'open'})
    const htmlString = `
      <style scoped>
      :host {
        display: inline-block;
        cursor: pointer;
        padding: 2px 8px;
        border: 1px solid #999;
        border-radius: 3px;
      }
      :host([aria-disabled="true"]) {
        cursor: not-allowed;
      }
      </style>
      <span class="component-container">
        <button id="proxy-button" tabindex="-1" style="display:none;"></button>
        <slot part="default"></slot>
        <slot part="icon" name="icon"></slot>
      </span>
    `

    Button.instances.push(this)

    Button.instances.forEach((_, idx) => {
      this.setAttribute('instances-id', `${Button.tagName}-${idx}`)
    })

    console.log(Button.instances)
    let tplEl = template(htmlString, {}, shadow)
    let content = tplEl.content.cloneNode(true)
    shadow.append(content)

    this.#setDefaultAttrs()
  }


  // 覆盖默认addClass行为
  addClass() {}

  // 设置默认属性
  #setDefaultAttrs() {
    if (!this.hasAttribute('role')) {
      this.setAttribute('role', 'button')
    }
    if (!this.hasAttribute('tabindex')) {
      this.setAttribute('tabindex', '0')
    }
  }

  /*
  static define(name: string = 'button') {
    super.define(name)
  }
  */

}
