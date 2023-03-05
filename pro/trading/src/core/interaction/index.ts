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

  // 当进行移动或缩放操作时，将一些数据缓存下来，而不是每次（鼠标移动）都去计算
  // 这个数据很多都是跟图层数据对应的，但有一些不是，因此没有放到图层数据上面
  cacheData: AnyObject

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
  _isMouseDown: boolean = false

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

    this.cachePxOfRu()

    // 拖动
    this.mouseMoveEvent(this._handleDrag.bind(this))

    this.chart.canvas.addEventListener('mousedown', (evt: MouseEvent) => {
      self._isMouseDown = true
    }, false)
    this.chart.canvas.addEventListener('mouseup', (evt: MouseEvent) => {
      self._isMouseDown = false
    }, false)

    let times = {
      move: 0,
      zoom: 0,
    }
    this.chart.canvas.addEventListener('wheel', this._handleWheel.bind(this, times), false)
    
  }

  private _handleDrag(evt: any) {
    // 拖动
    if (this._isMouseDown) {

    }
  }

  private _handleWheel(times: AnyObject, evt: WheelEvent) {
      evt.preventDefault()
      const coord = this.chart.coordinate
      const dataView = this.chart.dataView
      const ruWidthInPx = coord.unitWidthInPx()


       // 滚动方向
      // 1:  向上
      // -1: 向下
      // 0:  水平
      const vDirection = Math.sign(evt.deltaY)
      // 1:  向右
      // -1: 向左
      const hDirection = Math.sign(evt.deltaX)

      /*
      if (vDirection === 1 || vDirection === -1) {
        if (hDirection === 0) { // 只有在水平方向滚动为0时，才进行放大缩小操作
          if (vDirection === 1) {
            this.zoomOut()
          } else if (vDirection === -1) {
            this.zoomIn()
          }
        }
      }
      */

      // 水平滚动
      if (vDirection === 0) {
        // 每次移动一个像素
        times.move += evt.deltaX
        // 移动的像素如果大于了一个渲染单位的像素宽度，就移动data view, 然后将移动量清零
        if (Math.abs(times.move) >= ruWidthInPx) {
          if (hDirection === 1 && !dataView.isMoveLeftEnd) {
            this.moveLeft()
          }
          if (hDirection === -1 && !dataView.isMoveRightEnd) {
            this.moveRight()
          }
          // 清除移动, 否则translate的值会一直增加
          times.move = 0
        } else {
          const x = -times.move
          // 以像素为单位移动
          if (
            // 在往左移没有结束，而且操作往左
            (!dataView.isMoveLeftEnd && x < 0)
            // 或者，往右没有结束，而且操作往右
            || (!dataView.isMoveRightEnd && x > 0)
            ) {
            // 的时候才能以像素为单位移动
            this.chart.draw({
              translate: {
                x,
                y: 0,
              }
            })
          }
        }
      }
  }


  /**
   * 缓存渲染单元的像素坐标, 这样就不需要鼠标每移动一次就计算一次，从而提高性能
   */
  cachePxOfRu() {
    const coord = this.chart.coordinate
    const viewWidth = coord.calcDataIndex(this.chart.width)
    const midPoints = []
    const ruWidth = coord.unitWidthInPx()
    this.cacheData = {}
    for (let i = 0; i < viewWidth; i++) {
      const x = coord.calcX(i)
      midPoints.push(x[1])
    }


    this.cacheData.midPointsOfRu = midPoints
    return this
  } 

  mouseMoveEvent(cb: Function) {
    const self = this
    
    this.chart.canvas.addEventListener('mousemove', (evt: MouseEvent) => {
      const mouseX = evt.x - this.chart.canvasPosition.x
      const mouseY = evt.y - this.chart.canvasPosition.y
      const cacheData = self.cacheData

      //console.log(self.isMouseDown)


      // 像素坐标(x)转换成数据索引
      const dataIndex = self.chart.coordinate.calcDataIndex(mouseX)

      // 像素坐标(y)转换成数值
      const pixelValue = self.chart.coordinate.calcDataValue(mouseY)
      //console.log(pixelValue)

      cacheData.mouseX = mouseX
      cacheData.mouseY = mouseY
      cacheData.isMouseDown = self._isMouseDown
      cacheData.dataIndex = dataIndex
      cacheData.pixelValue = pixelValue

      cb && cb({
        event: evt,
        cacheData,
      })

      self.chart.draw({
        ignoreAlgo: true 
      })
    }, false)

  }


  /**
   * 水平位移
   */
  hTranslate(distance: number) {

  }

  /**
   * 左移数据视图，然后重新渲染
   */
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
    const layerData = chart.layers.layerData
    // 坐标系统
    const coord = chart.coordinate

    // 将range应用到数据
    layerData.setSegmentRange(this.chart.dataView.indexRange)

    //console.log(layerData.segmentRange)

    // 计算最高价和最低价范围
    layerData.calcHighLowRange()

    const priceRange = layerData.highLowRange
    // 更新坐标系统
    coord.setOptions({
      highLowRange: {
        high: priceRange[0],
        low: priceRange[1],
      }
    })

    /*
    layerData.setCacheDataToSegment([{
      renderUnit: 0
    }, {
      renderUnit: 1
    }])
    */

    this.cachePxOfRu()

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
    let gap = unitWidth - bodyWidth
    /*
    if (gap > 1) {
      //gap -= 1
      //bodyWidth += 1
    }
    console.log(gap)
    */
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

      highLowRange: {
        high: priceRange[0],
        low: priceRange[1],
      }

    })
    this.cachePxOfRu()

    return this
  }

  
  // 当交互被禁止的时候进行一些设置
  disabled() {}



}
