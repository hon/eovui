import DataItem, { IDataItem } from "./DataItem"
import options, { OptionType } from './utils/options'

type IndexRange = [number, number]

/**
 * 连续数据 
 */
export default class DataSerise{
  data: OptionType
  segmentData: any
  segmentRange: any
  algos: any
  highLowRange: any
  totalHighLowRange: any
  
  constructor(data: OptionType) {
    this.data = data
    this.segmentData = {}
    // 数据段的范围, 图表里显示的数据
    this.segmentRange = [
      // 从什么地方开始
      0, 

      // 显示多少条数据
      this.data.dataItems.length
    ]
    this.algos = {}

    // dataItems里的最高价和最低价范围
    this.highLowRange = []

    // 所有的数据的最高价和最低价范围
    this.totalHighLowRange = []

    // 设置数据段， 初始化的时候，segmentData为整个data的浅拷贝
    this.segment()
  }


  /**
   * 修改segmentRange
   * @param {Array<any>} range - 数据段的范围
   */
  setSegmentRange(range: IndexRange) {
    const itemLength = this.data.dataItems.length
    // 去除不合理的range
    if (Math.abs(range[0]) > itemLength) {
      range[0] = - itemLength
    }
    this.segmentRange = range
    this.segment()
  }

  /**
   * 往原始数据（data）中前置数据, 根据用户的操作会加载更多的数据
   * @param {number} size - 加载多少条数据
   */
  async prependData(size: number) {
    const self = this
    // 从第多条开始加载。这个值跟已加载的数量相等
    const startIdx = this.data.dataItems.length

    // 如果到达某个临界点，表示显示的数据快要到头，需要加载更多数据
    // 否则，即使用户往右滚动，也不加载数据
    const threshold = 20


    if (this.segmentRange[0] <= threshold) {
      const httpData = await fetch(`http://localhost:3001/v1/a-share/kline?symbol=603327&size=${size}&start-index=${startIdx}`)
      const jsonData = await httpData.json()
      if (jsonData.length > 0) {
        const dataItems = jsonData.map((item: IDataItem) => {
          return new DataItem(
              item.high, 
              item.open, 
              item.close, 
              item.low, 
              item.time
          )
        })
        dataItems.reverse().forEach((item: IDataItem) => {
          self.data.dataItems.unshift(item)
        })
      } else {
        console.log('数据全面加载完成。')
      }


    }
    self.update()
    // console.log(self)

    return this
    
  }

  /**
   * 从所有数据中取出(浅拷贝)一部分, 用于显示和缓存
   */
  segment() {
    for (let [k, v] of Object.entries(this.data)) {
      this.segmentData[k] = v.slice(this.segmentRange[0], this.segmentRange[1])
    }
    return this
  }

  /** 
   * 最高价和最低价，这里的最高价和最低价未来可能还会包含其他方面的价格
   * 计算最高价和最低价的目的事为了确定图表中可见部分的价格区间范围。然后根据这两个价格的距离
   * 计算图表中其他价格的具体位置
   */
  highestLowestPrice() {
    // 拷贝data
    let data = this.segmentData.dataItems.slice(0)
    let highestPrice = data.sort((a: IDataItem, b: IDataItem) => b.high - a.high)[0].high
    let lowestPrice = data.sort((a: IDataItem, b: IDataItem) => a.low - b.low)[0].low
    return [highestPrice, lowestPrice]
  }

  /**
   * 增加数据处理算法，比如ma等
   * @param {string} name - 算法的名词，最后也是data下面的key
   * @param {Function} fn - 算法
   */
  addAlgo(name: string, fn: Function) {
    if (fn && typeof fn == 'function') {
      // todo 检查算法是否已存在，如何有就不需要添加
      const hasAlgo = false
      // 添加算法
      !hasAlgo && (this.algos[name] = fn)

      // 运行算法
      this.runAlgo(name)
    }
    this.segment()
    return this
  }

  /**
   * 运行算法
   * @param {string} name - 算法名称
   * @param {boolean} force - 强制运行, 无论有没有数据都运行
   */
  runAlgo(name: string, force: boolean = false) {
    const self = this
    // 检查数据是否已存在, 如果有就不需要计算
    const hasData = (() => {
      return self.data.hasOwnProperty(name)
    })()
    if (force || !hasData) {
      const result = this.algos[name](this)
      this.data[name] = result
    }
    return this
  }


