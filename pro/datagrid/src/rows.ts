/**
 * Row, to be extended
 */
interface Row{
  id: string,
  index: number,
}

export default class Rows {

  constructor() {}

  /**
   * Add one or some columns after the column list
   */
  add(items: Row | Row[]) {}


  /**
   * Insert on or some columns after a column by index 
   *
   * @param {number} index - column index
   * @param {Row | Row[]} row      - column item
   * @returns {Rows}
   */
  insertAfterByIndex(index: number, row: Row | Row[]): Rows{
    return this
  }

  insertAfterById(id: string, row: Row | Row[]) {}

  insertFirst(row: Row | Row[]) {}

  removeById(id: string): boolean {
    return false
  }
  removeByIndex(): boolean {
    return false

  }

  updateById() {}
  updateByIndex() {}
}


