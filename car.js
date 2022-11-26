class Car{
    static maxSpeed = 10; //speed is represented by tiles per second.
    static minSpeed = 4;
    constructor(startingCoordinate, img, speed= undefined){
        this.coordinate = startingCoordinate;
        this.image = img;
        this.dir = this.getrandomDirection();
        if (speed === undefined) speed = Math.floor(Math.random() * (Car.maxSpeed - Car.minSpeed + 1) + Car.minSpeed);
        if(speed < Car.minSpeed) speed = Car.minSpeed;
        if(speed > Car.maxSpeed) speed = Car.maxSpeed;
        this.speed = speed;
        this.moveInterval = 0;
    }
    //removes a car if a car is on a edge coordinate and is headed outside of the map
    isAtAnExit(){
        let noValidDirection = true;
        for(const value of Object.values(this.coordinate.direction)){
            if(value === true){
                noValidDirection = false;
                break;
            }
        }
        return noValidDirection && isEdge(this.coordinate);
    }
    setCoordinate(coordinate){
        this.coordinate = coordinate;
    }
    updateInterval(){
        this.moveInterval = millis() + 1000 / this.speed; 
    }
    draw(){
        let posX = this.coordinate.x * divisor;
        let posY = this.coordinate.y * divisor;
        let imgSize = divisor;

        push();
            translate(posX + imgSize / 2, posY + imgSize / 2);

            //car sprites are originally facing down
            switch(this.dir){
                case 'down':
                    rotate(0);
                    break;
                case 'left':
                    rotate(90);
                    break;
                case 'up':
                    rotate(180);
                    break;
                case 'right':
                    rotate(270);
                    break;
            }
            translate(-(posX + imgSize/2), -(posY + imgSize / 2));
            image(this.image, posX + 9, posY + 3, this.image.width, this.image.height);
        pop();
    }
    //chose a random direction if at an intersection
    getrandomDirection(){
        let options = [];
        for(const [dir, value] of Object.entries(this.coordinate.direction)){
            if(value === true){
                options.push(dir);
            } 
        }
        if(options.length === 0) return -1;
        return options[Math.floor(Math.random() * options.length)];
    }
}
//move a car from one coordinate one of its neighbors
function moveCar(grid, map, i,j){
    let car = map[i][j];//car is a reference
    if(car.dir === -1) car.dir = car.getrandomDirection();
    let nextCoordinate =car.coordinate.seeNeighbor(car.dir);
    //only move a car when the next tile is free and the neighbor is not an outlier 
    if(nextCoordinate != -1 && nextCoordinate.elem != 'B' && map[nextCoordinate.x][nextCoordinate.y] == undefined){
        if(grid[nextCoordinate.x][nextCoordinate.y].elem === 'T' && grid[nextCoordinate.x][nextCoordinate.y].currentInput != getOppositeDirection(car.dir)){
            return;
        }

        car.setCoordinate(nextCoordinate);        
        map[nextCoordinate.x][nextCoordinate.y] = map[i][j];      //moving vehicle to its neighboring tile
        removeCar(map, i,j);
        car.draw();
        car.updateInterval();
        car.dir = car.getrandomDirection();
    }
}

// remove car and redraw the road tile
function removeCar(map, i,j){
    if (map[i][j] === undefined) { return; }
    map[i][j] = undefined;
    drawStructure(grid[i][j].elem, i, j);

    // if TAB is held, ensure arrow marks are restored after road image is replaced
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