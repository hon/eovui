import { optionsUtil, OptionType } from '@eovui/utils'

const dpr = window.devicePixelRatio 
/**
 * 蜡烛图, 绘制单个的蜡烛图
 */
export default class CandleStick {
  options: OptionType
  ctx: CanvasRenderingContext2D
  body: any
  head: any
  tail: any
  theme: any
  marketType: any

  /**
   * @param {Object} object -  配置信息
   *
   */
  constructor(options: OptionType) {
    const defaultOptions = {
      theme: {
        bull: {
          // 红
          color: '#cc3333'
        },
        bear: {
          // 绿
          color: '#33cc99'
        },
        // 震荡市场
        shake: {
          color: '#ffffff'
        },
        
        // 跳空市场
        gap: {},
      },
    }

    this.setOptions(defaultOptions, options)
    this.ctx = this.options.ctx
    this.body = this.options.body



    // head 和 tail的width始终为1
    // head 和 tail的x是跟随body的x, 然后偏移的
    // 因此不需要设置head和tail的width和x的值
    this.head = this.options.head
    this.tail = this.options.tail

    this.theme = this.options.theme

    // 震荡市，牛市，熊市
    this.marketType = this.options.marketType
  }

  setOptions(target: OptionType, source: OptionType) {
    this.options = optionsUtil.setOptions(target, source)
    return this
  }


  // 绘制蜡烛图实体
  drawBody() {
    const bodyHeight = this.body.height 
    this.ctx.fillRect(this.body.x, this.body.y, this.body.width, 
      bodyHeight == 0 ? 1 : bodyHeight)
    return this
  }


  // 绘制蜡烛图上影线
  drawHead() {
    const x = this.body.x + this.body.width / 2 - 1 / dpr
    this.ctx.fillRect(x, this.head.y, 1, this.head.height)
    return this
  }

  // 绘制蜡烛图下影线
  drawTail() {
    const x = this.body.x + this.body.width / 2 - 1 / dpr
    this.ctx.fillRect(x, this.tail.y, 1, this.tail.height)
    return this
  }

  /**
   * 绘制蜡烛图
   */
  draw() {
    //this.ctx.save()
    let fillColor = this.theme.shake.color
    if (this.marketType == 'bull') {
      fillColor = this.theme.bull.color
    } 
    if (this.marketType == 'bear') {
      fillColor = this.theme.bear.color
    }
    this.ctx.fillStyle = fillColor
    this.drawHead()
    this.drawBody()
    this.drawTail()
    //this.ctx.restore()
    return this
  }
}
