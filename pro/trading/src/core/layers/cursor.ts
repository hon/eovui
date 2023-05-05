import {Layer} from './index'
import Chart from '../chart'
import {AnyObject, optionsUtil, OptionType} from '@eovui/utils'


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
      /*
      const interaction = this.chart.interaction

      const self = this
      interaction.mouseMoveEvent((evt: any) => {
        const offset = interaction.renderView.offset.head
        console.log(offset)
        const index = evt.cacheData.dataIndex
        self.mouseX = evt.cacheData.midPointsOfRu[index] + offset
        self.mouseY = evt.cacheData.mouseY
      })
      */
    }
  }

  setOptions(newOptions: OptionType) {
    this.options = optionsUtil.setOptions(this.options, newOptions)
    return this
  }

  draw(command?: AnyObject) {
    const ctx = this.chart.ctx
    const interaction = this.chart.interaction
    const offset = interaction.renderView.offsetOfPx.head
    const index = interaction.cacheData.dataIndex
    let mouseX = interaction.cacheData.midPointsOfRu[index]
    // 让垂直线始终可见
    if (offset + mouseX < 0) {
      mouseX = -offset
    }
    const mouseY = interaction.cacheData.mouseY

    ctx.save()
    //ctx.translate(0, 0)
    ctx.strokeStyle = 'white'
    ctx.setLineDash([5, 5]);

    // 横线
    ctx.beginPath();
    ctx.moveTo(-500, mouseY);
    ctx.lineTo(this.chart.width + 500, mouseY);
    ctx.stroke();

    // 纵线
    ctx.beginPath();
    ctx.moveTo(mouseX, 0);
    ctx.lineTo(mouseX, this.chart.height);
    ctx.stroke();

    ctx.restore()
  }

}
