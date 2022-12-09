import { PluginManager, OptionType, IPlugin} from './plugin'
import MyFirstPlugin from './plugins/my-first-plugin';
import View from './view';

export default class DataGrid {
  private plugins: PluginManager
  private view: View

  constructor(options: Object) {
    this.plugins = new PluginManager();
  }

  mount(el: HTMLElement) {
    const view = new View()
    this.view = view
    el.append(view.el)
  }

  /**
   * Register a plugin
   */
  registerPlugin(plugin: IPlugin, options: OptionType) {
    plugin.init(this, options)
    this
      .plugins
      .register(plugin)
      .run()
  }
}

// init DataGrid
const dg = new DataGrid({})

// register `my-first-plugin`
dg.registerPlugin(new MyFirstPlugin('my-first-plugin'), {})
dg.mount(document.body)
