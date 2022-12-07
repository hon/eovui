import {default as optionsUtil, OptionType } from '../utils/options'
type IndexRange = [number, number | undefined]


/**
 * 对图表的放大，缩小，往前，往后，刷新的操作，本质上是对数据进行的相关操作。
 * 操作完成后，再根据数据进行渲染。
 * 这个类的主要功能就是对DataSerise#data.dataItems进行的放大,缩小,往前,往后,刷新的操作。
 * 操作的结果就是DataSerise#segmentData
 */
export default class ViewOnData {

  options: OptionType

  // the whole data view width
  viewWidth: number

  // index range of the whole data (stored in somewhere out side, we do not care ins this Class)
  indexRange: IndexRange

  // whether the data is moved outside of the view 
  isOutOfView: boolean

  
  indexPercent: number

  // which index is selected relative to the current showing data
  selectedIndex: number

  // there is no data to move right
  isLeftEnd: boolean

  // there is no data to move left (expect remain minDataLength)
  isRightEnd: boolean


  constructor(options: OptionType) {
    const defaultOptions: OptionType = {
      // default total data length
      totalDataLength: 0,

      // default view width
      defaultViewWidth: 0,

      // least data size remain in the view, but if the total data length is smaller than this 
      // value, then this value will be total data length
      minDataLength: 5,


      // 默认显示数据的长度和默认试图长度的比例
      defaultLengthRatio: 0.8,

      // minimum view width (after the operation of zoom in)
      minViewWidth: 11,

      // how many indexes will be move (when move operation occurs)
      moveStep: 1,

      // how may indexes will be move (after the operation of zoom)
      zoomStep: 3,

      // Define region rangees
      // left region width: less than and equal to first element(45%) 
      // center region width: greater than first element(45%) and less than last element(65%)
      // right region width: greater than and equal to first element(65%)
      regionRange: [0.45, 0.65],

      // from which point to zoom
      // 'left' :  means zoom from the left side of the (data) view
      // 'right' : means zoom from the right side of the (data) view
      // 'center': means zoom from the center point of the (data) view
      zoomPoint: 'center',


      // Style of the zoom operation on data view
      // fixied:  default value, the zoom point will always be left, right or center
      // dynamic: the zoom point will be left, right or center occording to region calculation 
      zoomStyle: 'dynamic',

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

    
    //this.updateIndexPercent(66)
    //console.log(this._dividedRegion())
  }

  setOptions(newOptions: OptionType) {
    // there are some options can not be set in the setOptions method.
    // they need to be set individually in some methods.
    const protectedOptions = []
    this.options = optionsUtil.setOptions(this.options, newOptions)
    return this
  }

  /**
   * Some stuffs need to be reset to the initial status
   */
  reset() {
    const totalDataLength = this.options.totalDataLength
    const minDataLength = this.options.minDataLength

    this.isLeftEnd = false
    this.isLeftEnd = false

    // Calculate how many data need to be show 
    let len = Math.floor(this.options.defaultViewWidth * this.options.defaultLengthRatio)
    len = len > totalDataLength ? totalDataLength : len 
    // 索引范围
    this.indexRange = [-len, undefined]

    this.options.minDataLength = minDataLength > totalDataLength ? totalDataLength : minDataLength

    this.checkOutOfView()

    // Set the view width
    this.setViewWidth(this.options.defaultViewWidth)

    // Set the center of the view as selected data index
    this.selectedIndex = Math.floor(this.viewWidth / 2)

    return this
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
   */
  moveToCenter(index: number) {
    const viewCenter = Math.floor(this.viewWidth / 2)
  }

  /**
   * The selected data index occupy how many percentage of the data view width
   */
  private _indexPercent() {
    const viewWidth = this.viewWidth
    const index = this.selectedIndex
    this.indexPercent = (index + 1) / this.viewWidth
    return this
  } 

  /**
   * Detect the selected data index in which region of the hole data view
   */
  private _dividedRegion() {
    let regionRange = this.options.regionRange

    let region = 'center'
    const percent = this.indexPercent
    // console.log(percent)

    if (percent <= regionRange[0]){
      region = 'left'
    }
    if (percent >= regionRange[1]){
      region = 'right'
    }
    return region
  }

  /**
   * Track the selected data index after move
   * @param {number} step - zoom step
   */
  private _trackIndexAfterMove(step: number) {
    if (!this.isLeftEnd && !this.isRightEnd) {
      this.selectedIndex += step
    }
    console.log(this.selectedIndex)
    return this
  }

  /**
   * Track the selected data index after zoom
   * @param {number} step - zoom step
   */
  private _trackIndexAfterZoom(step: number) {
    if (!this.isLeftEnd && !this.isRightEnd) {
      const point = this.options.zoomPoint
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
    console.log(this.selectedIndex)
    return this
  }

  /**
   * Calculate the selected data index is in which region.
   * So that we can dynamically change the zoom point to a better zoom experience.
   *
   * @param {number} step - move or zoom number
   * @param {string} type - operation type of move and zoom
   */
  private _setZoomPointByRegion(step: number, type: string) {
    if (this.options.zoomStyle == 'dynamic') {
      let region = 'center'
      if (type == 'moveLeft' || type == 'moveRight') {
        region = this._trackIndexAfterMove(step)
          ._indexPercent()
          ._dividedRegion()
        //console.log(region)
      }
      if (type == 'zoomIn' || type == 'zoomOut') {
        region = this._trackIndexAfterZoom(step)
          ._indexPercent()
          ._dividedRegion()
      }

      // change the zoom point according by the region of selected (data) index
      this.options.zoomPoint = region

      if (type == 'zoomOut') {
        if (region == 'left') {
          this.options.zoomPoint = 'right'
        }
        if (region == 'right') {
          this.options.zoomPoint = 'left'
        }
        
      }
    }

    /*
    console.log(`region: ${region}`)
    console.log(`zoom point: ${this.options.zoomPoint}`)
    */
    return this
  }




  /**
   * Check whether the data is out if right side of the view
   */
  checkOutOfView() {
    if (this.rangeDistance() > this.viewWidth) {
      this.isOutOfView = true
    } else {
      this.isOutOfView = false
    }
    return this
  }

  /**
   * 向左移动, 视图是固定的，移动的是数据。
   */
  moveLeft() {
    const step = this.options.moveStep
    this._setZoomPointByRegion(-step, 'moveLeft')
    return this.setRange(step, step)
  }

  moveRight() {
    const step = this.options.moveStep
    this._setZoomPointByRegion(step, 'moveRight')
    return this.setRange(-step, -step)
  }

  /**
   * Zoom out of the data view
   */
  zoomIn() {
    if(this.viewWidth > this.options.minViewWidth) {
      const step = this.options.zoomStep
      const point = this.options.zoomPoint

      // 左右各变化一个step
      this.setViewWidth(this.viewWidth - step * 2)

      this.setRange(+step, -step)
      if (point == 'right') {
        //this.setRange(+step, -step)
        // move to right
        this.setRange(step, step)
      } else if(point == 'left') {
        //this.setRange(+step, -step)
        // move to left
        this.setRange(-step, -step)
      } else {
        // center
        //this.setRange(+step, -step)
      }

      this._setZoomPointByRegion(-step, 'zoomIn')
    }
    return this
  }

  /**
   * Zoom out of the data view
   */
  zoomOut() {
    const step = this.options.zoomStep
    const point = this.options.zoomPoint

    // 左右各变化一个step
    this.setViewWidth(this.viewWidth + step * 2)

    this.setRange(-step, +step)
    if (point == 'right') {
      //this.setRange(-step, +step)
      // move to left
      this.setRange(-step, -step)
    } else if (point == 'left'){
      //this.setRange(-step, +step)
      // move to right
      this.setRange(+step, +step)
    } else {
      // center
      //this.setRange(-step, +step)
    }

    this._setZoomPointByRegion(step, 'zoomOut')
    return this
  }


  /**
   * Distance of the rangeIndex values
   */
  rangeDistance() {
    const range = this.indexRange
    if (typeof range[1] == "undefined") {
      return Math.abs(range[0])
    } else {
      return Math.abs(range[0] - range[1])
    }
  }

  
  /**
   * 进行移动和缩放操作后，index range会超出范围，统一在此修复
   * 这里的逻辑比较繁琐，因此需要耐心理解和调试
   * 这里面的移动操作都使用加法运算，在调用setRange方法时，会根据移动的方向传入正负值
   *
   * @param {number} startStep - 开始的步幅, indexRange第一个值的变化值
   * @param {number} endStep   - 结束的步幅, indexRange第二个值的变化值
   */
  setRange(startStep: number, endStep: number){
    if (startStep != 0 && endStep != 0) {
      this.isLeftEnd = false
      this.isRightEnd = false
      const range = this.indexRange

      // 往做成移动时，保证至少有多少数据在视图内
      const remainLength = this.options.minDataLength
      const totalDataLength = this.options.totalDataLength
      let first = range[0]
      let last = range[1]

      /** Step 1. 计算indexRange的第一个值 **/
      // 当所有的数据都加载完成，此时再继续往右移动的时候，要处理第一个元素的边界问题
      first += startStep
      if (first < - totalDataLength) {
        first = - totalDataLength
        this.isLeftEnd = true
      }
        // 当数据移动时，要保留一定的数据，超出这个保留的数量就什么都不做
        // 否则视图里就没有数据了
      if( first > -remainLength) {
          this.isRightEnd = true
          return this
      }

      /** Step 2. 计算indexRange的第二个值 **/
      // 当数据往左移动，数据段里的数据个数，小于数据段的宽度时，处理最后一个元素
      // 数据已经在倒数第一个了
      /** Step 2.1 第二项数据为undefined的情况 **/
      if (typeof last === 'undefined' && !this.isOutOfView) {

        //last = undefined

      } else {
        /** Step 2.2 第二项数据为number的情况 **/
        // 当往右移动的时候，只要左侧没有到头就修改indexRagne的最后一个值
        // 换句话说，当往右移动数据到头了，就什么都不做
        if (first >= - totalDataLength) {
          // 多显示一条数据，表示此时尾部的数据是超出视图的。
          last = first + this.viewWidth + 1
        
          // last 如果大于0表示从头开始取，出现大于0的原因是，往右移动时超出了右边的极限
          if (last >= 0) {
            last = undefined
          }
        }
      }

      /** Step 3. 修改indexRange **/
      this.indexRange = [first, last]

      this.checkOutOfView()
      
      /*
      console.log(this.indexRange)
      console.log(this.rangeDistance(), this.viewWidth)
      console.log(this.isOutOfView)
      */
    }
    return this
  }
}

