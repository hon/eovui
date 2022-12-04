import options, { OptionType } from './utils/options'
/**
 * 坐标系统
 * 主要功能是:
 * 1. 数量坐标转化成像素坐标
 * 2. 像素坐标转化成数量坐标。 
 * 注意：像素坐标通常是从界面中直接获得。因此是逻辑像素而非canvas环境里使用的，绘图像素。
 * 很多图表都需要根据数据来映射界面里的像素值，或者根据像素值映射出数据，因此将坐标系统
 * 分离出来。
 */

const dpr = window.devicePixelRatio
export default class Coordinate {
  options: OptionType
  constructor(options: OptionType) {
    const defaultOptions = {
      // 视觉信息
      width: 0,
      height: 0,
      padding: {
        top: 0,
        right: 0,
        bottom: 0,
        left: 0,
      },
      // 数据信息
      data: {
        // 可见区域内的最高价
        high: 0,

        // 可见区域内的最低价
        low: 0,
      },

      // 水平偏移
      offset: {
        // 每项的宽度
        width: 0,
        
        // 每项的间隔
        gap: 0,
      }
    }

    this.setOptions(defaultOptions, options)

  }

  setOptions(target: OptionType, source: OptionType) {
    this.options = options.setOptions(target, source)
    return this
  }

  /**
   * 像素和数据的比, 通过这种映射关系，能确保将价格转换成图表上的像素点。
   */
  heightAndDataRatio() {
    const options = this.options
    const validateHeight = options.height - (options.padding.top + options.padding.bottom)
    const dataDistance = options.data.high - options.data.low
    return validateHeight / dataDistance
  }

  /**
   * （通过数据之间的距离）计算高度
   * @param {number} dataDistance - 两个数据之间的差
   * @return {number} - 计算出来的像素值。注意要进行四舍五入，否则绘制出来的图形会模糊
   */
  calcHeight(dataDistance: number): number {
    return Math.round(this.heightAndDataRatio() * dataDistance)
  }

  
  /**
   * 根据某个（像素）点y的值，计算对应的数值
  calcDataValue(y: number): number {
    const height = y - this.opts.padding.top
    // 数值之间的距离
    //const distance = this.heightDataDistanceRatio() * height
    const distance = this.heightAndDataRatio() * height
    return this.opts.high - distance
  }
   */

  /**
   * 根据某个（像素）点x的位置，计算数值的索引
   */
  calcDataIndex(x: number): number {
    const width = x - this.options.padding.left
    return Math.floor(width / ((this.options.offset.width + this.options.offset.gap) / dpr))
  }

  /**
   * 根据某个（像素）点y的值，计算对应的数值
   */
  calcDataValue(y: number): number {
    // 现在要计算的是逻辑像素距离和价格距离的比值，因此要除以pdr
    let ratio = this.heightAndDataRatio() / dpr

    // 经过公式变形得到，求价格距离的系数为 1 / ratio
    ratio = 1 / ratio

    // 像素距离
    const height = y - this.options.padding.top / dpr

    // 计算价格距离
    const priceDistance = ratio * height

    // 计算价格区间
    // const highestLowestPrice = this.dataSerise.highestLowestPrice()

    // 求得价格距离和最高阶的距离
    return this.options.data.high - priceDistance
  }

  /**
   * 更新数据
   * 坐标值的计算，有时候要依赖外部数据。当外部数据改变的时候，坐标系统需要知道
   * 比如：图表里的上下价格区间，这是计算比例的基础
   * @param {object} data - 配置项里的动态数据
   */
  updateData(data: any): Coordinate {
    this.options.data = data
    return this
  }

}

