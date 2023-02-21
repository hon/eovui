import CandleStick from '../render/candlestick'
import { Layer } from './index'
import Chart from '../chart'
import { optionsUtil, OptionType } from '@eovui/utils'


/**
 * 主图的意思是依赖基本的价格数据绘制的主要图表。主要有以下几种
 * 1. K线图（裸K图, 蜡烛图）
 * 2. OHLC（美国线）
 * 3. 折线图
 * 4. 其他
 * 除此之外，MainChart还有这些主要功能
 * 1. 价格和像素的（正向和反向）映射的api
 * 2. MainChart对象上有Chart和DataSerise的实例，因此可以通过MainChart使用Chart和DataSerise的相关api
 */
export default class MainChart extends Layer {
  options: OptionType
  chart: Chart

  // 鼠标的位置
  mousePosition: {x: number, y: number}

  // 响应式的时候需要重新设置
  centerPoint: {x: number, y: number}

  constructor(options: OptionType) {
    super()


    const defaultOptions = {
      mainChartType: 'candlestick',
    }

    this.options = optionsUtil.setOptions(defaultOptions, options)
    this.mousePosition = {x: 0, y: 0}

    this.chart = options.chart
    this.id = options.id
    this.name = options.name

    // https://dribbble.com/shots/16257089-SwiftUI-Trading-market-app-charts
    //const mainChartTypes = ['candlestick', 'ohlc', 'line']

  }

  setOptions(newOptions: OptionType) {
    this.options = optionsUtil.setOptions(this.options, newOptions)
    return this
  }

  // 仅将serise放到layer data中, 不做任何处理
  dataAlgo(data: any) {
    return data
  }


  /**
   * 往图层上绘制图形
   */
  draw() {
    const self = this
    const dpr = window.devicePixelRatio
    const coord = this.chart.coordinate
    const ctx = self.chart.ctx
    const layerData = this.chart.layers.layerData

    //console.log(layerData.calcHighLowRange())

    // 重新设置可是区域的最高价和最低价
    //layerData.calcHighLowRange()
    const highestLowestPrice = layerData.highLowRange
    /*
    coord.updateData({
      high: highestLowestPrice[0],
      low: highestLowestPrice[1],
    })
    */
    
    //const highestLowestPrice = layerData.highLowRange

    let bodyWidth = this.chart.options.renderUnit.width 

    // 每个蜡烛图之间的间距
    let gap = this.chart.options.renderUnit.gap

    layerData.data.segment[this.id].forEach((data: any, idx: number) => {
      const dataItem = data.ohlc

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
        const bodyHeight = coord.calcHeight(dataItem.openCloseDistance())


        if (dataItem.isBull()) {
          bodyTopHeight += coord.calcHeight((highestLowestPrice[0] - dataItem.close))
          headHeight = coord.calcHeight(dataItem.highCloesDistance())
          tailHeight = coord.calcHeight(dataItem.openLowDistance())
        } else {
          bodyTopHeight += coord.calcHeight((highestLowestPrice[0] - dataItem.open))
          headHeight = coord.calcHeight(dataItem.highOpenDistance())
          tailHeight = coord.calcHeight(dataItem.closeLowDistance())
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
          ctx,
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

