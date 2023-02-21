import "./view/assets/style/index.scss"
import DataItem from './core/data/data-item'
import Chart from './core/chart'
import MainChart from './core/layers/main-chart'
import MaChart from './core/layers/ma-chart'
import Cursor from './core/layers/cursor'
import { SourceData } from "./core/data"

function $(id: string) {
  return document.getElementById(id)
}

const prevEl = $('prev')
const nextEl = $('next')
const zoomInEl = $('zoom-in')
const zoomOutEl = $('zoom-out')
const resetEl = $('reset')

const symbol = '300999'
const size = 300

document.getElementById('load-data').addEventListener('click', evt => {
  const symbolEl = document.getElementById('symbol') as HTMLInputElement
  const sizeEl = document.getElementById('size') as HTMLInputElement
  const symbolVal = symbolEl.value
  const sizeVal = sizeEl.value
  //run(symbolVal, parseInt(sizeVal))
}, false)

/*
$('canvas1').addEventListener('eov-move-start', evt => {
  console.log(`Event Fired:`, evt)
})
*/

;(async function() {
  const sourceData = new SourceData({})
  await sourceData.loadData(`http://localhost:3001/v1/a-share/kline?symbol=${symbol}&size=${size}`)
  const serise = sourceData.jsonData.map((item: any) => {
    const ohlc = new DataItem(
      item.high, 
      item.open, 
      item.close, 
      item.low, 
    )
    return {
      ohlc,
      time: item.time
    }
  }
  )

  const chart = new Chart({
    selector: '#canvas1',
    serise,
    /*
    renderUnit: {
      width: 20,
      gap: 5,
    }
    */
  })
    // 可交换图标
    .interactable(true)

  // 定义蜡烛图图层
  const kl = new MainChart({
    chart, 
    id: 'main',
    name: 'K线图',
  })

  // 定义Ma(10)图层
  const ma10 = new MaChart({
    chart,
    period: 10,
    lineColor: '#3399ff',
    lineWidth: 2,
    id: 'ma10',
    name: '10日移动平均线图',
  })

  // 定义Ma(20)图层
  const ma20 = new MaChart({
    chart,
    period: 20,
    lineColor: '#cc3399',
    lineWidth: 2,
    id: 'ma20',
    name: '20日移动平均线图',
  })

  // 定义Ma(50)图层
  const ma50 = new MaChart({
    chart,
    period: 50,
    lineColor: '#66ff33',
    lineWidth: 2,
    id: 'ma50',
    name: '50日移动平均线图',
  })
    //.hide()

  // 定义游标图层
  const cursor = new Cursor({
    chart,
    id: 'cursor',
    name: '鼠标游标',
  })

  // 清理图层
  chart.layers.clearLayers()
  // 添加图层
  chart.layers.addLayers([
    kl,
    ma10, 
    ma20, 
    ma50, 
    cursor,
  ])

  // 初始化坐标系统
  chart.initCoordinate()


  // 重绘整个图表
  chart.draw()


  prevEl.addEventListener('click', async evt => {
    //await dataSerise.prependData(40)
    chart.interaction && 
    chart.interaction.moveLeft()
  })
  nextEl.addEventListener('click', async evt => {
    chart.interaction && 
    chart.interaction.moveRight()
  })
  zoomInEl.addEventListener('click', async evt => {
    chart.interaction && 
    chart.interaction.zoomIn()
  })
  zoomOutEl.addEventListener('click', async evt => {
    chart.interaction && 
    chart.interaction.zoomOut()
  })
  resetEl.addEventListener('click', async evt => {
    //kl.reset()
    chart.interaction && 
    chart.interaction.reset()
  })

  $('dis').addEventListener('click', evt => {
    if (chart.interaction === undefined) {
      chart.interactable(true)
    } else {
      chart.interactable(false)
    }
  })

})()



