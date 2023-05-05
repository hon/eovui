/**
 * 在开启soomthMode之后，要对像素进行精确操作，然后将操作的数据和DataView同步。
 * 将所有的操作逻辑在这里统一起来。
 * 文件名的由来：因为操作数据的类叫做DataView，因此这里的类叫做RenderView, 表示对渲染后的界面进行
 * 操作。
 * 这个class的作用是在界面层面上图图表进行像素级别的移动缩放等, 然后将数据和DataView同步。
 * DataView上是无法进行像素级别的操作的，最小的操作单位是RenderUnit
 * RenderView操作后和DataView数据同步的方式是setRange方法，而不能使用move或zoom相关的方法，正因如此
 * 在setRange之后要用trackIndex方法来移动selectedIndex
 */

import {AnyObject} from "@eovui/utils";
import ViewOnData from "../data/data-view";

type ZoomPoint = {
  /**
   * 缩放点距离左侧的距离
   */
  distance: number | undefined,

  /**
   * 缩放点的索引值
   */
  dataIndex: number | undefined
}

type Offset = {
  /**
   * 头部的偏移值
   */
  head: number,

  /**
   * 尾部的偏移值
   */
  tail: number,
}


export default class RenderView {
  dataView: ViewOnData


  // 缩放点距离画布左侧的距离
  // 在缩放的时候始终是固定的值
  // 用户鼠标移动或，拖动图标后将该值设置为undefined
  //zoomPoint: undefined | number
  zoomPoint: ZoomPoint

  // 偏移, 用来存储移动过程中的偏移值
  // 以render unit 来计数
  offset: Offset = {
    head: 0,
    tail: 0,
  }

  // 偏移，以像素来计数
  offsetOfPx: Offset = {
    head: 0,
    tail: 0,
  }

  // 变化的濡染单元数量，增加宽度的总和除以unitWidth整数部分大于等于1时存放到这里。
  deltaRu: AnyObject = {
    head: undefined,
    tail: undefined,
  }


  constructor(opts: AnyObject) {
    this.dataView = opts.dataView
    this.zoomPoint = {
      distance: undefined,
      dataIndex: undefined,
    }
  }

  private _calc(x: number, deltaRuVal: number, offsetVal: number) {
    // data view 没有进行移动或缩放
    if (deltaRuVal === undefined) {
      offsetVal = x
      deltaRuVal = 0
    }

    const result: AnyObject = {
      deltaRuVal,
      offsetVal,
      isInt: false
    }

    // 缩放的大小刚好是一个unit
    if (
      // 这里只考虑上一次data view变动之后的情况
      Math.abs(Math.trunc(x) - Math.trunc(deltaRuVal)) >= 1
      // 当x的值在1和-1直接，经过0的时候
      || Math.sign(x) != Math.sign(result.offsetVal)
    ) {
      // 整数部分, 总共变动了多少step
      result.deltaRuVal = Math.trunc(x)

      result.isInt = true
      console.log('int')
    }
    // 小数部分，表示偏移量
    result.offsetVal = x - Math.trunc(x)
    return result
  }


  /**
   * 计算头部偏移
   */
  headOffset(x: number) {
    const res = this._calc(x, this.deltaRu.head, this.offset.head)
    this.deltaRu.head = res.deltaRuVal
    this.offset.head = res.offsetVal
    return res
  }

  /**
   * 计算尾部偏移
   * @param x - 
   */
  tailOffset(x: number) {
    // 缩放后再视图里的数据的距离
    const remainDataDistance = 34 - Math.abs(x)

    // 尾部距离视图右侧的距离
    const val = this.dataView.viewWidth - remainDataDistance

    // 没有进行缩放
    if (this.deltaRu.tail === undefined) {
      this.deltaRu.tail = Math.trunc(val)
    }

    let res: AnyObject = {
      deltaRuVal: this.deltaRu.tail,
      offsetVal: this.offset.tail,
      isInt: false
    }

    //console.log(val, this.deltaRu.tail)
    if (Math.abs(this.deltaRu.tail - Math.trunc(val)) >= 1) {
      res.isInt = true
    }

    this.deltaRu.tail = Math.trunc(val)
    this.offset.tail = val - Math.trunc(val)
    res.deltaRuVal = this.deltaRu.tail
    res.offsetVal = this.offset.tail
    return res
  }

  /**
   * 将头部的offset值转换成负数
   * 1. 本身如果是负数或零就不变
   * 2. 本身如果是正数，就用本身的减1
   */
  negativeOffsetHead(): number {
    // offset.head 不能大于1
    const offsetHead = this.offset.head
    if (offsetHead > 0) {
      return offsetHead - 1
    }
    return offsetHead
  }


}
