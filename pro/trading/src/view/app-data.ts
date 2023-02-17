// 全局图表设置数据
// 标的图表信息，比如趋势线，压力阻力位等...

// 标的
class Stock {
  // 确保不同的平台symbol不冲突
  stockId: string

  // 标的的唯一标识符
  // 只是在平台中唯一, 不同的平台可能出现同一个symbol
  symbol: string

  // 标的名称
  name: string

  // 平台名称
  platform: string

  // 请求接口(包含参数)
  requestUrl: string

  constructor() {
    this.stockId = this.platform + this.symbol
  }
}
