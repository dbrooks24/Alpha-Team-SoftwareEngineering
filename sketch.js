let divisor = 20;
let cols;
let rows;
let grid;

// setup the grid for traffic to take place
function setup() {
  createCanvas(720, 400);    // width = 720; height = 400
  
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

// (0,0) is top left of the grid
function draw() {
  background(255);
  
  // color the grid accordingly
  for (let i = 0; i < cols; ++i) {
    for (let j = 0; j < rows; ++j) {
      fill(175);                      // color per pixel
      if (grid[i][j].elem == "R") { fill(255); } 
      stroke(0);                      // border color of pixels
      rect(i * divisor, j * divisor, divisor - 1, divisor - 1);
    }
  }
}

// currently changes a pixel to R or B
function mousePressed() {
  spot = grid[floor(mouseX / divisor)][floor(mouseY / divisor)];
  
  // Print is for debugging to see grid coordinates upon clicking
  //print("(" + floor(mouseX / divisor) + ", " + floor(mouseY / divisor) + ")" + " Element is " + spot.elem);
  
  if ((spot.elem != "R") && isRoadLegal(spot)) {
    spot.elem = "R";
  } else {
    spot.elem = "B";
  }
  redraw()
}


