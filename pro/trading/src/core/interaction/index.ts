/**
 * 接受用户操作，然后更新图表
 * 1. 交互事件
 * 2. 操作ViewOnData
 * 3. 更新图表
 */
import Chart from "../chart";
import { optionsUtil, OptionType } from '@eovui/utils'

export default class Interaction {

  options: OptionType
  chart: Chart

  // Events
  // triggered just after start to zoom in
  // on('zoom-in-start')
  //
  // triggered just after stop zoom in
  // on('zoom-in-end')
  //
  // triggered just after start to zoom out
  // on('zoom-out-start')
  // triggered just after stop zoom out
  // on('zoom-out-end')
  //
  // triggered just after start to move left
  // on('move-left-start')
  // triggered just after stop move left
  // on('move-left-end')
  //
  // triggered just after start to move right
  // on('move-right-start')
  // triggered just after stop move right
  // on('move-right-end')
  //
  // triggered when zoom or move to the maximum or minimum level
  // on('zoom-in-over')
  // on('zoom-out-over')
  // on('move-left-over')
  // on('move-right-over')
  // 鼠标的位置
  mousePosition: {x: number, y: number}
  isMouseDown: boolean

  // 响应式的时候需要重新设置
  centerPoint: {x: number, y: number}

  constructor(options: OptionType) {
    this.chart = options.chart

    const defaultOptions: OptionType = {
      // coordinateOptions: {},
      // viewOnDataOptions: {},
    }

    this.options = optionsUtil.setOptions(defaultOptions, options)

    const chart = this.chart
    const layerData = chart.layers.layerData

    // 最高价和最低价
    // const priceRange = layerData.highestLowestPrice()

    // 坐标系统
    const coord = chart.coordinate


    const self = this

    // 鼠标移动事件
    this.mouseMoveEvent(async (evt: any) => {
      self.mousePosition = {x: evt.mouseX, y: evt.mouseY}
      const priceRange = layerData.highestLowestPrice()
      coord.updateData({
        high: priceRange[0],
        low: priceRange[1],
      })

      // 像素坐标(x)转换成数据索引
      const dataIndex = coord.calcDataIndex(evt.mouseX)

      // 像素坐标(y)转换成价格
      const price = coord.calcDataValue(evt.mouseY)
      //console.log(price)

    })

  }

  mouseMoveEvent(cb: Function) {
    const self = this
    
    this.chart.canvas.addEventListener('mousemove', (evt: any) => {
      const mouseX = evt.x - this.chart.canvasPosition.x
      const mouseY = evt.y - this.chart.canvasPosition.y
      evt.mouseX = mouseX
      evt.mouseY = mouseY
      evt.mouseDown = self.isMouseDown

      cb && cb(evt)

      self.chart.draw({
        ignoreAlgo: true 
      })
    }, false)

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
    this.chart.easyEvent.emit('move-start', {
      detail: {
        direction: 'left'
      }
    })
    const chart = this.options.chart

    // 修改数据视图的range
    const range = this.chart.dataView.moveLeft().indexRange

    // 将range应用到数据
    //chart.dataSerise.setSegmentRange(range)
    chart.layers.layerData.setSegmentRange(this.chart.dataView.indexRange)

    // 更新数据
    // 更新画面
    chart.draw()
    this.chart.easyEvent.emit('move-end', {
      detail: {
        direction: 'left'
      }
    })
    return this
  }

  moveRight() {
    this.chart.easyEvent.emit('move-start', {
      detail: {
        direction: 'right'
      }
    })
    const chart = this.options.chart
    // 修改数据视图的range
    const range = this.chart.dataView.moveRight().indexRange

    // 将range应用到数据
    //chart.dataSerise.setSegmentRange(range)
    chart.layers.layerData.setSegmentRange(this.chart.dataView.indexRange)


    // 更新画面
    chart.draw()
    this.chart.easyEvent.emit('move-end', {
      detail: {
        direction: 'right'
      }
    })
    return this
  }

  zoomIn() {
    const chart = this.chart
    this.chart.dataView.zoomIn()
    this.calcDataViewWidth()
    // 更新画面
    chart.draw()
    return this
  }

  reset() {
    const chart = this.chart
    this.chart.dataView.reset()
    this.calcDataViewWidth()
    // 更新画面
    chart.draw()
    return this
  }

  zoomOut() {
    this.chart.easyEvent.new('zoom-start', {
      detail: {
        direction: 'out'
      }
    })
    const chart = this.chart
    this.chart.dataView.zoomOut()
    this.calcDataViewWidth()
    // 更新画面
    chart.draw()

    this.chart.easyEvent.new('zoom-end', {
      detail: {
        direction: 'out'
      }
    })
    return this
  }

  /**
   * (重新)计算数据视图宽度
   */
  calcDataViewWidth() {
    const chart = this.chart
    const viewWidth = this.chart.dataView.viewWidth
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
    chart.layers.layerData.setSegmentRange(this.chart.dataView.indexRange)

    // update coordinate
    this.chart.coordinate.setOptions({offset: {
      width: bodyWidth,
      gap,
    }})

    return this
  }

  
  // 当交互被禁止的时候进行一些设置
  disabled() {}



}
