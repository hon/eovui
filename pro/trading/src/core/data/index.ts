/**
 * 该模块主要处理数据相关的逻辑，主要功能包括
 *
 * 1. 数据项存储和操作
 *  1.1 默认数据项的存储 (DataSource)
 *  1.2 新增算法数据的存储 (DataSource)
 *  1.3 UI交互映射到数据上的操作(ViewOnData)
 *  1.4 DataLoop
 * 2. 数据获取
 */

/*
// 证券源数据
const sourceData = {
  data: {}
}

// 图层数据
const layerData = [
  {
    // 图层id, 和图层一一对应
    id: 'main',
    data: {},
    // 图层设置
    settings: {},
  }, 
  {
    id: 'ma60',
    data: {},
    settgings: {},
  },
  // ...
]

// 图表设置数据
const chartData = {
  data: {
    // data serise
  },
  settings: {},
}

const data = {
  // 源数据
  source: {},

  // 主图层绘制数据
  // 由于主图层的特殊性，就不放在layers下面，而根据传统直接放在serise里面
  serise: {},

  // 图层数据
  layers: {
    'ma60': {},
    // ...
  },
}


class DataFactory {
  sourceData: unknown
  layerData: unknown
  chartData: unknown


  constructor() {
    
  }
}
*/


export { SourceData } from './source-data'
export { LayerData } from './layer-data'



