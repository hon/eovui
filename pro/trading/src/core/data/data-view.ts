
import type {AnyObject} from '@eovui/utils'
import {optionsUtil} from '@eovui/utils'

type IndexRange = [number, number | undefined]

//export default class ViewOnData {
/**
 * 缩小data serise的范围，并操作。
 * 对图表的放大，缩小，往前，往后，刷新的操作，本质上是对数据进行的相关操作。
 * 操作完成后，再根据数据进行渲染。
 * 这个类的主要功能就是对DataSerise#data.dataItems进行的放大,缩小,往前,往后,刷新的操作。
 * 操作的结果就是DataSerise#segmentData
 */
export default class DataView {

  /** 默认配置项 */
  options: AnyObject

  /** 
   * ### 数据视图总宽度
   * 为了减少和像素转换时的误差，视图宽度可能是个小数
   * 可以在需要的时候可以用取整
   */
  viewWidth: number

  /** 总数据的长度, 如果数据被追加，得更新这个属性 */
  totalDataLength: number

  /**
   * 相对于整个数据的索引范围
   */
  private _indexRange: IndexRange



  /**
   * 当前选中索引相对于可视范围的百分百
   */
  // private _indexPercent: number


  /**
   * 每次移动多少步数(render unit)
   * @defaultValue 1
   */
  stepsPerMove: number

  /**
   * 每次缩放多少步数(render unit)
   * @defaultValue 1
   */
  stepsPerZoom: number

  /**
   * 缩放位置
   * - left: 在可见视图最左侧
   * - center: 在可见视图中间
   * - right: 在可见视图最右侧
   */
  private _zoomPosition: string


  /**
   * 是否为固定缩放位置。
   * 1. 如果是，根据_zoomPosition的值进行缩放
   * 2. 如果否，根据鼠标（或触点）在视图中的位置进行缩放
   */
  private isFixedPosition: boolean

  /**
   * 选中数据项的索引（相对当前显示数据）
   * @defaultValue 0
   */
  private _selectedIndex: number


  /**
   * `head`是数据的左侧。该属性表示没有数据可以往右侧移动
   * @defaultValue false
   */
  private _isMoveRightEnd: boolean

  /**
   * `tail`是数据的右侧。该属性表示没有数据可以往左侧移动
   * @defaultValue false
   */
  private _isMoveLeftEnd: boolean
  // private _isZoomInEnd: boolean
  // private _isZoomOutEnd: boolean


  /**
   * 视图中至少剩余多少头部数据，如果总的数据长度小于该值，那么该值为数据长度
   * 如果值为0，则表示viewWidth
   * @defaultValue 5
   */
  private _headMinDataLength: number

  /**
   * 视图中至少剩余多少尾部数据，如果总的数据长度小于该值，那么该值为数据长度
   * 如果值为0，则表示viewWidth
   * @defaultValue 5
   */
  private _tailMinDataLength: number

  /**
   * 在计算的过程中有时需要使用操作时上一次的数据，都保持在这里
   */
  private _prevData: AnyObject


  constructor(options: AnyObject) {
    const defaultOptions: AnyObject = {
      // 默认数据总长度
      totalDataLength: 0,

      // default view width
      defaultViewWidth: 0,


      // 头部最少显示多少条数据，如果为0表示viewWidth
      headMinDataLength: 5,

      // 尾部最少显示多少条数据，如果为0表示viewWidth
      tailMinDataLength: 5,


      // 默认显示数据的长度和默认试图长度的比例
      defaultLengthRatio: .8,

      // minimum view width (after the operation of zoom in)
      minViewWidth: 8,

      // how many indexes will be move (when move operation occurs)
      stepsPerMove: 1,

      // how may indexes will be move (after the operation of zoom)
      stepsPerZoom: 1,

      // 定义左，中，右的范围
      // 左侧区域：小于等于视图宽度的45%
      // 中部区域：大于视图宽度的45%且小于视图宽度的65%
      // 右侧区域：大于等于视图宽度的65%
      regionRange: [0.45, 0.65],


      // from which point to zoom
      // 'left' :  means zoom from the left side of the (data) view
      // 'right' : means zoom from the right side of the (data) view
      // 'center': means zoom from the center point of the (data) view
      zoomPosition: 'center',


      // 是否从固定的位置进行缩放
      isFixedPosition: !true,

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
    }

    this.options = optionsUtil.setOptions(defaultOptions, options)
    this.reset()

  }

