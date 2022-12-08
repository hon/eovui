import "./assets/style/index.scss"
import DataItem from './data/DataItem'
import Chart from './Chart'
import MainChart from './layers/MainChart'
import MaChart from './layers/MaChart'
import Cursor from './layers/Cursor'
import DataSerise from './data/DataSerise'

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
        dataSerise,
        /*
        renderUnit: {
          width: 20,
          gap: 5,
        }
        */
      })

      const kl = new MainChart({
        chart, 
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

      const ma5 = new MaChart({
        mainChart: kl,
        period: 5,
        lineColor: '#ff9933',
        lineWidth: 1,
      })

      const ma20 = new MaChart({
        mainChart: kl,
        period: 20,
        lineColor: '#cc3399',
        lineWidth: 2,
      })

      const ma30 = new MaChart({
        mainChart: kl,
        period: 30,
        lineColor: '#cc3300',
        lineWidth: 2,
      })
      .hide()
      const cursor = new Cursor({
        chart,
      })

      chart
        .deleteAllLayers()
        .addLayers(
          kl,
          ma5, 
          ma20, 
          ma30, 
          cursor,
        )
        .update()

      console.log(dataSerise)
    
    })
}

run(symbol, size)
 
