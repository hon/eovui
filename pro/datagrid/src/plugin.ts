// will be known when register the plugin
type DataGrid = unknown

// alias of Object type
export type OptionType = Object

// define the IPlugin Interface
export interface IPlugin {
  name: string,
  init(datagrid: DataGrid, options: OptionType): IPlugin,
  run(): void
}

// manage plugins
export class PluginManager {
  plugins: IPlugin[]
  constructor() {
    this.plugins = []
  }

  register(plugin: IPlugin): IPlugin {
    this.plugins.push(plugin)
    return plugin
  }
}

// some implements of IPlugin
export default class Plugin implements IPlugin {
  name: string
  datagrid: DataGrid

  // every plugin should hava a namespace to avoid effect other plugin's functionality
  private namespace: string

  constructor(name: string) {
    this.name = name
    this.namespace = `eovui.datagrid.${name}`
  }

  init(datagrid: DataGrid, options: OptionType): IPlugin{
    this.datagrid = datagrid
    return this
  }
  run(): void {}
}