  setOptions(newOptions: AnyObject) {
    this.options = optionsUtil.setOptions(this.options, newOptions)
    return this
  }

  /**
   * 重置实例状态
   */
  reset() {
    const options = this.options
    const totalDataLength = options.totalDataLength

    this.totalDataLength = totalDataLength
    // Calculate how many data need to be show 
    let len = Math.floor(options.defaultViewWidth * options.defaultLengthRatio)
    len = len > totalDataLength ? totalDataLength : len

    // 索引范围
    this.indexRange = [-len, undefined]
    this.stepsPerMove = options.stepsPerMove
    this.stepsPerZoom = options.stepsPerZoom


    // Set the view width
    this.setViewWidth(options.defaultViewWidth)


    // Set the center of the view as selected data index
    this.selectedIndex = Math.floor(this.viewWidth / 2)

    this._isMoveRightEnd = false
    this._isMoveLeftEnd = false

    this.isFixedPosition = options.isFixedPosition
    this.zoomPosition = options.zoomPosition

    this.headMinDataLength = options.headMinDataLength
    this.tailMinDataLength = options.tailMinDataLength
    this._prevData = {}

    return this
  }


  /**
   * 设置视图中至少剩余多少头部数据
   * @param length - 剩余数据长度
   */
  set headMinDataLength(length: number) {
    if (length > this.options.totalDataLength) {
      length = this.options.totalDataLength
    }
    this._headMinDataLength = length
  }

  /**
   * 获取视图中至少剩余多少头部数据
   */
  get headMinDataLength() {
    return this._headMinDataLength
  }

  set tailMinDataLength(length: number) {
    if (length > this.options.totalDataLength) {
      length = this.options.totalDataLength
    }
    this._tailMinDataLength = length
  }

  get tailMinDataLength() {
    return this._tailMinDataLength
  }

  get isMoveRightEnd() {
    return this._isMoveRightEnd
  }
  get isMoveLeftEnd() {
    return this._isMoveLeftEnd
  }

  get selectedIndex() {
    return this._selectedIndex
  }

  set selectedIndex(idx: number) {
    const position = this._zoomPosition
    if (position === 'left') {
      this._selectedIndex = 0
    } else if (position === 'center') {
      this._selectedIndex = Math.floor(this.rangeDistance() / 2)
    } else if (position === 'right') {
      this._selectedIndex = this.rangeDistance()
    } else {
      const distance = this.rangeDistance()
      const headDistance = this._headToLeftSideDistance()
      // idx 不可以小于零
      if (idx < 0) {
        idx = 0
      }
      // 要考虑尾部在视图内部的情况
      if (headDistance <= 0 && idx <= -headDistance) {
        idx = 0
      }
      if (idx >= distance) {
        idx = distance - 1
      }
      this._selectedIndex = idx
    }
  }

  /**
   * 设置缩放位置, 只有在设置zoomPosition的时候才有效
   * 如果selectedIndex被其他地方修改就没有办法了
   * 因此需要在使用前设置一下
   */
  set zoomPosition(position: string) {
    if (this.isFixedPosition) {
      this._zoomPosition = position
    } else {
      this._zoomPosition = undefined
    }
  }

  get zoomPosition() {
    return this._zoomPosition
  }

  /**
   * 可视区域的总长度, 该值会随着放大缩小一直改变
   */
  setViewWidth(width: number) {
    width = width >= this.options.minViewWidth ? width : this.options.minViewWidth
    this.viewWidth = width
    return this
  }

