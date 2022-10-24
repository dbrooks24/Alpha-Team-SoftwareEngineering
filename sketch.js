var parentID = 'CanvasParent';
var canvasParent = document.getElementById(parentID);
let divisor = 20;
let cols;
let rows;
let grid;
let prev = new coordinate(-1, -1, 'B');
let vehicles;
let simulationHasStarted = false, menuOpen = false ; // menuOpen is to prevent the user from interacting with the grid when menu is open

// prepare car and road sprites
let roadImg;
let grassImg1;
function preload() {
  roadImg = loadImage("images/tempRoad.png");
  grassImg1 = loadImage("images/grass.png");      // 3 total variants; we could randomly select one to place for variety
}

// setup the grid for traffic to take place
function setup() {
  const canvas = createCanvas(canvasParent.offsetWidth, canvasParent.offsetHeight);
  canvas.parent(canvasParent);
  // disable right-click menu pop-up when right-clicking on canvas
  canvas.elt.addEventListener("contextmenu", (e) => e.preventDefault());
  background(255);
  
  // calculate number of columns and rows for grid
  cols = floor(width / divisor);
  rows = floor(height / divisor);
  
  //creating a 2-D vehicle registery
  carMap = new Array(cols);
  // create 2-D array -- the grid
  grid = new Array(cols);
  for (let i = 0; i < cols; ++i) {
    grid[i] = new Array(rows);
    carMap[i] = new Array(rows);
  }
  // register the grid points with coordinate class
  // initialize the carmap indicies to undefined
  for (let i = 0; i < cols; ++i) {
    for (let j = 0; j < rows; ++j) {
      grid[i][j] = new coordinate(i, j, "B");
      carMap[i][j] = undefined;
      colorGrid(grid[i][j], 175);

      image(grassImg1, i * divisor + 1, j * divisor + 1);
    }
  }
  frameRate(18);    // may have to increase for smoother movement for cars
}

// (0,0) is top left of the grid; this function is continuously called
function draw() {
  // color the grid accordingly
  for (let i = 0; i < cols; ++i) {
    for (let j = 0; j < rows; ++j) {
        
      // drawing road tiles
      if ((grid[i][j].elem === "R" || grid[i][j].elem === "T") && (grid[i][j].updated === false) && (carMap[i][j] === undefined)) {
        //colorGrid(grid[i][j], 255);
        //placeSprite(grid[i][j]);
        image(roadImg, i * divisor + 1, j * divisor + 1);

        grid[i][j].updated = true;
        addPoints(grid[i][j]);
      } 

      //drawing cars 
      if(carMap[i][j] != undefined){
        if(carMap[i][j].isAtAnExit()){
          removeCar(carMap, i,j);
        }else if( simulationHasStarted){
          if(millis() > carMap[i][j].moveInterval)
            moveCar(grid, carMap, i,j);
        }
      }
      
      if(grid[i][j].elem === 'T') { 
        if(millis() > grid[i][j].trafficFlowInterval){
          grid[i][j].changeCurrentInput();
          grid[i][j].updateInterval();
        }
        drawTrafficLight(grid[i][j]);
      }
    }
  }
}

// color tiles accordingly
function colorGrid(point, color) {
  fill(color);
  stroke('lightgray');    // border color of tiles
  strokeWeight(2);
  rect(point.x * divisor, point.y * divisor, divisor - 1, divisor - 1);
}

function placeSprite(point) {
}

// record initial 'R'-tile, then go straight to mouseDragged()
// if it's a right-click, delete a non-intermediate road if possible
function mousePressed() {
  if (!isInsideCanvas() || menuOpen) { return; }
  prev = grid[floor(mouseX / divisor)][floor(mouseY / divisor)];
  if (mouseButton === RIGHT) {
    if(!simulationHasStarted)
      removeRoad(grid[floor(mouseX / divisor)][floor(mouseY / divisor)]);
    removeCar(carMap, floor(mouseX / divisor),floor(mouseY / divisor));
  } else if(mouseButton === LEFT && simulationHasStarted){
    let i = floor(mouseX / divisor); let j = floor(mouseY / divisor);
    //create new car if the coordinate is empty and the tile is a road tile
    if(carMap[i][j] === undefined && grid[i][j].elem === 'R'){
      carMap[i][j] = new Car(grid[i][j]);
    }
  }
}

// only consider a road that goes from A to B (where B is at the edge), even if it's just two tiles, for car instantiation 
function changeMode(){
  if (!menuOpen) {
    // check if a legal road exists; that is, a road -- with no direction -- that ends at an edge for cars to despawn)
    for (let i = 0; i < cols; ++i) {
      for (let j = 0; j < rows; ++j) {
        if ((grid[i][j].elem === 'R') && isEdge(grid[i][j]) && ((Object.keys(Object.entries(grid[i][j].direction).filter(([_, value]) => value === true))).length === 0)) {

          // if at least one tile is going into this tile at the edge, car instantiation can be done
          for (let k = 0; k < 4; ++k) {
            let nearby = grid[i][j].seeNeighbor(Object.keys(grid[i][j].direction)[k]);
            if (nearby.direction[Object.keys(nearby.direction)[getOpposite(k)]] === true) {

              // enable/disable car instantiation and turn the toggle on [left->right] on the UI
              simulationHasStarted = !simulationHasStarted;
              toggleMode(simulationHasStarted);
              return; // only need 1 confirmed legal road
            }
          }
        }
      }
    }
    showMsg("err0");  // pop-up error message to tell user that a complete road is required to do car instantiation
  }
}

