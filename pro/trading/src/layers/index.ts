/**
 * 绘制图层, 一个图层一个绘制对象（类似ai）
 * 每个图层有时会绑定一些数据，用于绘图
 */
export class Layer {
  constructor() {}

  // 是否可悲管理, 如果不能就不显示在图层管理中
  // 比如背景网格，也是一个图层，但不可以被管理
  isManageAble: boolean = true

  //drawObjects = []

  // 名称
  name: string = ''

  // 是否可见
  isVisible: boolean = true

  // 是否被锁定, 如果锁定不可操作 
  isLocked: boolean = false

  // 是否为根据数据绘制的图层。
  isDataLayer: boolean = true

  /**
   * 添加可绘制对象
   * @param {IDrawable} drawObj - 可绘制对象
  addDrawableObject(obj) {
    this.drawObjects.push(obj)

    // 下一次绘制循环的时候会绘制
  }
   */

  // 显示图层
  show() {
    this.isVisible = true
    return this

    // 下一次绘制循环的时候会绘制
  }

  algo() {}

  // 隐藏图层
  hide() {
    this.isVisible = false
    return this
  }

  /**
   * 往图层上绘制图形
   */
  draw() {
    // to beoverride
  }
  
}
/**
 * 图层管理: 管理绘图的顺序
 */
export default class Layers {
  layers: Layer[]
  constructor() {
    this.layers = []
  }

  /**
   * 添加图层
   * @param {Layer} layer -  图层
   */
  addLayer(layer: Layer) {
    this.layers.push(layer)
    return this
  }

  deleteAllLayers() {
    this.layers = []
  }

  deleteLayer(layerIndex: number) {}


  insertLayer() {}

  gotoTop() {}
  gotoBottom() {}

  // 按序绘制图层
  draw() {
    this.layers
      // 过滤掉隐藏图层
      .filter(el => el.isVisible == true)
      .forEach((layer, idx) => {
        // 如果有数据算法，就先运行
        (typeof layer.algo == 'function') && layer.algo()

        // 绘图
        layer.draw()
      })
  }
}
