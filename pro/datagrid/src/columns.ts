/**
 * Type of row value
 */
type ColumnTypes = 'number' | 'string'

/**
 * Column item
 */
interface Column {
  name: string,
  id: string,
  type: ColumnTypes,

  // sortable of coresponding rows
  sortable: boolean,

  // drag to rearrange the order of the columns
  dragable: boolean,

  // frozen
  frozen: boolean,
}

export default class Columns {

  columnList: Column[]

  constructor() {}

  /**
   * Add one or some columns after the column list
   */
  add(items: Column | Column[]) {}


  /**
   * Insert on or some columns after a column by index 
   *
   * @param {number}      index  - column index
   * @param {Column}      column - the column object
   * @returns {Columns}
   */
  insertAfterByIndex(index: number, column: Column): Columns {
    return this
  }
  insertAfterById(id: string, column: Column) {}
  insertFirst(column: Column) {}

  removeById(id: string): boolean {
    return false
  }
  removeByIndex(): boolean {
    return false

  }

  updateById() {}
  updateByIndex() {}
}


