export default class MouseStatus {
  constructor() {}

  direction(start: any, end: any) {
    let directions = {
      vertical: '',
      horizontal: ''
    }

    if (start.x > end.x) {
      directions.horizontal = 'left'
    } else if (start.x < end.x) {
      directions.horizontal = 'right'
    } else {
      directions.horizontal = ''
    }

    if (start.y > end.y) {
      directions.vertical = 'up'
    } else if (start.x < end.x) {
      directions.horizontal = 'down'
    } else {
      directions.horizontal = ''
    }

    return directions
    
  }

  speed(start: any, end: any) {
    let speeds = {
      vertical: 0,
      horizontal: 0,
    }

    const time = Math.abs(start.time - end.time)

    speeds.horizontal = Math.abs(start.x - end.y) / time
    speeds.vertical = Math.abs(start.y - end.y) / time

    return speeds
  }
}