// change a 'B'-tile into a new road
// to continue building the same road, click & hold an existing road tile and drag
// it horizontally and/or vertically to grow it
function mouseDragged() {
  if (!isInsideCanvas() || simulationHasStarted || menuOpen) { return; }
  let spot = grid[floor(mouseX / divisor)][floor(mouseY / divisor)];
  if (mouseButton === LEFT) {
    
    // create a new road if a 'B'-tile is clicked; otherwise, grow an existing road
    if ((spot.elem != 'R' && spot.elem != 'T') && (areEqual(prev, spot))) {
      if(spot.elem ===  'B') spot.elem = 'R';
      spot.neighbors = getNeighbors(spot);
      spot.updated = false;
    } else if (!areEqual(prev, spot) && (prev.neighbors.findIndex(i => i.x === spot.x && i.y === spot.y) != -1)) {
      spot.elem = 'R';
      spot.neighbors = getNeighbors(spot);
      
      // assign direction according to the newly added route
      assignDirection(prev, spot);

      //change the element type from R to T if the road has become a intersection
      if(spot.elem === 'T'){
        if(!IsIntersection(spot)){
          spot.elem = 'R'
          spot.removeTrafficLightProperties();
        }
      }else if(IsIntersection(spot)){
        spot.elem = 'T';
        spot.addTrafficLightProperties();
      }
      //update the vehicles referenced coordinate when the directions of a coordinate changes
      if(carMap[prev.x][prev.y] != undefined)
        carMap[prev.x][prev.y].setCoordinate(prev); 
      prev.updated = false;
      prev = spot;
      spot.updated = false;
    }
  }
}
//called once the broswer window is resized
function windowResized(){
  resizeCanvas(canvasParent.offsetWidth, canvasParent.offsetHeight);
}
// do not take any inputs residing outside of the canvas
function isInsideCanvas() {
  let x = mouseX, y = mouseY;
  if (mouseX < 0 || mouseX > (width - 1) || mouseY < 0 || mouseY > (height - 1)) {
    return false;
  } else {
    return true;
  }
}

// Upon clicking the button, "Reset Simulation," return grid to initial state & remove cars
// maybe add a comfirmation message later
function resetGrid() {
  showMsg("reset");
  // reset toggle and remove cars
  simulationHasStarted = false;
  toggleMode(false, true);
  for (let i = 0; i < cols; ++i) {
    for (let j = 0; j < rows; ++j) {
      removeCar(carMap, i, j);

      // delete roads
      if (grid[i][j].elem === 'R' || grid[i][j].elem === 'T') {
        removeRoad(grid[i][j], true);
      }
    }
  }
}

// will be replaced with road sprites
// atm, blue points signifies which tiles a tile can go into
function addPoints(spot) {
  p0 = spot.x * divisor;
  p1 = spot.y * divisor;
  up = spot.direction[Object.keys(spot.direction)[0]];
  left = spot.direction[Object.keys(spot.direction)[1]];
  right = spot.direction[Object.keys(spot.direction)[2]];
  down = spot.direction[Object.keys(spot.direction)[3]];
  
  stroke('cyan');
  strokeWeight(6);
  if (up) { point(p0 + 10, p1 + 5); }
  if (left) { point(p0 + 5, p1 + 10); }
  if (right) { point(p0 + 15, p1 + 10); }
  if (down) { point(p0 + 10, p1 + 15); }
  strokeWeight(0);
}
function drawTrafficLight(point){
  if(point.elem !== 'T') return;
  let drawUp    = point => triangle(point.x * divisor + 3, point.y * divisor + 3, point.x * divisor  + 10, point.y * divisor  + 10, point.x * divisor + 17, point.y * divisor + 3);
  let drawLeft  = point => triangle(point.x * divisor + 3, point.y* divisor + 3, point.x * divisor + 10, point.y * divisor  + 10, point.x * divisor + 3, point.y * divisor + 17);
  let drawRight = point => triangle(point.x * divisor + 17, point.y * divisor + 3, point.x * divisor + 10, point.y * divisor + 10, point.x * divisor + 17, point.y * divisor + 17);
  let drawDown  = point => triangle(point.x * divisor + 3, point.y * divisor + 17, point.x * divisor  + 10, point.y * divisor + 10, point.x * divisor + 17, point.y * divisor + 17);
  if(point.trafficInputDirections.up){ 
    if(point.currentInput == 'up'){fill(0, 255, 0)} else {fill(255, 0, 0)} 
    drawUp(point);
  }
  if(point.trafficInputDirections.left)  {
    if(point.currentInput == 'left'){fill(0, 255, 0)} else {fill(255, 0, 0)} 
    drawLeft(point);
  }
  if(point.trafficInputDirections.right) {
    if(point.currentInput == 'right'){fill(0, 255, 0)} else {fill(255, 0, 0)} 
    drawRight(point);
  }
  if(point.trafficInputDirections.down)  {
    if(point.currentInput == 'down'){fill(0, 255, 0)} else {fill(255, 0, 0)} 
    drawDown(point);
  }

}
//a intersection is any point with traffic coming in from more than one direction
function IsIntersection(point){
  let pointInputFlow = trafficInput(point);
  let hasATrafficInput = false;
  let result = false;
  for(let dir in pointInputFlow){
    if(pointInputFlow[dir] && hasATrafficInput){
      result = true;
      break;
    }
    if(pointInputFlow[dir]) {hasATrafficInput = true;}
    
  }
  return result;
}