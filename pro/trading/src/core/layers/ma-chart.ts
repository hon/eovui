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
      // 基于那个价格进行计算
      basePrice: 'close'
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
    const basePrice = this.options.basePrice


    for (let i = 0; i < dataLen; i++) {
      const copyData = data.slice(dataLen - (n + i), dataLen - i)
      if (copyData.length == n) {
        const average = copyData.reduce((pre: any, cur: any) => {
          return pre + cur.ohlc[basePrice]
        }, 0) / n
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
    const bodyWidth = self.chart.renderUnit.width

    // 每个蜡烛图之间的间距
    let gap = self.chart.renderUnit.gap
    const ctx = self.chart.ctx

    const maData = layerData.data.segment[this.id]
    const coord = self.chart.coordinate

    //ctx.save()
    ctx.beginPath()
    maData.forEach((item: any, idx: any) => {
      const x = (idx - layerData.segmentExpandSize) * (bodyWidth + gap) + bodyWidth / 2

      let y = self.chart.options.paddingTop
      y += coord.calcHeight((highestLowestPrice[0] - item))
      ctx.lineTo(x, y)
      ctx.strokeStyle = self.options.lineColor
      ctx.lineWidth = self.options.lineWidth / coord.dpr
    })
    ctx.stroke()
    ctx.closePath()
    //ctx.restore()
  }
}

