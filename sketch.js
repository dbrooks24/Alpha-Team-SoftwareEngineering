var parentID = 'CanvasParent';
var canvasParent = document.getElementById(parentID);
let divisor = 20;
let cols, rows, grid;
let prev = new coordinate(-1, -1, 'B');
let vehicles;
let simulationHasStarted = false, menuOpen = false ; // menuOpen is to prevent the user from interacting with the grid when menu is open
let canvas2;                                         // enables dimming of screen

// prepare car and road sprites
let roadImg, grassImgs, carImgs;
function preload() {
  carImgs = [
              loadImage("images/car1.png"),
              loadImage("images/car2.png"),
              loadImage("images/car3.png")
            ]
  roadImg = loadImage("images/tempRoad.png");
  grassImgs = [
                loadImage("images/grass.png"),
                loadImage("images/grass2.png"),
                loadImage("images/grass3.png")
              ]
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
      let rand = randomInRange(0, grassImgs.length);
      grid[i][j] = new coordinate(i, j, "B", grassImgs[rand]);
      carMap[i][j] = undefined;
      colorGrid(grid[i][j], 175);
      image(grid[i][j].image, i * divisor + 1, j * divisor + 1);
    }
  }
  canvas2 = createGraphics(cols * divisor, rows * divisor);
  angleMode(DEGREES);
  frameRate(18);    // may have to increase for smoother movement for cars
}

// (0,0) is top left of the grid; this function is continuously called
function draw() {
  // color the grid accordingly
  for (let i = 0; i < cols; ++i) {
    for (let j = 0; j < rows; ++j) {
        
      // drawing road tiles
      if ((grid[i][j].elem === "R" || grid[i][j].elem === "T") && (grid[i][j].updated === false) && (carMap[i][j] === undefined)) {
        image(roadImg, i * divisor + 1, j * divisor + 1);
        grid[i][j].updated = true;

        // display road connectivity upon holding tab while building roads
        if (keyIsDown(TAB)) {
          displayDirections(i, j);
          for (let k = 0; k < 4; ++k) {
            let nearby = grid[i][j].seeNeighbor(Object.keys(grid[i][j].direction)[k]);
            if (nearby.direction[Object.keys(nearby.direction)[getOpposite(k)]] === true) {
              displayDirections(nearby.x, nearby.y);
            }
          }
        }
      } 
      if(grid[i][j].elem === 'T') { 
        if(millis() > grid[i][j].trafficFlowInterval){
          grid[i][j].changeCurrentInput();
          grid[i][j].updateInterval();
        }
        drawTrafficLight(grid[i][j]);
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
    }
  }
}

// color tiles accordingly
function colorGrid(point, color, disableFill = false) {
  if (!disableFill)    { fill(color); }
  else                 { noFill();    }
  if (!keyIsDown(TAB)) { stroke(211); }   // border color of tiles
  else                 { stroke(120); }
  strokeWeight(2);
  rect(point.x * divisor, point.y * divisor, divisor - 1, divisor - 1);
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
      carMap[i][j] = new Car(grid[i][j], carImgs[randomInRange(0, carImgs.length)]);
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
      
      assignDirection(prev, spot);    // assign direction according to the newly added route
      colorGrid(prev, 0, true);       // removes paint residue from arrows when removing connectivity (while holding tab)
      colorGrid(spot, 0, true);

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

// do not take any inputs residing outside of the canvas
function isInsideCanvas() {
  if (mouseX < 0 || mouseX > (width - 1) || mouseY < 0 || mouseY > (height - 1)) {
    return false;
  } else {
    return true;
  }
}

// Upon holding TAB, display road connectivity
function keyPressed() {
  if (keyCode === TAB) {
    canvas2.clear();
    canvas2.background(100, 200);
    image(canvas2, 0, 0);
    
    // display directional arrows for roads
    for (let i = 0; i < cols; ++i) {
      for (let j = 0; j < rows; ++j) {
        displayDirections(i, j);
      }
    }
  }
}

// show road connectivity
function displayDirections(i, j) {
  let up    = grid[i][j].direction[Object.keys(grid[i][j].direction)[0]];
  let left  = grid[i][j].direction[Object.keys(grid[i][j].direction)[1]];
  let right = grid[i][j].direction[Object.keys(grid[i][j].direction)[2]];
  let down  = grid[i][j].direction[Object.keys(grid[i][j].direction)[3]];

  // draw arrows for the respective directions as needed
  if (up)     { drawArrow(i, j, 0);   }
  if (left)   { drawArrow(i, j, 270); }
  if (right)  { drawArrow(i, j, 90);  }
  if (down)   { drawArrow(i, j, 180); }
}

// display arrows to show road connectivity 
function drawArrow(x, y, degree) {
  push();
  realX = x * divisor;
  realY = y * divisor;
  stroke('yellow');
  strokeWeight(3.5);
  translate(realX + 10, realY + 10);        // set pivot of rotation
  rotate(degree);
  translate(-realX - 10, -realY - 10);      // reset pivot of rotation

  // draw directional arrow
  line(realX + 10, realY + 10, realX + 10, realY - 10);
  triangle(realX + 7.8, realY - 5, realX + 10, realY - 10, realX + 12.2, realY - 5);
  pop();
}

// undarken the canvas
function keyReleased() {
  if (keyCode === TAB) {
    restoreLook();
  }
}

// restore original canvas appearance (roads, terrain, and cars) once TAB is lifted
function restoreLook() {
  for (let i = 0; i < cols; ++i) {
    for (let j = 0; j < rows; ++j) {
      if ((grid[i][j].elem == 'R') || (grid[i][j].elem === 'T')) {
        grid[i][j].updated = false;
        colorGrid(grid[i][j], 0, true);
      } else {
        colorGrid(grid[i][j], 0, true);
        image(grid[i][j].image, i * divisor + 1, j * divisor + 1);
      }

      if (carMap[i][j] != undefined) {
        carMap[i][j].draw();
      }
    }
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

  // if tab key is held when resetting, maintain dark canvas appearance
  if (keyIsDown(TAB)) {
    restoreLook();
    canvas2.clear();
    canvas2.background(100, 200);
    image(canvas2, 0, 0);
  }

}

function drawTrafficLight(point){
  strokeWeight(1);
  if(point.elem !== 'T') return;
  let drawUp    = point => triangle(point.x * divisor + 4, point.y * divisor + 4, point.x * divisor  + 9.5, point.y * divisor  + 10, point.x * divisor + 15, point.y * divisor + 4);
  let drawLeft  = point => triangle(point.x * divisor + 4, point.y * divisor + 4, point.x * divisor + 9.5, point.y * divisor + 10, point.x * divisor + 4, point.y * divisor + 15);
  let drawRight = point => triangle(point.x * divisor + 15, point.y * divisor + 4, point.x * divisor + 9.5, point.y * divisor + 10, point.x * divisor + 15, point.y * divisor + 15);
  let drawDown  = point => triangle(point.x * divisor + 4, point.y * divisor + 15, point.x * divisor  + 9.5, point.y * divisor + 10, point.x * divisor + 15, point.y * divisor + 15);
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
function randomInRange(min, max){
  return Math.floor(Math.random() * (max - min) + min);
}