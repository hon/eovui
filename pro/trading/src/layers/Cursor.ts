import { Layer } from './index'
import Chart from '../Chart'
import {default as optionsUtil, OptionType } from '../utils/options'

// 游标
export default class Cursor extends Layer {
  options: OptionType
  chart: Chart
  constructor(options: OptionType) {
    super()
    const defaultOptions = {
      cursor: 'crosshair'
      
    }
    this.options = optionsUtil.setOptions(defaultOptions, options)

    this.chart = this.options.chart

    this.chart.canvas.style.cursor = this.options.cursor

    const self = this
    this.chart.mouseMoveEvent((evt: any) => {
      self.chart.update()
      this.drawLines(evt.mouseX, evt.mouseY)
    })

  }

  setOptions(newOptions: OptionType) {
    this.options = optionsUtil.setOptions(this.options, newOptions)
    return this
  }

  drawLines(x: number, y: number) {
    const ctx = this.chart.ctx
    // ctx.save()
    ctx.fillStyle = '#ffffff'

    // 横线
    ctx.fillRect(0, y, this.chart.width, 0.5)

    // 纵线
    ctx.fillRect(x, 0, 0.5, this.chart.height)

    // ctx.restore()

  }

  draw() {
    //this.chart.update()

  }
}