  /**
   * move the index data to the center 
  moveToCenter(index: number) {
    const viewCenter = Math.floor(this.viewWidth / 2)
  }
   */


  get prevData() {
    return this._prevData
  }

  /**
   * 设置整个indexRange
   */
  set indexRange(range: IndexRange) {
    let first = range[0]
    let last = range[1]

    first = this._setFirst(first)
    last = this._setLast(last)


    this._indexRange = [first, last]
  }
  get indexRange() {
    return this._indexRange
  }

  /**
   * 设置前一个选中索引占视图的比例
   */
  setPrevIndexPercent(idx: number) {
    const viewWidth = this.viewWidth
    this._prevData.indexPercent = (idx + 1) / viewWidth
    return this
  }

  /**
   * Detect the selected data index in which region of the whole data view
   */
  private _dividedRegion() {
    let regionRange = this.options.regionRange

    let region = 'center'
    const percent = this._prevData.indexPercent
    // console.log(percent)

    if (percent <= regionRange[0]) {
      region = 'left'
    }
    if (percent >= regionRange[1]) {
      region = 'right'
    }
    return region
  }


  /**
   * 当数据视图发生移动或缩放操作后，选中数据会改变，该方法用来跟踪选中数据的index值
   * @param step - 移动步幅
   */
  trackIndex(step: number) {
    if (!this.isHeadOutOfView()) {
      this.selectedIndex += 0
    } else {
      this.selectedIndex += step
    }
    console.log(this.selectedIndex)
    return this
  }

  /**
   * Track the selected data index after move
   * @param {number} step - move step
   */
  private _trackIndexAfterMove(step: number) {
    if (!this.isHeadOutOfView()) {
      this.selectedIndex += 0
    } else {
      this.selectedIndex += step
    }
    return this
  }

  /**
   * Track the selected data index after zoom
   * @param {number} step - zoom step
   */
  private _trackIndexAfterZoom(step: number) {
    if (!this._isMoveRightEnd && !this._isMoveLeftEnd) {
      const point = this.options.zoomPoint
      console.log(step)
      if (point == 'center') {
        this.selectedIndex += step
      }

      // if (point == 'left') {
      //   this.selectedIndex += step
      // }

      if (point == 'right') {
        this.selectedIndex += step * 2
      }
    }
    console.log(`selected index after zoom: ${this.selectedIndex}`)
    return this
  }

  /**
   * Calculate the selected data index is in which region.
   * So that we can dynamically change the zoom point to a better zoom experience.
   *
   * @param {number} step - move or zoom number
   * @param {string} type - operation type of move and zoom
  private _setZoomPointByRegion(step: number, type: string) {
    if (this.options.zoomStyle == 'dynamic') {
      let region = 'center'
      if (type == 'moveLeft' || type == 'moveRight') {
        region = this._trackIndexAfterMove(step)
          .setPrevIndexPercent(this.selectedIndex)
          ._dividedRegion()
      }
      if (type == 'zoomIn' || type == 'zoomOut') {
        region = this._trackIndexAfterZoom(step)
          .setPrevIndexPercent(this.selectedIndex)
          ._dividedRegion()
      }

      // change the zoom point according by the region of selected (data) index
      this.options.zoomPoint = region

      if (type == 'zoomOut' || type == 'zoomIn') {
        if (region == 'left') {
          this.options.zoomPoint = 'right'
        }
        if (region == 'right') {
          this.options.zoomPoint = 'left'
        }
      }
    }

    return this
  }
   */

  /**
   * 头部距离视图左侧的距离
   */
  _headToLeftSideDistance() {
    return this.indexRange[0] + this.totalDataLength
  }

  /**
   * 检查头部数据是否超出了视图左侧
   */
  isHeadOutOfView() {
    return this._headToLeftSideDistance() > 0
  }


