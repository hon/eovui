// 处理图层数据
import DataItem, { IDataItem } from "./data-item"
type IndexRange = [number, number | undefined]
export class LayerData {
  // 存放各图层的数据
  data: {
    [key: string]: any
  }


  // 存放各图层的算法函数
  algos: any

  serise: any

  // 主图层id
  mainLayerId: string

  // 数据段区间
  segmentRange: any

  // 所有图层的最高最低价区间，坐标系统以此来确定数量和像素的比例
  highLowRange: [number, number]

  // 主图层的最高最低价区间, 用来标记图表上的最高价和最低价
  mainHighLowRange: [number, number]


  constructor(serise: any) {
    this.data = {
      algo: {},
      segment: {},
    }

    this.serise = serise

    // 数据段的范围, 图表里显示的数据
    this.segmentRange = [
      // 从什么地方开始
      0, 

      // 显示多少条数据
      100
    ]
    this.algos = {}

    // dataItems里的最高价和最低价范围
    this.highLowRange = [0, 0]

    // 设置数据段， 初始化的时候，segmentData为整个data的浅拷贝
    this.segment()
  }


  // 获取主图层的数据
  getMainLayerData(key: string = 'algo'): Array<any> | undefined {
    if (this.mainLayerId != '') {
      return this.data[key][this.mainLayerId]
    }
    return undefined
  }

  // 往主图层的segment设置缓存数据
  setCacheDataToSegment(data: Array<any>) {
    const mainSegmentData = this.getMainLayerData('segment')
    if (mainSegmentData !== undefined) {
      mainSegmentData.forEach((item, idx) => {
        if (item.cache === undefined) {
          item.cache = {}
        }
        item.cache = data[idx]
      })
    }
    return this
  }

  /**
   * 修改segmentRange
   * @param {Array<any>} range - 数据段的范围
   */
  setSegmentRange(range: IndexRange) {
    this.segmentRange = range
    this.segment()
    return this
  }

  /**
   * 从所有数据中取出(浅拷贝)一部分, 用于显示和缓存
   */
  segment() {
    for (let [k, v] of Object.entries(this.data.algo)) {
      if (Array.isArray(v)) {
        this.data.segment[k] = v.slice(this.segmentRange[0], this.segmentRange[1])
      } else {
        this.data.segment[k] = v
      }
    }
    return this
  }


  /** 
   * 最高价和最低价，这里的最高价和最低价未来可能还会包含其他方面的价格
   * 计算最高价和最低价的目的事为了确定图表中可见部分的价格区间范围。然后根据这两个价格的距离
   * 计算图表中其他价格的具体位置
   */
  calcHighLowRange() {
    if (this.getMainLayerData('segment')) {
      // 比较主图层数据
      // 拷贝data
      let data = this.getMainLayerData('segment').slice(0)
      //let highestPrice = data.sort((a: IDataItem, b: IDataItem) => b.high - a.high)[0].high
      let highestPrice = data.sort((a: any, b: any) => b.ohlc.high - a.ohlc.high)[0].ohlc.high
      //let lowestPrice = data.sort((a: IDataItem, b: IDataItem) => a.low - b.low)[0].low
      let lowestPrice = data.sort((a: any, b: any) => a.ohlc.low - b.ohlc.low)[0].ohlc.low
      // 主图层的价格区间
      const mainRange: [number, number] = [highestPrice, lowestPrice]


      // 设置主图层价格区间
      this.mainHighLowRange = mainRange

      const low = []
      const high = []
      // 比较其他图层数据
      for (let [k, v] of Object.entries(this.data.segment)) {
        if (k !== 'main' && Array.isArray(v)) {
          const data = v.slice(0).filter(d => d !== undefined)
          low.push(Math.min(...data))
          high.push(Math.max(...data))
        }
      }

      low.push(lowestPrice)
      high.push(highestPrice)

      this.highLowRange = [Math.max(...high), Math.min(...low)]

    } else {
      this.mainHighLowRange = [0, 0] 
      this.highLowRange = [0, 0]
    }
    return this


  }

  /**
   * 有的图层需要绑定数据，将数据放到这里，通过id和响应的图层对应
   */
  add(id: string, data: any) {
    this.data[id] = data
  }

  getData(id: string) {}

  /**
   * 图层被修改后，需要更新数据
   */
  update(id: string) {}

  /**
   * 图层删除后，需要删除响应的数据
   */
  delete(id: string) {
    delete this.data.algo[id]
    delete this.data.segment[id]
    return this
  }

  /**
   * 合并数据，从而减少Data Loop
   */
  //merge(ids: Array<string>) {}


  /**
   * 增加数据处理算法，比如ma等
  // 1. 主图层的数据：不同交易平台数据源的返回值结构是不同的, 用来将source data转换成data serise
  // 2. 每个TA数据的：不同的TA算法是不一样的
  // 3. 其他数据
   * @param {string} id - 图层id，最后也是data下面的key
   * @param {Function} fn - 算法
   */
  addAlgo(id: string, fn: Function) {
    if (fn && typeof fn == 'function') {
      // todo 检查算法是否已存在，如何有就不需要添加
      const hasAlgo = false
      // 添加算法
      !hasAlgo && (this.algos[id] = fn)

      // 运行算法
      this.runAlgo(id)
    }
    this.segment()
    return this
  }

  /**
   * 运行算法
   * @param {string} id - 图层id
   * @param {boolean} force - 强制运行, 无论有没有数据都运行
   */
  runAlgo(id: string, force: boolean = false) {
    const self = this
    // 检查数据是否已存在, 如果有就不需要计算
    const hasData = (() => {
      return self.data.hasOwnProperty(id)
    })()
    if (force || !hasData) {
      const result = this.algos[id]()
      this.data.algo[id] = result
    }
    return this
  }
}
