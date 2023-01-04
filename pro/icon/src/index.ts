import HTMLEovElement from "@eovui/core"

import './assets/styles/index.scss'
import { addTemplateElement as template } from "@eovui/utils"

// 参考：https://ionic.io/ionicons
export default class Icon extends HTMLEovElement{

  constructor(opts: any) {
    super(opts)
  }

  connectedCallback() {
    let shadow = this.attachShadow({mode: 'open'})
    const html = `
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

    let tplEl = template(html, {}, shadow)
    let content = tplEl.content.cloneNode(true)
    shadow.append(content)

    this.#setDefaultAttrs()
  }


  // 设置默认属性
  #setDefaultAttrs() {
    if (!this.hasAttribute('role')) {
      this.setAttribute('role', 'icon')
    }
    if (!this.hasAttribute('tabindex')) {
      this.setAttribute('tabindex', '0')
    }
  }
}