  /**
   * 尾部距离视图右侧的距离
   */
  _tailToRightSideDistance() {
    // 尾部超出视图, （此时的值应该为正, 正数表示超出)
    if (this.isTailOutOfView()) {
      // 头部超出视图
      if (this.isHeadOutOfView()) {
        return this.totalDataLength - this.viewWidth - this._headToLeftSideDistance()
      } else {
        // 头部在视图内部
        return this.totalDataLength - this.viewWidth
      }

    } else {
      // 尾部在视图内部, （此时的值应该为负数, 负数或零表示在内部）
      if (this.isHeadOutOfView()) {
        return -(this.viewWidth - this.rangeDistance())
      } else {
        return -(this.viewWidth - this.rangeDistance() - Math.abs(this._headToLeftSideDistance()))
      }

    }
  }


  /**
   * 检查尾部数据是否超出了视图右侧
   */
  isTailOutOfView() {
    return this.indexRange[1] !== undefined
  }

  /**
   * 向左移动, 视图是固定的，移动的是数据。
   */
  moveLeft() {
    if (!this.isMoveLeftEnd) {
      const step = this.stepsPerMove
      this.setRange(step, step)
      return this.trackIndex(step)
    }
    return this
  }

  moveRight() {
    if (!this.isMoveRightEnd) {
      const step = this.stepsPerMove
      this.setRange(-step, -step)
      return this.trackIndex(-step)
    }
    return this
  }

  /**
   * 放大数据视图
   */
  zoomIn() {
    // 没有放大到最大才能继续放大
    if (this.viewWidth > this.options.minViewWidth) {
      const step = this.options.stepsPerZoom

      // 左右各变化一个step
      this.setViewWidth(this.viewWidth - step * 2)
      // selectedIndex 为0(在视图左侧)，此时只能移动右侧
      // 或者缩放位置设置为左侧的时候
      if (this._isLeftPostion()) {
        //console.log('left zoomin')
        this.setRange(0, -step * 2)
      } else if (this._isRightPosition()) {
        // selectedIndex 为视图宽度减1(在视图右侧)，此时只能移动左侧
        // 或者缩放位置设置为右侧的时候
        this.setRange(step * 2, 0)
      } else if (this._isCenterPosition()) {
        this.setRange(step, -step)
      } else {
        //console.log('dyn zoomin')
        //console.log(this.viewWidth)
        // 动态缩放
        return this.setRange(step, -step)
        //return this.trackIndex(-step)
      }
      return this.trackIndex(-step)
    }
    return this
  }

  /**
   * 缩小数据视图
   */
  zoomOut() {
    const step = this.options.stepsPerZoom

    // 左右各变化一个step
    this.setViewWidth(this.viewWidth + step * 2)
    if (this._isLeftPostion()) {
      //console.log('left zoomout')
      this.setRange(0, step * 2)
    } else if (this._isRightPosition()) {
      //console.log('right zoomout')
      // selectedIndex 为视图宽度减1(在试图右侧)，此时只能移动左侧
      // 或者缩放位置设置为右侧的时候
      this.setRange(-step * 2, 0)
    } else if (this._isCenterPosition()) {
      //console.log('center zoomout')
      this.setRange(-step, step)
    } else {
      //console.log('dyn zoomout')
      //console.log(this.viewWidth)
      // 动态缩放
      return this.setRange(-step, step)
      //return this.trackIndex(step)
    }
    return this.trackIndex(step)
  }

  private _isLeftPostion() {
    return this._zoomPosition === 'left'
  }

  /**
   * 判断某个索引是否在视图的最右侧
   */
  private _isRightPosition() {
    return this._zoomPosition === 'right'
  }

  private _isCenterPosition() {
    return this._zoomPosition === 'center'
  }


  /**
   * rangeIndex直接的距离
   */
  rangeDistance() {
    const range = this.indexRange
    const first = range[0] >= -this.totalDataLength ? range[0] : -this.totalDataLength
    let result = 0
    if (typeof range[1] == "undefined") {
      result = Math.abs(first)
    } else {
      result = Math.abs(first - range[1])
    }
    return result
  }

