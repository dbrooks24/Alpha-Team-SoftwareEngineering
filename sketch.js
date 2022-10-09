let divisor = 20;
let cols;
let rows;
let grid;
let prev = new coordinate(-1, -1, 'B');

// setup the grid for traffic to take place
function setup() {
  const canvas = createCanvas(720, 400);    // width = 720; height = 400
  // disable right-click menu pop-up when right-clicking on canvas
  canvas.elt.addEventListener("contextmenu", (e) => e.preventDefault());
  
  // calculate number of columns and rows for grid
  cols = floor(width / divisor);
  rows = floor(height / divisor);
  
  // create 2-D array -- the grid
  grid = new Array(cols);
  for (let i = 0; i < cols; ++i) {
    grid[i] = new Array(rows);
  }

  // register the grid points with coordinate class
  for (let i = 0; i < cols; ++i) {
    for (let j = 0; j < rows; ++j) {
      grid[i][j] = new coordinate(i, j, "B");
    }
  }
}

// (0,0) is top left of the grid; this function is continuously called
function draw() {
  background(255);
  
  // color the grid accordingly
  for (let i = 0; i < cols; ++i) {
    for (let j = 0; j < rows; ++j) {
      fill(175);                                  // color per tile
      if (grid[i][j].elem == "R") { fill(255); } 
      stroke('lightgray');                      // border color of pixels
      strokeWeight(2);
      rect(i * divisor, j * divisor, divisor - 1, divisor - 1); // 20 x 20 squares
      
      // will be replaced with a function that places the appropriate sprites
      // atm, it places blue points on roads to show the direction of traffic
      addPoints(grid[i][j]);
    }
  }
}

// record initial 'R'-tile, then go straight to mouseDragged()
// if it's a right-click, delete a non-intermediate road if possible
function mousePressed() {
  if (!isInsideCanvas()) { return; }
  prev = grid[floor(mouseX / divisor)][floor(mouseY / divisor)];
  if (mouseButton === RIGHT) {
    removeRoad(grid[floor(mouseX / divisor)][floor(mouseY / divisor)]);
  } 
}

// change a 'B'-tile into a new road
// to continue building the same road, click & hold on an existing road tile and drag
// it horizontally and/or vertically to grow it
function mouseDragged() {
  if (!isInsideCanvas()) { return; }
  let spot = grid[floor(mouseX / divisor)][floor(mouseY / divisor)];
  if (mouseButton === LEFT) {
    
    // create a new road if a 'B'-tile is clicked; otherwise, grow an existing road
    if ((spot.elem != 'R') && (areEqual(prev, spot))) {
      spot.elem = 'R';
      spot.neighbors = getNeighbors(spot);
    } else if (!areEqual(prev, spot) && (prev.neighbors.findIndex(i => i.x === spot.x && i.y === spot.y) != -1)) {
      spot.elem = 'R';
      spot.neighbors = getNeighbors(spot);
      
      // assign direction according to the newly added route
      assignDirection(prev, spot);
      prev = spot;
    
    }
  }
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

// will be replaced with road sprites
// atm, blue points signifies which tiles the a tile can go into
function addPoints(spot) {
  p0 = spot.x * divisor;
  p1 = spot.y * divisor;
  up = spot.direction[Object.keys(spot.direction)[0]];
  left = spot.direction[Object.keys(spot.direction)[1]];
  right = spot.direction[Object.keys(spot.direction)[2]];
  down = spot.direction[Object.keys(spot.direction)[3]];
  
  stroke('cyan');
  strokeWeight(6);
  if (up) { point(p0 + 10, p1 + 3); }
  if (left) { point(p0 + 3, p1 + 10); }
  if (right) { point(p0 + 17, p1 + 10); }
  if (down) { point(p0 + 10, p1 + 17); }
  strokeWeight(0);
}
