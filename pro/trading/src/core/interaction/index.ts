/**
 * 接受用户操作，然后更新图表
 * 1. 交互事件
 * 2. 操作DataView
 * 3. 更新图表
 */
import Chart from "../chart";
import {optionsUtil, AnyObject} from '@eovui/utils'
import RenderView from './render-view'

export default class Interaction {
  options: AnyObject
  chart: Chart

  // 当进行移动或缩放操作时，将一些数据缓存下来，而不是每次（鼠标移动）都去计算
  // 这个数据很多都是跟图层数据对应的，但有一些不是，因此没有放到图层数据上面
  cacheData: AnyObject


  // 是否启动流畅模式
  // 流畅模式是在用户操作图表时以像素为单位进行移动或缩放
  // 非流畅模式是用户在操作图表是以渲染单位进行图表的移动和缩放操作
  enableSmoothMode: boolean


  renderView: RenderView

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
      enableSmoothMode: true
    }

    this.options = optionsUtil.setOptions(defaultOptions, options)

    const self = this

    this.enableSmoothMode = this.options.enableSmoothMode

    this.renderView = new RenderView({dataView: this.chart.dataView})


    // 初始化cacheData
    this.cacheData = {
      mouseX: 0,
      mouseY: 0,
    }

    this.cachePxOfRu()

    // 拖动
    this.mouseMoveEvent(this._handleDrag.bind(this))

    this.chart.canvas.addEventListener('mousedown', (_evt: MouseEvent) => {
      self._isMouseDown = true
    }, false)
    this.chart.canvas.addEventListener('mouseup', (_evt: MouseEvent) => {
      self._isMouseDown = false
    }, false)

    let times = {
      move: 0,
      zoom: 0,
      // 上一次整次数
      // 整次数的意思是，缩放固定次数为一个周期，当周期满后的次数为整次数。
      // 这里记录上一次整次数的目的是，用来过滤重复的整数。
      // 当滚动次数介于两个整次数直接的时候，此时如果上下滚动会重复出现两次某个整次数
      prevIntZoom: 0,
    }

    this.chart.canvas.addEventListener('wheel', this._handleZoom.bind(this, times), false)

  }

  private _handleDrag(evt: any) {
    // 拖动
    if (this._isMouseDown) {

    }
  }

  private _handleZoom(times: AnyObject, evt: WheelEvent) {
    evt.preventDefault()
    const coord = this.chart.coordinate
    const dataView = this.chart.dataView
    const ruWidthInPx = coord.unitWidthInPx()
    const cacheData = this.cacheData


    const fn = ((zoomDirection: string, times: AnyObject) => {
      const renderView = this.renderView
      const zoomPointDistance = renderView.zoomPoint.distance === undefined ?
        cacheData.midPointsOfRu[cacheData.dataIndex] : renderView.zoomPoint.distance
      renderView.zoomPoint.distance = zoomPointDistance
      const zoomPointDataIndex = renderView.zoomPoint.dataIndex === undefined ?
        cacheData.dataIndex : renderView.zoomPoint.dataIndex
      renderView.zoomPoint.dataIndex = zoomPointDataIndex
      const chart = this.chart
      const viewWidth = dataView.viewWidth
      const unitWidth = chart.width / viewWidth
      let bodyWidth = Math.floor(unitWidth)

      let decimal = unitWidth - bodyWidth

      let gap = decimal


      // 小数部分小于0.7
      if (decimal < 0.7) {
        // 则将gap增加1
        gap = decimal + 1
        // 同时bodyWidth - 1
        bodyWidth -= 1
      }



      // 缩放后cacheData.dataIndex距离左侧的距离
      // 这里仅仅从绘制的图形上计算这个距离，底层的数据（dataView）并没有计算
      //const newX = (cacheData.dataIndex + 1) * unitWidth - (bodyWidth / 2) - gap
      const newX = (zoomPointDataIndex + 1) * unitWidth - (bodyWidth / 2) - gap
      let x = zoomPointDistance - newX


      chart.renderUnit.width = bodyWidth
      chart.renderUnit.gap = gap


      // 更新坐标系统
      this.chart.coordinate.setOptions({
        offset: {
          width: bodyWidth,
          gap,
        },
      })



      // 用户界面里缩放时，每次的缩放步幅
      const zoomStep = 0.25

      // 在dataView里缩放时step的总和
      const stepsPerZoom = 2

      const updateCoord = (() => {
        const run = true
        if (run) {

          // 将range应用到数据
          chart.layers.layerData.setSegmentRange(dataView.indexRange)

          // 计算最高价和最低价范围
          chart.layers.layerData.calcHighLowRange()
          const priceRange = chart.layers.layerData.highLowRange

          chart.coordinate.setOptions({
            highLowRange: {
              high: priceRange[0],
              low: priceRange[1],
            }
          })
          this.cachePxOfRu()
        }

      }).bind(this)



      const headOffsetData = renderView.headOffset(x / unitWidth)
      const tailOffsetData = renderView.tailOffset(x / unitWidth)



      if (zoomDirection === 'zoom-in') {

        if (headOffsetData.isInt) {
          // 设置选中索引
          dataView._trackIndex(-1)

          // 设置indexRange的第一个元素
          dataView.indexRange = [dataView.indexRange[0] + 1, dataView.indexRange[1]]

          // 只有当indexRange被修改后才更新坐标系统
          updateCoord()

        }

        if (tailOffsetData.isInt) {
          let last = dataView.indexRange[1]
          if (tailOffsetData.deltaRuVal < 0) {
            if (last === undefined) {
              last = -1
            } else {
              last -= 1
            }
          }
          dataView.indexRange = [dataView.indexRange[0], last]
          updateCoord()
        }


        dataView.viewWidth = viewWidth - zoomStep

        // 像素级别的缩放和DataView里缩放的step相等（下同）
        if (times.zoom % (stepsPerZoom / zoomStep) === 0
          // 缩放次数不能和上一次的整次数一样
          && times.zoom != times.prevIntZoom) {
          // 先还原到上次的viewWidth
          //dataView.viewWidth += stepsPerZoom
          // 再进行zoomIn
          //dataView.zoomIn()

          times.prevIntZoom = times.zoom
        }
      }


      if (zoomDirection === 'zoom-out') {
        dataView.viewWidth = viewWidth + zoomStep

        if (headOffsetData.isInt) {
          dataView._trackIndex(1)
          //cacheData.dataIndex += 1
          dataView.indexRange = [dataView.indexRange[0] - 1, dataView.indexRange[1]]
          updateCoord()
        }

        if (tailOffsetData.isInt) {
          let last = dataView.indexRange[1]
          if (tailOffsetData.deltaRuVal >= 0) {
            last = undefined
          } else {
            if (last !== undefined && last < -1) {
              last++
            }
          }
          dataView.indexRange = [dataView.indexRange[0], last]
          updateCoord()
        }

        if (times.zoom % (stepsPerZoom / zoomStep) === 0 && times.zoom != times.prevIntZoom) {
          //dataView.viewWidth -= stepsPerZoom
          //dataView.zoomOut()
          times.prevIntZoom = times.zoom
        }
      }


      // 设置renderView.offsetOfPx
      renderView.offsetOfPx.head = renderView.offset.head * unitWidth
      renderView.offsetOfPx.tail = renderView.offset.tail * unitWidth

      //cacheData.dataIndex = dataView.selectedIndex
      // x = headOffsetData.offsetVal * unitWidth
      cacheData.dataIndex = dataView.selectedIndex


      // 以像素为单位移动
      this.chart.draw({
        translate: {
          x: renderView.offsetOfPx.head,
          y: 0,
        }
      })


    }).bind(this)


    // 滚动方向
    // 1:  向上
    // -1: 向下
    // 0:  水平
    const vDirection = Math.sign(evt.deltaY)
    // 1:  向右
    // -1: 向左
    // 0:  垂直
    const hDirection = Math.sign(evt.deltaX)


    //if (vDirection === 1 || vDirection === -1) {
    if (hDirection === 0) { // 只有在水平方向滚动为0时，才进行放大缩小操作
      if (vDirection === 1) {
        if (this.enableSmoothMode) {
          // 记录滚动次数
          times.zoom += vDirection
          fn('zoom-out', times)
        } else {
          this.zoomOut(true)
        }

      } else if (vDirection === -1) {
        if (this.enableSmoothMode) {
          // 记录滚动次数
          times.zoom += vDirection
          fn('zoom-in', times)
        } else {
          this.zoomIn(true)
        }
      }
    }
    //}

    // DEBUG
    if (!this.enableSmoothMode) {
      //console.log(this.chart.dataView.selectedIndex, this.chart.dataView.viewWidth, this.chart.dataView.indexRange)
      // 水平滚动
      if (vDirection === 0) {
        // 流畅模式
        if (this.enableSmoothMode) {
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
        } else {
          if (hDirection === 1 && !dataView.isMoveLeftEnd) {
            this.moveLeft()
          }
          if (hDirection === -1 && !dataView.isMoveRightEnd) {
            this.moveRight()
          }
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
    const offset = this.renderView.offsetOfPx.head
    if (this.cacheData === undefined) {
      this.cacheData = {}
    }

    for (let i = 0; i < viewWidth; i++) {
      const x = coord.calcX(i, offset)
      midPoints.push(x[1])
    }


    this.cacheData.midPointsOfRu = midPoints
    return this
  }


  // 鼠标移动事件
  mouseMoveEvent(cb: Function) {
    const self = this

    this.chart.canvas.addEventListener('mousemove', (evt: MouseEvent) => {
      const offset = this.renderView.offsetOfPx.head
      const mouseX = evt.x - this.chart.canvasPosition.x
      const mouseY = evt.y - this.chart.canvasPosition.y
      const cacheData = self.cacheData
      const dataView = self.chart.dataView
      const coord = this.chart.coordinate


      // 像素坐标(x)转换成数据索引
      const dataIndex = coord.calcDataIndex(mouseX - offset)
      console.log(dataIndex)
      //console.log(coord.calcX(dataIndex))

      // 像素坐标(y)转换成数值
      const pixelValue = self.chart.coordinate.calcDataValue(mouseY)
      //console.log(pixelValue)
      //
      dataView.selectedIndex = dataIndex
      dataView.setPrevIndexPercent(dataIndex)


      cacheData.mouseX = mouseX
      cacheData.mouseY = mouseY
      cacheData.isMouseDown = self._isMouseDown
      cacheData.dataIndex = dataIndex
      cacheData.pixelValue = pixelValue
      cacheData.percent = mouseX / this.chart.width



      cb && cb({
        event: evt,
        cacheData,
      })

      self.chart.draw({
        translate: {
          x: offset,
          y: 0,
        },
        ignoreAlgo: true
      })
    }, false)

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

  /**
   * 这里主要更新坐标系统的相关设置
   */
  updateAfterMove() {
    const chart = this.chart
    const layerData = chart.layers.layerData
    // 坐标系统
    const coord = chart.coordinate

    // 将range应用到数据
    layerData.setSegmentRange(this.chart.dataView.indexRange)


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


    this.cachePxOfRu()
    //console.log(this.chart.dataView.selectedIndex)

    // 更新画面
    chart.draw()
    return this

  }


  reset() {
    const chart = this.chart
    const dataView = chart.dataView
    dataView.reset()

    // 将range应用到数据
    chart.layers.layerData.setSegmentRange(dataView.indexRange)

    // 计算最高价和最低价范围
    chart.layers.layerData.calcHighLowRange()
    const priceRange = chart.layers.layerData.highLowRange

    chart.renderUnit = Object.assign({}, chart.options.renderUnit)

    // 更新坐标系统
    chart.coordinate.setOptions({
      offset: {
        width: chart.renderUnit.width,

        // 每项的间隔
        gap: chart.renderUnit.gap,
      },

      highLowRange: {
        high: priceRange[0],
        low: priceRange[1],
      }
    })


    this.cachePxOfRu()
    //this.updateAfterResize()
    // 更新画面
    chart.draw()
    return this
  }

  /**
   * 放大
   * @param {boolean} needDraw - 是否需要重绘
   */
  zoomIn(needDraw?: boolean) {
    const chart = this.chart
    this.chart.dataView.zoomIn()
    this.updateAfterZoom()
    // 更新画面
    needDraw && chart.draw()
    return this
  }

  /**
   * 缩小
   * @param {boolean} needDraw - 是否需要重绘
   */
  zoomOut(needDraw?: boolean) {
    this.chart.easyEvent.new('zoom-start', {
      detail: {
        direction: 'out'
      }
    })
    const chart = this.chart
    this.chart.dataView.zoomOut()
    this.updateAfterZoom()
    // 更新画面
    needDraw && chart.draw()

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
  updateAfterZoom() {
    const chart = this.chart
    const viewWidth = chart.dataView.viewWidth
    const unitWidth = chart.width / viewWidth
    let bodyWidth = Math.floor(unitWidth)

    let decimal = unitWidth - bodyWidth

    let gap = decimal

    // 小数部分小于0.7
    if (decimal < 0.7) {
      // 则将gap增加1
      gap = decimal + 1
      // 同时bodyWidth - 1
      bodyWidth -= 1
    }


    chart.renderUnit.width = bodyWidth
    chart.renderUnit.gap = gap


    // 将range应用到数据
    chart.layers.layerData.setSegmentRange(chart.dataView.indexRange)


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
