import { optionsUtil, OptionType } from '@eovui/utils'
// 封装fetch, 同时增加一些和源数据操作有关的功能
export class SourceData {

  options: OptionType
  jsonData: any
  requestUrl: string

  constructor(options: OptionType) {
    const defaultOptions = {}
    this.options = optionsUtil.setOptions(defaultOptions, options)
  }

  setOptions(newOptions: OptionType) {
    this.options = optionsUtil.setOptions(this.options, newOptions)
    return this
  }

  // 获取数据
  async loadData(requestUrl: string) {
      //const httpData = await fetch(`http://localhost:3001/v1/a-share/kline?symbol=603327&size=${size}&start-index=${startIdx}`)
    
    this.requestUrl = requestUrl
  
    const originData = await fetch(requestUrl)
    const jsonData = await originData.json()
    this.jsonData = jsonData
    return this
  }


  /**
   * 往原始数据（data）中前置数据, 根据用户的操作会加载更多的数据
   * @param {number} size - 加载多少条数据
   */
  async prependData(size: number) {
    return this
  }

}