  /**
   * 设置indexRange的第一个值
   * @param value - 设置的值
   */
  private _setFirst(value: number) {
    let first = value
    // 移动到最左侧或最右侧，保证至少有多少数据在视图内
    const headMinDataLength = this.headMinDataLength
    const tailMinDataLength = this.tailMinDataLength

    const totalDataLength = this.totalDataLength

    // 当所有的数据都加载完成，此时再继续往右移动的时候，要处理第一个元素的边界问题
    // 当first小于-totalDataLength的时候，表示左侧数据已经到头了
    // 但是，此时如果再继续往右移动还是可以的，只要保留remainLength个有效数据就可以了
    const headRemainDataLength = - totalDataLength - (Math.ceil(this.viewWidth) - headMinDataLength)
    if (first < headRemainDataLength) {
      first = headRemainDataLength
      this._isMoveRightEnd = true
    }
    // 当数据往左移动时至左侧边界时，要保留一定的数据，超出这个保留的数量就什么都不做
    // 否则视图里就没有数据了
    if (first > - tailMinDataLength) {
      first = - tailMinDataLength
      this._isMoveLeftEnd = true
    }
    return first
  }

  /**
   * 设置indexRange的最后一个值
   *
   * @param value - 设置的值
   */
  private _setLast(value: number | undefined): number | undefined {
    let last = value
    // last 如果大于0表示从头开始取，出现大于0的原因是，往左移动时左侧没有超出视图的数据了
    if (value >= 0) {
      last = undefined
    }
    return last
  }


  /**
   * 进行移动和缩放操作后，index range会超出范围，统一在此修复
   * 这里的逻辑比较繁琐，因此需要耐心理解和调试
   * 这里面的移动操作都使用加法运算，在调用setRange方法时，会根据移动的方向传入正负值
   *
   * @param startStep - 开始的步幅, indexRange第一个值的变化值, 往左是正数，往右是负数 (下同)
   * @param endStep   - 结束的步幅, indexRange第二个值的变化值
   */
  setRange(startStep: number, endStep: number) {

    if (startStep != 0 || endStep != 0) {
      // 设置为没有到头
      this._isMoveRightEnd = false
      this._isMoveLeftEnd = false
      const range = this.indexRange
      let first = range[0]
      let last = range[1]

      first = this._setFirst(first + startStep)


      /*
      // 移动到最左侧或最右侧，保证至少有多少数据在视图内
      const headMinDataLength = this.headMinDataLength
      const tailMinDataLength = this.tailMinDataLength
  
      const totalDataLength = this.totalDataLength
      let first = range[0]
      let last = range[1]
  
      first += startStep
      
      // 当所有的数据都加载完成，此时再继续往右移动的时候，要处理第一个元素的边界问题
      // 当first小于-totalDataLength的时候，表示左侧数据已经到头了
      // 但是，此时如果再继续往右移动还是可以的，只要保留remainLength个有效数据就可以了
      const headRemainDataLength = - totalDataLength - (this.viewWidth - headMinDataLength)
      if (first < headRemainDataLength) {
        first = headRemainDataLength
        this._isMoveRightEnd = true
      }
        // 当数据往左移动时至左侧边界时，要保留一定的数据，超出这个保留的数量就什么都不做
        // 否则视图里就没有数据了
      if( first > - tailMinDataLength) {
          first = - tailMinDataLength
          this._isMoveLeftEnd = true
      }
      */

      /** Step 2. 计算indexRange的第二个值 **/
      // 当数据往左移动，数据段里的数据个数，小于数据段的宽度时，处理最后一个元素

      last = this._setLast(first + Math.ceil(this.viewWidth))

      /*
      last = first + this.viewWidth
      // last 如果大于0表示从头开始取，出现大于0的原因是，往左移动时左侧没有超出视图的数据了
      if (last >= 0) {
        last = undefined
      }
      */

      /** Step 3. 修改indexRange **/
      this.indexRange = [first, last]

      //console.log(`selected index: ${this.selectedIndex}, \nview width: ${this.viewWidth},\nindex range: ${this.indexRange}`)

    }
    return this
  }
}
