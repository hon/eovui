export class OHLCData {
  high: number
  open: number
  close: number
  low: number

  /**
   * 构造DataItem. 这里的顺序没有按照传统的OHLC的顺序，而是按照阴线的价格顺序来排
   */
  constructor(high: number, open: number, close: number, low: number) {
    this.high = high
    this.open = open
    this.close = close
    this.low = low
  }

  // 牛市
  isBull() {
    return this.close > this.open
  }

  // 震荡市
  isShake() {
    return this.close == this.open
  }

  // 熊市
  isBear() {
    return this.close < this.open
  }

  /**
   * 身体的距离(开盘价和收盘价的距离)
   * 本方法和下面几个*Distance方法, 在绘制蜡烛图和其他图形的时候需要用到
   */
  openCloseDistance() {
    return Math.abs(this.open - this.close)
  }

  // 阴线，头部的距离
  highOpenDistance() {
    return Math.abs(this.high - this.open)
  }

  // 阴线，尾部的距离
  closeLowDistance() {
    return Math.abs(this.close - this.low)
  }

  // 阳线，头部的距离
  highCloesDistance() {
    return Math.abs(this.high - this.close)
  }

  // 阳线，尾部的距离
  openLowDistance() {
    return Math.abs(this.open - this.low)
  }

}


/**
 * 股票数据项
 */
export interface IDataItem {
  high: number
  open: number
  close: number
  low: number
}

export default class DataItem implements IDataItem {
  high: number
  open: number
  close: number
  low: number

  /**
   * 构造DataItem. 这里的顺序没有按照传统的OHLC的顺序，而是按照阴线的价格顺序来排
   */
  constructor(high: number, open: number, close: number, low: number) {
    this.high = high
    this.open = open
    this.close = close
    this.low = low
  }

  // 牛市
  isBull() {
    return this.close > this.open
  }

  // 震荡市
  isShake() {
    return this.close == this.open
  }

  // 熊市
  isBear() {
    return this.close < this.open
  }

  /**
   * 身体的距离(开盘价和收盘价的距离)
   * 本方法和下面几个*Distance方法, 在绘制蜡烛图和其他图形的时候需要用到
   */
  openCloseDistance() {
    return Math.abs(this.open - this.close)
  }

  // 阴线，头部的距离
  highOpenDistance() {
    return Math.abs(this.high - this.open)
  }

  // 阴线，尾部的距离
  closeLowDistance() {
    return Math.abs(this.close - this.low)
  }

  // 阳线，头部的距离
  highCloesDistance() {
    return Math.abs(this.high - this.close)
  }

  // 阳线，尾部的距离
  openLowDistance() {
    return Math.abs(this.open - this.low)
  }

  /*
  // 从头到尾的距离
  highLowDistance() {
    return Math.abs(this.high- this.low)
  }
  */
}

