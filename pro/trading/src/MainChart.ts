import CandleStick from './CandleStick'
import {Layer} from './Layers'
import Coordinate from './Coordinate'
import { ViewOnData } from './DataSerise'
import Chart from './Chart'
import options, { OptionType } from './utils/options'



/**
 * 主图的意思是依赖基本的价格数据绘制的主要图表。主要有以下几种
 * 1. K线图（裸K图, 蜡烛图）
 * 2. OHLC（美国线）
 * 3. 折线图
 * 4. 其他
 * 除此之外，MainChart还有这些主要功能
 * 1. 价格和像素的（正向和反向）映射的api
 * 2. MainChart对象上有Chart和DataSerise的实例，因此可以通过MainChart使用Chart和DataSerise的相关api
 *
 */
export default class MainChart extends Layer {
  options: OptionType
  chart: Chart
  ctx: CanvasRenderingContext2D
  dataSerise: any
  coord: Coordinate
  dataView: ViewOnData

  constructor(options: OptionType) {
    super()

    const defaultOptions = {
      mainChartType: 'candlestick',
      candleStick: {
        bodyWidth: 16,
        gap: 2,
      },
    }
    this.setOptions(defaultOptions, options)


    this.chart = this.options.chart
    this.ctx = this.chart.ctx

    this.dataSerise = this.options.dataSerise

    const mainChartTypes = ['candlestick', 'ohlc', 'line']

    // 最高价和最低价
    const priceRange = this.dataSerise.highestLowestPrice()

    const self = this
    // 坐标系统
    const coord = new Coordinate({
      // 视觉信息
      width: this.chart.width,
      height: this.chart.height,
      padding: {
        top: this.chart.options.paddingTop,
        right: 0,
        bottom: this.chart.options.paddingBottom,
        left: 0,
      },
      // 数据信息
      data: {
        high: priceRange[0],
        low: priceRange[1],
      },

      // 水平偏移
      offset: {
        // 每项的宽度
        width: this.options.candleStick.bodyWidth,
        
        // 每项的间隔
        gap: this.options.candleStick.gap,
      }
    })
    this.coord = coord

    // 鼠标移动事件
    this.chart.mouseMoveEvent(async (evt: any) => {
      const priceRange = self.dataSerise.highestLowestPrice()
      self.coord.updateData({
        high: priceRange[0],
        low: priceRange[1],
      })
      const dataIndex = self.coord.calcDataIndex(evt.mouseX)
      //const price = self.calcDataValue(evt.mouseY)
      //console.log(dataIndex, this.dataSerise.segmentData.dataItems[dataIndex])

      const price = self.coord.calcDataValue(evt.mouseY)
      //console.log(price)
      //console.log(evt.mouseDown)

    })

    const totalWidth = this.widthByKLine()
    this.dataView = new ViewOnData({

      defaultTotalWidth: totalWidth,

      defaultIndexRange: [- Math.floor(totalWidth * 0.618), 79]
      
    })

    this.dataSerise.setSegmentRange(this.dataView.indexRange)
  }

  setOptions(target: OptionType, source: OptionType) {
    this.options = options.setOptions(target, source)
    return this
  }

  /**
   * 图标视图中k线的数量
   */
  widthByKLine() {
    return Math.floor(this.chart.width / (this.options.candleStick.bodyWidth + this.options.candleStick.gap))
  }

  move(step: number) {
    // 修改数据视图的range
    const range = this.dataView.move(step)

    // 将range应用到数据
    this.dataSerise.setSegmentRange(range)

    // 更新数据
  }
  
  zoom() {

  }

