import "./assets/style/index.scss"
import DataItem from './DataItem'
import Chart from './Chart'
import MainChart, { MaChart, Cursor } from './MainChart'
import DataSerise from './DataSerise'

function $(id: string) {
  return document.getElementById(id)
}

const prevEl = $('prev')
const nextEl = $('next')
const zoomIn = $('zoomIn')
const zoomOut = $('zoomOut')
const refresh = $('refresh')

const symbol = '603327'
const size = 150
const chart = new Chart({
  selector: '#canvas1'
})

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

      const kl = new MainChart({
        chart, 
        dataSerise,
        candleStick: {
          bodyWidth: 10,
          //gap: 9,
        }
      })

      prevEl.addEventListener('click', async evt => {
        //await dataSerise.prependData(40)
        kl.move(-1)
      })
      nextEl.addEventListener('click', async evt => {
        kl.move(1)
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
 
