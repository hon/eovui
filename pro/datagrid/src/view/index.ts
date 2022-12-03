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
    this.gridSidebar = new GridSidebar()
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
    el.innerHTML = 'This is the grid footer.'

    this.el = el
  }


}
class GridSidebar {
  el: HTMLElement

  constructor() {
    this.init()
  }

  init() {
    const el = document.createElement('div')
    el.innerHTML = 'This is the grid sidebar.'

    this.el = el
  }

}
