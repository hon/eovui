import {default as optionsUtil, OptionType} from "./../options";

/**
 * The entity that really register plugins 
 */
export interface PluginRegister {
  plugins: PluginManager
  registerPlugin(plugin: IPlugin, options: OptionType): void
}

// Define the IPlugin Interface
export interface IPlugin {
  // identifier of the plugin
  // it will act as the namespace of the plugin 
  // so every plugin should hava an id to avoid effect other plugin's functionality
  id: string

  // The object with the core apis of some library
  core: unknown

  // name for human being
  name?: string
  init(core: unknown, options: OptionType): IPlugin
  run(): void
}

// Manage plugins
export class PluginManager {

  // Plugin list
  plugins: IPlugin[]
  constructor() {
    this.plugins = []
  }

  register(plugin: IPlugin): IPlugin {
    this.plugins.push(plugin)
    return plugin
  }
}

// Some implements of IPlugin
export default class Plugin implements IPlugin {
  id: string
  name: string
  core: unknown
  options: OptionType


  constructor(options: OptionType) {
    this.core = options.core
    const defaultOptions: OptionType = {
      id: '',
      core: undefined,
      name: undefined
    }

    this.options = optionsUtil.setOptions(defaultOptions, options)
  }

  init(core: unknown, options: OptionType): IPlugin{
    this.core = core 
    return this
  }
  run(): void {}
}
