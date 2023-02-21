/**
 * 接受用户操作，然后更新图表
 * 1. 交互事件
 * 2. 操作ViewOnData
 * 3. 更新图表
 */
import Chart from "../chart";
import { optionsUtil, AnyObject} from '@eovui/utils'

export default class Interaction {
  options: AnyObject
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

  constructor(options: AnyObject) {
    this.chart = options.chart

    const defaultOptions: AnyObject = {
      // coordinateOptions: {},
      // viewOnDataOptions: {},
    }

    this.options = optionsUtil.setOptions(defaultOptions, options)


    const self = this

    // 鼠标移动事件
    this.mouseMoveEvent(async (evt: any) => {
      self.mousePosition = {x: evt.mouseX, y: evt.mouseY}

      // 像素坐标(x)转换成数据索引
      const dataIndex = self.chart.coordinate.calcDataIndex(evt.mouseX)
      //console.log(dataIndex)

      // 像素坐标(y)转换成价格
      const price = self.chart.coordinate.calcDataValue(evt.mouseY)
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
    // 修改数据视图的range
    this.chart.dataView.moveLeft()
    this.updateAfterMove()

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
    // 修改数据视图的range
    this.chart.dataView.moveRight()
    this.updateAfterMove()

    this.chart.easyEvent.emit('move-end', {
      detail: {
        direction: 'right'
      }
    })
    return this
  }

  updateAfterMove() {
    const chart = this.chart
    // 坐标系统
    const coord = chart.coordinate

    // 将range应用到数据
    chart.layers.layerData.setSegmentRange(this.chart.dataView.indexRange)

    // 计算最高价和最低价范围
    chart.layers.layerData.calcHighLowRange()
    const priceRange = chart.layers.layerData.highLowRange
    // 更新坐标系统
    coord.setOptions({
      data: {
        high: priceRange[0],
        low: priceRange[1],
      }
    })

    // 更新画面
    chart.draw()
    return this

  }

  zoomIn() {
    const chart = this.chart
    this.chart.dataView.zoomIn()
    this.updateAfterResize()
    // 更新画面
    chart.draw()
    return this
  }

  reset() {
    const chart = this.chart
    this.chart.dataView.reset()
    this.updateAfterResize()
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
    this.updateAfterResize()
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
  updateAfterResize() {
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


    // 计算最高价和最低价范围
    chart.layers.layerData.calcHighLowRange()
    const priceRange = chart.layers.layerData.highLowRange

    // 更新坐标系统
    this.chart.coordinate.setOptions({
      offset: {
        width: bodyWidth,
        gap,
      },

      data: {
        high: priceRange[0],
        low: priceRange[1],
      }

    })

    return this
  }

  
  // 当交互被禁止的时候进行一些设置
  disabled() {}



}
