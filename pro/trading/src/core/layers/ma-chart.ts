import { Layer } from './index'
import Chart from '../chart'
import { optionsUtil, AnyObject} from '@eovui/utils'

/**
 * 移动平均线图表
 */
export default class MaChart extends Layer{
  options: AnyObject 
  chart: Chart
  period: number
  algoName: string
  constructor(options: AnyObject) {
    super()
    const defaultOptions = {
      lineWidth: 1,
      lineColor: '#ffcc33',
      period: 5, 
    }
    this.options = optionsUtil.setOptions(defaultOptions, options)

    this.chart = this.options.chart

    this.period = this.options.period
    this.algoName = `ma${this.period}`
    this.id = this.options.id
    this.name = this.options.name
  }

  setOptions(newOptions: AnyObject) {
    this.options = optionsUtil.setOptions(this.options, newOptions)
    return this
  }


  // 移动平均线算法
  dataAlgo(data: any) {
    let maData = []
    const n = this.period
    const dataLen = data.length

    for (let i = 0; i < dataLen; i++) {
      const copyData = data.slice(dataLen - (n + i), dataLen - i)
      if (copyData.length == n) {
        const average = copyData.reduce((pre: any, cur: any) => pre + cur.close, 0) / n
        maData.unshift(average)
      } else {
        maData.unshift(undefined)
      }
    }
    return maData
  }


  // todo 可以将这里的绘图逻辑放到MainChart的绘图逻辑里。
  draw() {
    const self = this
    const layerData = this.chart.layers.layerData
    const highestLowestPrice = layerData.highLowRange

    // body的顶部，距离表上方的距离
    const bodyWidth = self.chart.options.renderUnit.width

    // 每个蜡烛图之间的间距
    let gap = self.chart.options.renderUnit.gap
    const ctx = self.chart.ctx
    const dpr = window.devicePixelRatio

    const maData = layerData.data.segment[this.id]
    const coord = self.chart.coordinate

    //ctx.save()
    ctx.beginPath()
    maData.forEach((item: any, idx: any) => {
      if (idx >= self.period - 1) {
        const x = idx * (bodyWidth + gap) / dpr + bodyWidth / 4
        let y = self.chart.options.paddingTop / dpr
        y += coord.calcHeight((highestLowestPrice[0] - item)) / dpr
        if (idx == self.period -1) {
          ctx.moveTo(x, y)
        } else {
          ctx.lineTo(x, y)
          ctx.strokeStyle = self.options.lineColor
          ctx.lineWidth = self.options.lineWidth / dpr
        }
      }
    })
    ctx.stroke()
    ctx.closePath()
    //ctx.restore()
  }
}

