import Plugin from "../plugin";

export default class MyFirstPlugin extends Plugin {
  constructor(name: string) {
    super(name)
  }

  run() {
    this.sayHello()
  }

  sayHello() {
    console.log(`Hi, this is my first plugin.`)
    console.log(this.core)
  }
}
