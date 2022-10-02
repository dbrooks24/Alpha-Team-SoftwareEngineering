// define what points of a grid are T, B, R, C
class coordinate {
    constructor(x, y, element) {
      this.x = x;
      this.y = y;
      this.elem = element;
    }
}

// each road is stored as a single-linked list; all are stored in some container for checking
class road {
  constructor(point) {
    this.x = point.x;
    this.y = point.y;
    this.next = null;
  }
}

class linkedRoad {
  constructor() {
    this.beginning = null;
    this.ending = null;
    this.size = 0;
  }
}

//function insertBefore(ptr, aRoad) {
//  let temp = new road(aRoad);
//  if ()
//}

// **will greatly change in the future**
// identify if new road placement is legal (must grow road from an edge)
function isRoadLegal(point) {
  occupied = 0              // number of sides connected by another road
  // check above
  if ((point.y != 0) && (grid[point.x][point.y - 1].elem == "R")) { ++occupied; }
  // check left
  if ((point.x != 0) && (grid[point.x - 1][point.y].elem == "R")) { ++occupied; }
  // check right
  if ((point.x != (cols - 1)) && (grid[point.x + 1][point.y].elem == "R")){ ++occupied; }
  // check below
  if ((point.y != (rows - 1)) && (grid[point.x][point.y + 1].elem == "R")) { ++occupied; }
    
  // check if point is at the edge of grid
  isEdge = false;
  if ((point.y == 0) || (point.y == (rows - 1)) || (point.x == 0) || (point.x == (cols - 1))) {
    isEdge = true;
  }
    
  // if not roadLegal, do a subtle screen shake (future)
  if (occupied >= 2) { return false; }
  else if ((occupied == 0) && (!isEdge)) { return false; }
  else { return true; }
}