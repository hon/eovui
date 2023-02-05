import Layers, {Layer} from './layers'
import Interaction from './render/interaction'
import DataSerise from './data/data-serise'
import { Evt, optionsUtil, OptionType } from '@eovui/utils'


/**
 * 主图,
 * 主要功能
 * 1. 图层管理的相关api
 * 2. 图表设置的api
 * 3. 事件处理
 * 4. 整体的配置，比如缩放方式, 在chart里进行配置，但是具体的缩放计算由各自的层自己控制
 * Chart里为什么没有数据？
 * 因为数据是由具体的图层决定的
 */
export default class Chart {
  options: OptionType
  canvas: HTMLCanvasElement
  ctx: CanvasRenderingContext2D

  // Width of canvas draw enviroment
  width: number

  // Height of canvas draw enviroment
  height: number

  // Width of canvas on screen
  styleWidth: number

  // Height of canvas on screen
  styleHeight: number
  layers: Layers
  canvasPosition: any
  mouseDown: boolean
  interaction: Interaction
  dataSerise: DataSerise
  easyEvent: Evt

  /**
   * @param {OptionType} options - 配置选项 
   * ## 配置选项和对象属性
   * 配置项是对象初始化的时候用来配置的，如果用参数分别来传入，会使参数个数变多，可读性和可
   * 操作性差。配置项在传入的时候就不在改变了，如果需要改变，应该将该配置项复制到对象属性上。
   * 属性是对象本身固有的。配置项是外部传入的。
   */
  constructor(options: OptionType) {
    this.dataSerise = options.dataSerise

    // 默认数据项，当对象初始化时，传入的数据项如果没有设置相关的项，会使用默认配置项。
    const defaultOptions: OptionType = {
     // canvas元素选择器
      selector: '',

      // 图表上方的padding
      paddingTop: 100,
      // 图表下方的padding
      paddingBottom: 100,

      // 渲染单元信息, 主图里面（是蜡烛图)
      renderUnit: {
        width: 16,
        gap: 2,
      },
    }

    this.options = optionsUtil.setOptions(defaultOptions, options)

    
    const {
      canvas, ctx, width, height, styleWidth,
      styleHeight
    } = this.initCanvas(document.querySelector(this.options.selector))


    this.canvas = canvas
    this.ctx = ctx
    this.width = width 
    this.height = height
    this.styleWidth = styleWidth
    this.styleHeight = styleHeight
    this.layers = new Layers()

    //this.mouseMoveEvent()
    this.canvasPosition = this.canvas.getBoundingClientRect()
    this.mouseDown = false

    // 创建自定义事件，所有的事件都绑定到this.canvas元素上
    this.easyEvent = new Evt({
      target: this.canvas
    })

    const self = this
    window.addEventListener('resize', () => {
      self.canvasPosition = self.canvas.getBoundingClientRect()
    })

    this.canvas.addEventListener('mousedown', (evt: any) => {
      self.mouseDown = true
    })

    this.canvas.addEventListener('mouseup', (evt: any) => {
      self.mouseDown = false
    })

    // 初始化Interaction
    this.interaction = new Interaction({
      chart: this,
    })

  }

  setOptions(target: OptionType, source: OptionType) {
    this.options = optionsUtil.setOptions(target, source)
    return this
  }

  mouseMoveEvent(cb: Function) {
    const self = this
    
    this.canvas.addEventListener('mousemove', (evt: any) => {
      const mouseX = evt.x - this.canvasPosition.x
      const mouseY = evt.y - this.canvasPosition.y
      evt.mouseX = mouseX
      evt.mouseY = mouseY
      evt.mouseDown = self.mouseDown

      cb && cb(evt)
    }, false)
  }


  /**
   * 初始化canvas
   * @param {HTMLCanvasElement} canvas - canvas 元素
   * @return {Object}
   */
  initCanvas(canvas: HTMLCanvasElement): any {
    const ctx = canvas.getContext('2d')
    let width = canvas.width
    let height = canvas.height

    const styleWidth = width
    const styleHeight = height 

    // 解决模糊的问题, 参考：https://www.codingsky.com/doc/2022/4/4/925.html
    const dpr = window.devicePixelRatio;
    width = width * dpr
    height = height * dpr
    canvas.width = width
    canvas.height = height
    canvas.style.width = styleWidth + 'px';
    canvas.style.height = styleHeight + 'px';
    ctx.scale(dpr, dpr);
    return {canvas, ctx, width, height, styleWidth, styleHeight}
  }
  
  /**
   * Update the canvas
   */
  update() {
    this.ctx.clearRect(0, 0, this.width, this.width)
    this.layers.draw()
    return this
  }
}