  /**
   * 往图层上绘制图形
   */
  draw() {
    const self = this
    const dpr = window.devicePixelRatio

    // 重新设置可是区域的最高价和最低价
    const highestLowestPrice = this.dataSerise.highestLowestPrice()
    self.coord.updateData({
      high: highestLowestPrice[0],
      low: highestLowestPrice[1],
    })

    let bodyWidth = this.options.candleStick.bodyWidth 
    // 每个蜡烛图之间的间距
    let gap = this.options.candleStick.gap
    const ctx = self.ctx

    this.dataSerise.segmentData.dataItems.forEach((dataItem: any, idx: number) => {

      // 绘制主图
      const drawKline = () => {
        const bodyOffset = idx * (bodyWidth + gap)
        // body的顶部，距离表上方的距离
        let bodyTopHeight = self.chart.options.paddingTop

        // 头部的高度
        let headHeight = 0

        // 尾部的高度
        let tailHeight = 0

        // 实体的高度
        const bodyHeight = this.coord.calcHeight(dataItem.openCloseDistance())

        if (dataItem.isBull()) {
          bodyTopHeight += this.coord.calcHeight((highestLowestPrice[0] - dataItem.close))
          headHeight = this.coord.calcHeight(dataItem.highCloesDistance())
          tailHeight = this.coord.calcHeight(dataItem.openLowDistance())
        } else {
          bodyTopHeight += this.coord.calcHeight((highestLowestPrice[0] - dataItem.open))
          headHeight = this.coord.calcHeight(dataItem.highOpenDistance())
          tailHeight = this.coord.calcHeight(dataItem.closeLowDistance())
        }

        // 头部的Y
        const headY = bodyTopHeight - headHeight

        // 尾部的Y
        const tailY = bodyTopHeight + bodyHeight

        let marketType = 'shake'

        if (dataItem.isBull()) {
          marketType = 'bull'
        }
        if (dataItem.isBear()) {
          marketType = 'bear'
        }

        const candleStick = new CandleStick({
          ctx: self.ctx,
          body: {
            x: bodyOffset,
            y: bodyTopHeight,
            width: bodyWidth,
            height: bodyHeight,
          },
          head: {
            y: headY,
            height: headHeight,
          },
          tail: {
            y: tailY,
            height: tailHeight,
          },
          marketType,
        })
        candleStick.draw()

        // 显示最高价和最低价
        // todo 如果有多个最高价或多个最低价，现实会重叠
        if (dataItem.high == highestLowestPrice[0]) {
          self.text(dataItem.high, bodyOffset / dpr, self.chart.options.paddingTop / dpr)
        }
        if (dataItem.low == highestLowestPrice[1]) {
          self.text(dataItem.low, bodyOffset / dpr, (bodyTopHeight + bodyHeight + tailHeight) / dpr + 4, 'top')
        }
      }

      /*
      const drawLine = () => {
        // todo 绘制折线图
      }
      const drawAmericaLine = () => {
        // todo 绘制美国线
      }
      */

     /*
      switch (name) {
        case 'line': 
          //drawLine()
          break;
        case 'ohlc-line':
          //drawOHLCLine()
          break;
        default: 
          drawKline();
      }
      */
     drawKline()
    })

  }

  text(content: any, x: number, y: number, baseLine: CanvasTextBaseline = 'bottom') {
    const ctx = this.chart.ctx
    ctx.font = "normal normal 12px Verdana"
    ctx.fillStyle = "#ffffff"
    ctx.textBaseline = baseLine
    ctx.fillText(content, x, y)
  }

}

/**
 * 移动平均线图表
 */
export class MaChart extends Layer{
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
    this.setOptions(defaultOptions, options)
    this.mainChart = this.options.mainChart
    this.chart = this.mainChart.chart
    this.ctx = this.chart.ctx
    this.dataSerise = this.mainChart.dataSerise

    this.period = this.options.period
    this.algoName = `ma${this.period}`
  }

  setOptions(target: OptionType, source: OptionType) {
    this.options = options.setOptions(target, source)
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


// 游标
export class Cursor extends Layer {
  options: OptionType
  chart: Chart
  constructor(options: OptionType) {
    super()
    const defaultOptions = {
      cursor: 'crosshair'
      
    }
    this.setOptions(defaultOptions, options)

    this.chart = this.options.chart

    this.chart.canvas.style.cursor = this.options.cursor

    const self = this
    this.chart.mouseMoveEvent((evt: any) => {
      self.chart.update()
      this.drawLines(evt.mouseX, evt.mouseY)
    })

  }

  setOptions(target: OptionType, source: OptionType) {
    this.options = options.setOptions(target, source)
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



