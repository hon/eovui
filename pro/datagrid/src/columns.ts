/**
 * Type of row value
 */
type ColumnType = 'number' | 'string'

/**
 * Column item
 */
interface IColumn {
  name: string,
  id?: string,
  type?: ColumnType,

  // sortable of coresponding rows
  sortable?: boolean,

  // drag to rearrange the order of the columns
  dragable?: boolean,

  // frozen
  frozen?: boolean,
}

export default class Columns {

  columnList: IColumn[]

  visable: boolean

  constructor() {}

  /**
   * Add one or some columns after the column list
   */
  add(items: IColumn | IColumn[] | string | string[]) {

  }


  /**
   * Insert on or some columns before a column by index 
   *
   * @param {Column}      column - the column object
   * @param {number}      index  - column index
   * @returns {Columns}
   */
  insertBeforeByIndex(column: IColumn, index?: number): Columns {
    return this
  }
  insertBeforeById(column: IColumn, id?: string) {}

  removeById(id: string): boolean {
    return false
  }

  removeByIndex(): boolean {
    return false

  }

  updateById() {}
  updateByIndex() {}
}

export class Column implements IColumn {
  name: string
  constructor(name: string) {
    this.name = name
  }
}
