import Coordinate from "./Coordinate";
import ViewOnData from "../data/ViewOnData";
import Chart from "../Chart";

import {default as optionsUtil, OptionType} from "../utils/options";
export default class Interaction {

  options: OptionType
  coordinate: Coordinate
  viewOnData: ViewOnData
  #chart: Chart
  // 鼠标的位置
  mousePosition: {x: number, y: number}

  // 响应式的时候需要重新设置
  centerPoint: {x: number, y: number}

  constructor(options: OptionType) {
    this.#chart = options.chart

    const defaultOptions: OptionType = {
      // coordinateOptions: {},
      // viewOnDataOptions: {},
    }

    this.options = optionsUtil.setOptions(defaultOptions, options)

    const chart = this.#chart
    const dataSerise = chart.dataSerise

    // 最高价和最低价
    const priceRange = dataSerise.highestLowestPrice()

    // 坐标系统
    const coord = new Coordinate({
      // 视觉信息
      width: chart.width,
      height: chart.height,
      padding: {
        top: chart.options.paddingTop,
        right: 0,
        bottom: chart.options.paddingBottom,
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
        width: chart.options.renderUnit.width,
        
        // 每项的间隔
        gap: chart.options.renderUnit.gap,
      }
    })

    this.coordinate = coord

    const self = this

    // 鼠标移动事件
    this.#chart.mouseMoveEvent(async (evt: any) => {
      self.mousePosition = {x: evt.mouseX, y: evt.mouseY}
      const priceRange = dataSerise.highestLowestPrice()
      coord.updateData({
        high: priceRange[0],
        low: priceRange[1],
      })
      const dataIndex = coord.calcDataIndex(evt.mouseX)
      //const price = self.calcDataValue(evt.mouseY)
      console.log(dataIndex, dataSerise.segmentData.dataItems[dataIndex])

      const price = coord.calcDataValue(evt.mouseY)
      console.log(price)

    })

    const viewWidth = this.viewWidthByRenderUnit()

    this.viewOnData = new ViewOnData({
      totalDataLength: dataSerise.data.dataItems.length,
      defaultViewWidth: viewWidth,
    })


    dataSerise.setSegmentRange(this.viewOnData.indexRange)
  }

  /**
   * 用渲染单元来计数的试图宽度
   * 渲染单元是每个数据项对应的视觉渲染元素。
   */
  viewWidthByRenderUnit() {
    const chart = this.options.chart
    return Math.floor(chart.width / (chart.options.renderUnit.width + chart.options.renderUnit.gap))
  }

  moveLeft() {
    const chart = this.options.chart

    // 修改数据视图的range
    const range = this.viewOnData.moveLeft().indexRange

    // 将range应用到数据
    chart.dataSerise.setSegmentRange(range)

    // 更新数据
    // 更新画面
    chart.update()
  }

  moveRight() {
    const chart = this.options.chart
    // 修改数据视图的range
    const range = this.viewOnData.moveRight().indexRange

    // 将range应用到数据
    chart.dataSerise.setSegmentRange(range)

    // 更新画面
    chart.update()

  }

  zoomIn() {
    const chart = this.#chart
    this.viewOnData.zoomIn()
    this.calcDataViewWidth()
    // 更新画面
    chart.update()
    return this
  }

  reset() {
    const chart = this.#chart
    this.viewOnData.reset()
    this.calcDataViewWidth()
    // 更新画面
    chart.update()
    return this
  }

  zoomOut() {
    const chart = this.#chart
    this.viewOnData.zoomOut()
    this.calcDataViewWidth()
    // 更新画面
    chart.update()
    return this
  }

  /**
   * (重新)计算数据视图宽度
   */
  calcDataViewWidth() {
    const chart = this.#chart
    const viewWidth = this.viewOnData.viewWidth
    const unitWidth = chart.width / viewWidth
    const floorUnitWidth = Math.floor(unitWidth)
    let bodyWidth = 0
    // 这一步确保bodyWidth在去除多余的部分后，始终为偶数。
    // 确保bodyWidth为偶数的目的是，使得向下影线渲染的时候不模糊
    if(floorUnitWidth % 2 == 0) {
      // 偶数 - 2 还是偶数
      bodyWidth = floorUnitWidth - 2
    } else {
      // 奇数 - 3 还是偶数
      bodyWidth = floorUnitWidth - 3
    }
    const gap = unitWidth - bodyWidth
    chart.options.renderUnit.width = bodyWidth
    chart.options.renderUnit.gap = gap

    // 将range应用到数据
    chart.dataSerise.setSegmentRange(this.viewOnData.indexRange)

    // update coordinate
    this.coordinate.setOptions({offset: {
      width: bodyWidth,
      gap,
    }})

    return this
  }
}
