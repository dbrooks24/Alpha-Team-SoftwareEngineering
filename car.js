class Car{
    static maxSpeed = 10; //speed is represented by tiles per second.
    static minSpeed = 4;
    constructor(startingCoordinate, speed=1){
        //this.image = image
        this.coordinate = startingCoordinate;
        this.dir = this.getrandomDirection();
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
        //return isEdge(this.coordinate) && this.coordinate.seeNeighbor(this.dir).elem == 'B'; to be added later
    }
    setCoordinate(coordinate){
        this.coordinate = coordinate;
        this.dir = this.getrandomDirection();
    }
    updateInterval(){
        this.moveInterval = millis() + 1000 / this.speed; 
    }
    //chose a random direction if at an intersection
    getrandomDirection(){
        let options = [];
       // console.log('dir', this.coordinate.direction)
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
function moveCar(map, i,j){
    if(map[i][j]  != undefined){
        let car = map[i][j]
        if(millis() > car.moveInterval ){
            let nextCoordinate =car.coordinate.seeNeighbor(car.dir);
            //only move a car when the next tile is free and the neighbor is not an outlier
            if(nextCoordinate != -1 && nextCoordinate.elem != 'B' && map[nextCoordinate.x][nextCoordinate.y] == undefined){
                car.setCoordinate(nextCoordinate);
                map[nextCoordinate.x][nextCoordinate.y] = map[i][j]; //moving vehicle to its neighboring road
                removeCar(map, i,j);
                car.updateInterval();
            }
        }
    }
}
function removeCar(map, i,j){
    map[i][j] = undefined;
}