import Button from "../src/button";

Button.define('button')

// 通过javascript实例化Button组件
const btn = new Button({})
btn.append('Button')
document.body.append(btn)
