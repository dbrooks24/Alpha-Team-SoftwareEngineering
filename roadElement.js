// define what points of a grid are T, B, R
class coordinate {
  constructor(x, y, element, img) {
    this.x = x;
    this.y = y;
    this.elem = element;
    this.image = img;
    this.neighbors = [];
    // at least one must be false (cars can't go backwards on roads here)
    this.direction = {'up': false, 'left': false, 'right': false, 'down': false};
    this.updated = true;
    this.aTimer = 0;
    this.parentVertex = undefined;//the traffic light that leads to this tile. It should be called on only elements of type "R"
    this.parentEdge = undefined;
    }
  //properties to be added only to traffic light coordinates
  addTrafficLightProperties(prev){
    if(this.elem !== 'T') return;
 

    this.trafficInputDirections = trafficInput(this);
    this.trafficFlowInterval    = 0;
    this.currentInput = undefined;
    this.updateInterval = () => this.trafficFlowInterval = millis() + 3000;
    this.changeCurrentInput = () => {
      //find the next input direction in a clockwise manner
      let nextDirection = ['up', 'right', 'down', 'left'];
      let prevInput = this.currentInput;
      let start = nextDirection.findIndex(i => i == this.currentInput);
      let i = (start + 1) % nextDirection.length
      while(i != start){
        if(this.trafficInputDirections[nextDirection[i]]){
          this.currentInput = nextDirection[i];
          return;
        }
        ++i;
        if(i == nextDirection.length) i = 0;
      }
    }
    this.currentInput =  this.changeCurrentInput();
  }
  removeTrafficLightProperties(){
    if(this.elem !== 'T') return;
    this.trafficInputDirections = undefined;
    this.trafficFlowInterval    = undefined;
    this.currentInput           = undefined;
    this.updateInterval         = undefined;
    this.changeCurrentInput     = undefined;
    this.outgoingEdges          = undefined;
    this.routableExits          = undefined;
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
      initial.updated = false;
      // if(initial.elem == "T"){
      //   initial.parentEdge = Object.keys(initial.direction)[index];
      // }
    } else {
      initial.direction[Object.keys(initial.direction)[index]] = false;
    }
  }
}

// remove a road by simply right-clicking it (can't drag & delete multiple roads)
function removeRoad(point, reset = false) {
  if (point.elem =="B" || (carMap[point.x][point.y] != undefined)) { return; }
  for (let i = 0; (i < 4) && (reset === false); ++i) {            // if intermediate road, don't delete
    if (point.direction[Object.keys(point.direction)[i]] === true) {
      return;
    }
  } 

  // for any road that goes into this tile, make their respective direction flag false and clear arrow residue
  colorGrid(point, 0, true);
  for (let i = 0; i < 4; ++i) {
    let nearby = point.seeNeighbor(Object.keys(point.direction)[i]);
    if (nearby.direction[Object.keys(nearby.direction)[getOpposite(i)]] === true) {
      nearby.direction[Object.keys(nearby.direction)[getOpposite(i)]] = false;
      nearby.updated = false;
      colorGrid(nearby, 0, true);
    }
  }
  point.elem = 'B';
  point.neighbors = [];

  // darken grass sprites when tabbed
  if (keyIsDown(TAB)) { tint(222, 145, 0); }
  image(point.image, point.x * divisor + 1, point.y * divisor + 1);
  if (keyIsDown(TAB)) { noTint(); }
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
function getOppositeDirection(dir) {
  switch (dir){
    case'up': 
      return 'down';
    case 'down': 
      return 'up';
    case 'left': 
      return 'right';
    case 'right':
      return 'left';
  }
}
//return the list of neighbors whose traffic traffic output leads to this point
function trafficInput(point){
    let result = {'up': false, 'left': false, 'right': false, 'down': false};
    // check above
    if (point.y != 0) { 
      if(grid[point.x][point.y - 1].direction.down){result.up = true;}
    }
    // check left
    if (point.x != 0) {
       if(grid[point.x - 1][point.y].direction.right){result.left = true;}
    }
    // check right
    if (point.x != (cols - 1)) { 
      if(grid[point.x + 1][point.y].direction.left){result.right = true;}
    }
    // check down
    if (point.y != (rows - 1)) { 
      if(grid[point.x][point.y + 1].direction.up){result.down = true;}
    }
    return result;
}
function isAnExit(point){
  if(point.elem != "R") return false;
  let noValidDirection = true;
  for(const value of Object.values(point.direction)){
    if(value === true){
        noValidDirection = false;
        break;
    }
  }
  return isEdge(point) && noValidDirection;
}