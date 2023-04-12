/**
 * 在开启soomthMode之后，要对像素进行精确操作，然后将操作的数据和DataView同步。
 * 将所有的操作逻辑在这里统一起来。
 * 文件名的由来：因为操作数据的类叫做DataView，因此这里的类叫做RenderView, 表示对渲染后的界面进行
 * 操作。
 */

import {AnyObject} from "@eovui/utils";
import ViewOnData from "../data/data-view";


export default class RenderView {
  dataView: ViewOnData

  // 偏移, 用来存储移动过程中的偏移值
  offset: AnyObject = {
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


    // 这里只考虑上一次data view变动之后的情况
    if (Math.abs(Math.trunc(x) - Math.trunc(deltaRuVal)) >= 1) {
      // 整数部分, 总共变动了多少step
      result.deltaRuVal = Math.trunc(x)

      result.isInt = true
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
   */
  tailOffset(x: number) {
    // 缩放后再试图里的数据的距离
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


}
