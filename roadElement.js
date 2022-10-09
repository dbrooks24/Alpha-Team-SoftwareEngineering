// define what points of a grid are T, B, R
class coordinate {
  constructor(x, y, element) {
    this.x = x;
    this.y = y;
    this.elem = element;
    this.neighbors = [];
    
    // at least one must be false (cars can't go backwards on roads here)
    this.direction = {'up': false, 'left': false, 'right': false, 'down': false};
  }
  
  // fetch a single neighbor in the given direction (given as 'way')
  seeNeighbor(way) {
    switch (way) {
      case "up":
        return this.neighbors[0];
      case 'left':
        return this.neighbors[1];
      case 'right':
        return this.neighbors[2];
      case 'down':
        return this.neighbors[3];
      default:
        return -1;
    }
  }
}

// We could implement the car class to inherit its tile's coordinate class.
// This way, the cars can operate on top of the roads without breaking road's properties
// class car {}

// compare x and y values of both tiles
function areEqual(first, second) {
  if ((first.x === second.x) && (first.y === second.y)) { return true;  }
  else                                                  { return false; }
}

// check if point is at the edge of the grid
function isEdge(point) {
  let result = false;
  if ((point.y == 0) || (point.y == (rows - 1)) || (point.x == 0) || (point.x == (cols - 1))) {
    result = true;
  }
  return result;
}

// Obtain an array of a tile's 4 nearest tiles in this order [up, left, right, down]
// if the tile is at the edge, there is 1 outlier; if it's a corner, 2 outliers
function getNeighbors(point) {
  let result = [];
  let outlier = new coordinate(-1, -1, 'B');
  
  // check above
  if (point.y != 0) { result.push(grid[point.x][point.y - 1]); }
  else              { result.push(outlier); }
  // check left
  if (point.x != 0) { result.push(grid[point.x - 1][point.y]); }
  else              { result.push(outlier); }
  // check right
  if (point.x != (cols - 1)) { result.push(grid[point.x + 1][point.y]); }
  else                       { result.push(outlier); }
  // check down
  if (point.y != (rows - 1)) { result.push(grid[point.x][point.y + 1]); }
  else                       { result.push(outlier); }
    
  return result;
}

// given the initial and a current road, assign the road's connectivity as needed
function assignDirection(initial, current) {
  let index = initial.neighbors.findIndex(i => i.x === current.x && i.y === current.y);
  if (index != -1) {
    // find opposite side of given index (E.g., 0->Up is opposite of 3->Down)
    let opposite;
    opposite = getOpposite(index);
    
    // assign directions as necessary
    if ((initial.direction[Object.keys(initial.direction)[index]] != true) &&
        (current.direction[Object.keys(current.direction)[opposite]] != true)) {
      initial.direction[Object.keys(initial.direction)[index]] = true;
    } else {
      initial.direction[Object.keys(initial.direction)[index]] = false;
    }
  }
}

// remove a road by simply right-clicking it (can't drag & delete multiple roads)
function removeRoad(point) {
  if (point.elem != 'R') { return; }
  for (let i = 0; i < 4; ++i) {            // if intermediate road, don't delete
    if (point.direction[Object.keys(point.direction)[i]] === true) {
      return;
    }
  } 

  // for any road that goes into this tile, make their respective direction flag false
  for (let i = 0; i < 4; ++i) {
    let nearby = point.seeNeighbor(Object.keys(point.direction)[i]);
    if (nearby.direction[Object.keys(nearby.direction)[getOpposite(i)]] === true) {
      nearby.direction[Object.keys(nearby.direction)[getOpposite(i)]] = false;
    }
  }
  point.elem = 'B';
  point.neighbors = [];
}

//               [0 -> Up] 
// [1 -> Left]   [ Point ]   [2 -> Right]
//              [3 -> Down]
// Given an index, return the integer on other side of [ Point ]
function getOpposite(index) {
  let opposite;
  if (index === 0)        { opposite = 3; } 
  else if (index === 3)   { opposite = 0; }
  else if (index === 1)   { opposite = 2; }
  else                    { opposite = 1; }
  return opposite;
}