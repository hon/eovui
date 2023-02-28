import Layers from './layers'
import Interaction from './interaction'
import { Evt, optionsUtil, OptionType } from '@eovui/utils'
import Coordinate from "./render/coordinate";
import DataView from "./data/data-view";


/**
 * 主要功能
 * 1. 图层管理的相关api
 * 2. 图表设置的api
 * 3. 事件处理
 * 4. 整体的配置，比如缩放方式, 在chart里进行配置，但是具体的缩放计算由各自的层自己控制
 */
export default class Chart {
  options: OptionType
  // 完整的交易图表会用到多个Chart实例
  id: string
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

  // 标的id, 用于获取标的数据
  stockId: string

  // 
  serise: any 

  coordinate: Coordinate

  dataView: DataView


  // 主图层的id, 用来确定data serise
  mainLayerId: string
  canvasPosition: any
  interaction: Interaction
  easyEvent: Evt

  // 是否可交互 
  // isInteractable: boolean

  /**
   * @param {OptionType} options - 配置选项 
   * ## 配置选项和对象属性
   * 配置项是对象初始化的时候用来配置的，如果用参数分别来传入，会使参数个数变多，可读性和可
   * 操作性差。配置项在传入的时候就不在改变了，如果需要改变，应该将该配置项复制到对象属性上。
   * 属性是对象本身固有的。配置项是外部传入的。
   */
  constructor(options: OptionType) {
    this.serise = options.serise

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

    const self = this

    this.canvas = canvas
    this.ctx = ctx
    this.width = width 
    this.height = height
    this.styleWidth = styleWidth
    this.styleHeight = styleHeight


    this.canvasPosition = this.canvas.getBoundingClientRect()

    this.layers = new Layers(this.serise)


    // 创建自定义事件，所有的事件都绑定到this.canvas元素上
    this.easyEvent = new Evt({
      target: this.canvas
    })

    window.addEventListener('resize', () => {
      self.canvasPosition = self.canvas.getBoundingClientRect()
    })


    this.initDataView()

    console.log(this.layers)


  }


  setOptions(target: OptionType, source: OptionType) {
    this.options = optionsUtil.setOptions(target, source)
    return this
  }


  // 初始化坐标系统
  initCoordinate() {
    const layerData = this.layers.layerData
    layerData.calcHighLowRange()

    // 初始化主图的坐标系统
    // 如果在主图里面添加其他股票数据的图层，得在那个图层里面再实例化Coordinate
    // 然后根据具体的数据计算那个图层需要使用的坐标系统
    const coord = new Coordinate({
      // 视觉信息
      width: this.width,
      height: this.height,
      padding: {
        top: this.options.paddingTop,
        right: 0,
        bottom: this.options.paddingBottom,
        left: 0,
      },

      // 数据信息
      highLowRange: {
        high: layerData.highLowRange[0],
        low: layerData.highLowRange[1],
      },

      // 水平偏移
      offset: {
        // 每项的宽度
        width: this.options.renderUnit.width,
        
        // 每项的间隔
        gap: this.options.renderUnit.gap,
      }
    })

    this.coordinate = coord
    return this

  }


  /**
   * 设置图表是否可交互
   * @param {boolean} flag - 设置flag为true或false来控制是否可交互
   */
  interactable(flag: boolean) {
    if (flag === true) {
      // 初始化Interaction
      this.interaction = new Interaction({
        chart: this,
      })
    } else {
      this.interaction = undefined
    }
    return this
  }

  isInteractable(): boolean {
    console.log(this.interaction)
    return this.interaction !== undefined
  }


  /**
   * 初始化canvas元素
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

  // 初始化数据视图
  initDataView() {
    const viewWidth = Math.floor(this.width / (this.options.renderUnit.width + this.options.renderUnit.gap))
    this.dataView = new DataView({
      totalDataLength: this.layers.layerData.serise.length,
      defaultViewWidth: viewWidth,
    })
    this.layers.layerData.setSegmentRange(this.dataView.indexRange)
    return this
  }

  
  /**
   * Redraw the canvas
   */
  draw(command?: OptionType) {
    const self = this
    this.ctx.clearRect(0, 0, this.width, this.width)
    this.layers.draw(command)
    //console.log(this.layers)
    return this
  }
}
