import { Layer } from './index'
import MainChart from './MainChart'
import {default as optionsUtil, OptionType } from '../utils/options'
/**
 * 移动平均线图表
 */
export default class MaChart extends Layer{
  options: OptionType
  mainChart: MainChart
  chart: any
  ctx: any
  dataSerise: any
  period: number
  algoName: string
  constructor(options: OptionType) {
    super()
    const defaultOptions = {
      lineWidth: 1,
      lineColor: '#ffcc33',
      period: 5, 
    }
    this.options = optionsUtil.setOptions(defaultOptions, options)
    this.mainChart = this.options.mainChart
    this.chart = this.mainChart.chart
    this.ctx = this.chart.ctx
    this.dataSerise = this.mainChart.dataSerise

    this.period = this.options.period
    this.algoName = `ma${this.period}`
  }

  setOptions(newOptions: OptionType) {
    this.options = optionsUtil.setOptions(this.options, newOptions)
    return this
  }

  // 移动平均线算法
  algo() {
    const self = this
    const ds = self.dataSerise
    ds.addAlgo(self.algoName, (d: any) => {
      
      let maData = []
      const n = self.period
      const dataItems = ds.data.dataItems
      const dataLen = dataItems.length

      for (let i = 0; i < dataLen; i++) {
        const copyData = dataItems.slice(dataLen - (n + i), dataLen - i)
        if (copyData.length == n) {
          const average = copyData.reduce((pre: any, cur: any) => pre + cur.close, 0) / n
          maData.unshift(average)
        } else {
          maData.unshift(undefined)
        }
      }

      return maData
    })

  }


  // todo 可以将这里的绘图逻辑放到MainChart的绘图逻辑里。
  draw() {
    const self = this
    const highestLowestPrice = this.dataSerise.highestLowestPrice()

    // body的顶部，距离表上方的距离
    const bodyWidth = self.mainChart.options.candleStick.bodyWidth

    // 每个蜡烛图之间的间距
    let gap = self.mainChart.options.candleStick.gap
    const ctx = self.ctx
    const dpr = window.devicePixelRatio

    const maData = self.dataSerise.segmentData[`ma${self.period}`]

    //ctx.save()
    ctx.beginPath()
    maData.forEach((item: any, idx: any) => {
      if (idx >= self.period - 1) {
        const x = idx * (bodyWidth + gap) / dpr + bodyWidth / 4
        let y = self.chart.options.paddingTop / dpr
        y += self.mainChart.coord.calcHeight((highestLowestPrice[0] - item)) / dpr
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