  // 更新所有数据，
  update() {
    // 运行算法
    for (let [k, v] of Object.entries(this.algos)) {
      this.runAlgo(k, true)
    }
    // 
    this.segment()

    return this
  }

}

/**
 * 对图表的放大，缩小，往前，往后，刷新的操作，本质上是对数据进行的相关操作。
 * 操作完成后，再根据数据进行渲染。
 * 这个类的主要功能就是对DataSerise#data.dataItems进行的放大,缩小,往前,往后,刷新的操作。
 * 操作的结果就是DataSerise#segmentData
 */
export class ViewOnData {
  // 数据总长度
  totalDataLength: number
  options: OptionType
  totalWidth: number
  indexRange: IndexRange
  zoomPoint: string
  zoomDirection: string


  constructor(options: OptionType) {
    const defaultOptions = {
      // 总数据的长度
      totalDataLength: 0,

      // 默认视图长度
      defaultViewLength: 0,

      // 默认显示数据的长度和默认试图长度的比例
      defaultLengthRatio: 0.618,
    }

    this.setOptions(defaultOptions, options)

    // 初始化this.#totalDataLength
    this.totalDataLength = this.options.totalDataLength

    this.reset()
  }

  setOptions(target: OptionType, source: OptionType) {
    this.options = options.setOptions(target, source)
    return this
  }
  /*
  setProp(name, value) {
    // 简单设置
    this[`#${name}`] = value

    // todo 复杂设置, 调用各个属性的设置方法
    return this
  }
  */

  /**
   * 可视区域的总长度, 该值会随着放大缩小一直改变
   */
  setTotalWidth(width: number) {
    this.totalWidth = width 
    return this
  }

  // 重置
  reset() {
    // 计算默认显示数据的长度
    let len = Math.floor(this.options.defaultViewLength * this.options.defaultLengthRatio)

    len = len > this.totalDataLength ? this.totalDataLength : len 

    // 索引范围
    this.indexRange = [-len, undefined]

    // 总宽度
    this.totalWidth = this.options.defaultTotalLength
    return this
  }

  /**
   * 移动, 视图是固定的，移动的是数据。
   * @param {number} step - 移动步幅。往左移动为负数，往右移动为正数
   */
  move(step: number) {
    return this.setRange(step, step)
  }

  // 放大
  zoomIn(step: number) {
    return this.setRange(-step, +step)
  }

  // 缩小
  zoomOut(step: number) {
    return this.setRange(+step, -step)
  }

  /**
   * 缩放点：从什么地方开始缩放，
   *    1. cursor, 鼠标的位置
   *    2. center, 图表中心点的位置
   */
  setZoomPoint(point: string = 'cursor') {
    this.zoomPoint = point
    return this
  }

  /**
   * 缩放方向
   *    1. expand, 从中心点往两边扩散
   *    2. left, 往左缩放
   *    3. right, 往右缩放
   */
  setZoomDirection(direction: string = 'expand') {
    const directions = ['expand', 'left', 'right']
    if (directions.indexOf(direction) > -1) {
      this.zoomDirection = direction
    } else {
      console.error('不支持的缩放方向')
    }
    return this
  }

  
  // 操作后，index range会超出范围，统一在此修复
  setRange(startStep: number, endStep: number){
    if (startStep != 0 && endStep != 0) {
      const range = this.indexRange
      let first = range[0]
      let last = range[1]

      // 当所有的数据都加载完成，此时再继续往右移动的时候，要处理第一个元素的边界问题
      if (first < - this.totalDataLength) {
        first = - this.totalDataLength
      } else {
        first += startStep
      }

      // 当数据往左移动，数据段里的数据个数，小于数据段的宽度时，处理最后一个元素
      // 数据已经在倒数第一个了
      if (typeof last === 'undefined') {
        // 还在往右移动
        if (endStep > 0) {
          last = undefined
        } else {
          // 往左移动（没有0的情况）
          last = endStep
        }
      } else {
        last += endStep
      }

      this.indexRange = [first, last]
    }
    return this
  }

}

export class DataLoader {
  constructor() {}
  fetch() {

  }
}
