import '../assets/style/index.scss'
export default class View {
  el: HTMLElement
  gridHead: GridHead
  gridBody: GridBody
  gridFooter: GridFooter
  gridSidebar: GridSidebar

  constructor() {
    this.init()
  }

  init() {
    const el = document.createElement('div')
    el.classList.add('eovui-datagrid-container')
    
    this.el = el 

    // Grid head
    this.gridHead = new GridHead()
    this.el.append(this.gridHead.el)

    // Grid body
    this.gridBody = new GridBody()
    this.el.append(this.gridBody.el)

    // Grid footer
    this.gridFooter = new GridFooter()
    this.el.append(this.gridFooter.el)
    
    // Grid sidebar
    const gridSidebar = new GridSidebar()
    gridSidebar.hide()
    this.gridSidebar = gridSidebar
    this.el.append(this.gridSidebar.el)

  }

}

class GridHead {
  el: HTMLElement

  constructor() {
    this.init()
  }

  init() {
    const el = document.createElement('div')
    el.classList.add('eovui-datagrid-head')
    el.innerHTML = 'This is the grid head.'

    this.el = el
  }
}

class GridBody {
  el: HTMLElement

  constructor() {
    this.init()
  }

  init() {
    const el = document.createElement('div')
    el.classList.add('eovui-datagrid-body')
    el.innerHTML = 'This is the grid body.'

    this.el = el
  }
}

class GridFooter {
  el: HTMLElement

  constructor() {
    this.init()
  }

  init() {
    const el = document.createElement('div')
    el.classList.add('eovui-datagrid-footer')
    el.innerHTML = 'This is the grid footer.'

    this.el = el
  }

  hide() {
    this.el.style.display = 'none'
  }


}
class GridSidebar {
  el: HTMLElement

  constructor() {
    this.init()
  }

  init() {
    const el = document.createElement('div')
    el.classList.add('eovui-datagrid-sidebar')
    el.innerHTML = 'This is the grid sidebar.'

    this.el = el
  }
  hide() {
    this.el.style.display = 'none'
  }

}
