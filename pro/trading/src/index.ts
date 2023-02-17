import "./view/assets/style/index.scss"
import DataItem from './core/data/data-item'
import Chart from './core/chart'
import MainChart from './core/layers/main-chart'
import MaChart from './core/layers/ma-chart'
import Cursor from './core/layers/cursor'
import DataSerise from './core/data/data-serise'
import { SourceData } from "./core/data"

function $(id: string) {
  return document.getElementById(id)
}

const prevEl = $('prev')
const nextEl = $('next')
const zoomInEl = $('zoom-in')
const zoomOutEl = $('zoom-out')
const resetEl = $('reset')

const symbol = '002423'
const size = 300

document.getElementById('load-data').addEventListener('click', evt => {
  const symbolEl = document.getElementById('symbol') as HTMLInputElement
  const sizeEl = document.getElementById('size') as HTMLInputElement
  const symbolVal = symbolEl.value
  const sizeVal = sizeEl.value
  run(symbolVal, parseInt(sizeVal))
}, false)

$('canvas1').addEventListener('eov-move-start', evt => {
  console.log(`Event Fired:`, evt)
})

;(async function() {
  const sourceData = new SourceData({})
  await sourceData.loadData(`http://localhost:3001/v1/a-share/kline?symbol=${symbol}&size=${size}`)
  const serise = sourceData.jsonData.map((item: any) => new DataItem(
    item.high, 
    item.open, 
    item.close, 
    item.low, 
    item.time
  ))

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

  // 定义Ma(5)图层
  const ma5 = new MaChart({
    chart,
    period: 5,
    lineColor: '#ff9933',
    lineWidth: 1,
    id: 'ma5',
    name: '5日移动平均线图',
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

  // 定义Ma(30)图层
  const ma30 = new MaChart({
    chart,
    period: 30,
    lineColor: '#cc3300',
    lineWidth: 2,
    id: 'ma30',
    name: '30日移动平均线图',
  })
    .hide()

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
    ma5, 
    ma20, 
    ma30, 
    cursor,
  ])


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



function run(symbol: string, size: number, period = 'day') {
  fetch(`http://localhost:3001/v1/a-share/kline?symbol=${symbol}&size=${size}`)
    .then(res => res.json())
    .then(res => {


        
      const dataItems = res.map((item: any) => new DataItem(
        item.high, 
        item.open, 
        item.close, 
        item.low, 
        item.time
      ))
      const dataSerise = new DataSerise({
        dataItems
      })


      const chart = new Chart({
        selector: '#canvas1',
        serise: dataSerise,
        dataSerise,
        /*
        renderUnit: {
          width: 20,
          gap: 5,
        }
        */
      })

      // 定义蜡烛图图层
      const kl = new MainChart({
        chart, 
        id: 'main',
        name: 'K线图',
      })
      

      prevEl.addEventListener('click', async evt => {
        //await dataSerise.prependData(40)
        chart.interaction.moveLeft()
      })
      nextEl.addEventListener('click', async evt => {
        chart.interaction.moveRight()
      })
      zoomInEl.addEventListener('click', async evt => {
        chart.interaction.zoomIn()
      })
      zoomOutEl.addEventListener('click', async evt => {
        chart.interaction.zoomOut()
      })
      resetEl.addEventListener('click', async evt => {
        //kl.reset()
        chart.interaction.reset()
      })

      // 定义Ma(5)图层
      const ma5 = new MaChart({
        chart,
        period: 5,
        lineColor: '#ff9933',
        lineWidth: 1,
        id: 'ma5',
        name: '5日移动平均线图',
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

      // 定义Ma(30)图层
      const ma30 = new MaChart({
        chart,
        period: 30,
        lineColor: '#cc3300',
        lineWidth: 2,
        id: 'ma30',
        name: '30日移动平均线图',
      })
        .hide()

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
        ma5, 
        ma20, 
        ma30, 
        cursor,
      ])

      // 重绘整个图表
      chart.draw()

    })
}

//run(symbol, size)
 
