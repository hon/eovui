import { Layer } from './index'
import Chart from '../chart'
import { optionsUtil, OptionType } from '@eovui/utils'

// 游标
export default class Cursor extends Layer {
  options: OptionType
  chart: Chart
  mouseX: number
  mouseY: number
  constructor(options: OptionType) {
    super()
    const defaultOptions = {
      cursor: 'crosshair'
    }
    this.options = optionsUtil.setOptions(defaultOptions, options)
    this.chart = this.options.chart

    if (this.chart.isInteractable()) {

      this.id = this.options.id
      this.name = this.options.name

      this.chart.canvas.style.cursor = this.options.cursor

      const self = this
      this.chart.interaction.mouseMoveEvent((evt: any) => {
        self.mouseX = evt.mouseX
        self.mouseY = evt.mouseY
      })
    }
  }

  setOptions(newOptions: OptionType) {
    this.options = optionsUtil.setOptions(this.options, newOptions)
    return this
  }

  draw() {
    const ctx = this.chart.ctx
    // ctx.save()
    ctx.fillStyle = '#ffffff'

    // 横线
    ctx.fillRect(0, this.mouseY, this.chart.width, 0.5)

    // 纵线
    ctx.fillRect(this.mouseX, 0, 0.5, this.chart.height)

    // ctx.restore()

  }

}
