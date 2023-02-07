/**
 * 绘制图层, 一个图层一个绘制对象（类似ai）
 * 每个图层有时会绑定一些数据，用于绘图
 */
export class Layer {
  constructor() {}

  // 图层的唯一标识，用于获取图层
  id: string

  // 是否可被管理, 如果不能就不显示在图层管理中
  // 比如背景网格，也是一个图层，但不可以被管理
  isManageAble: boolean = true

  //drawObjects = []

  // 显示给普通用户看的, 图层名称
  name: string = ''

  // 是否可见
  isVisible: boolean = true

  // 是否被锁定, 如果锁定不可被普通用户操作（移动，删除等） 
  isLocked: boolean = false

  // 是否需要被重绘。这是一个关于绘制性能的配置项
  // 比如在Render Loop中，会重复绘制所有的图层。而如果某个图层是静态的，数据或显示一直不变，就可以
  // 将该图层的isRedraw设置为false, 这样每次重绘的时候就不会绘制该图层了
  // isVisible如果为false也不会绘制，但图层不可见了
  // isRedraw: boolean = true


  data: unknown

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

  }

  // 是否为根据数据绘制的图层。
  isDataLayer(): boolean {
    return this.data != undefined
  }


  // 隐藏图层
  hide() {
    this.isVisible = false
    return this
  }
  algo() {}

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

  /**
   * Add one or more layers 
   */
  addLayers(layers: Layer[]) {
    layers.forEach(layer => {
      this.addLayer(layer)
    }, this)
    return this
  }

  clearLayers() {
    this.layers = []
  }

  deleteLayerById(layerIndex: number) {}
  deleteLayerByIndex(layerIndex: number) {}

  /**
   * 通过id获取layer, 这样就可以调用layer的api
   */
  getLayerById(id: string): Layer | undefined {
    if (id.trim() == '') return undefined
    return this.layers.filter(el => el.id == id)[0]
  }

  /**
   * 通过索引获取layer
   */
  getLayerByIndex(index: number): Layer | undefined {
    //return this.layers.filter(el => el.id == id)[0]
    return undefined
  }


  insertLayer() {}

  gotoTop() {}
  gotoBottom() {}

  // 按序绘制图层
  draw() {
    this.layers
      // 过滤掉隐藏图层
      .filter(el => el.isVisible == true)
      // 过滤掉不需要重绘的图层
      // .filter(el => el.isRedraw == true)
      .forEach((layer, idx) => {
        // 如果有数据算法，就先运行
        (typeof layer.algo == 'function') && layer.algo()

        // 绘图
        layer.draw()
      })
  }
}
