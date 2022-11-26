class TrafficLightController{
    constructor(point){
        point.addTrafficLightProperties();
        this.trafficFlowInterval     = 0;
        this.coordinates = [point];
    }
    updateInterval(){ 
        this.trafficFlowInterval = millis() + 3000;
    }
    draw(){
        for( let point of this.coordinates){
            drawTrafficLight(point);
        }
    }
    changeCurrentInput(){
        for(let point of this.coordinates){
            point.changeCurrentInput();
        }
    }
}
function removeTrafficLight(list, point){//O(2 * traffic elements)
    point.trafficInputDirections = undefined;
    let pointIndex = -1;
    let i = list.find(TController => {  
        pointIndex = TController.coordinates.find(point)
        return pointIndex != -1;

    })
    if(i != -1){
        list[i].coodrniates.splice(pointIndex, 1);
        if(list[i].coordinates.length == 0){ //remove empty traffic controllers
            list.splice(i, 1);
        }
    }
        
}
function addTrafficLight(list, point){//O(neightbors + number of Traffic light elements) == O( 4 + number of Traffic light elements)
    let neighbors = getNeighbors(point);
    let adjacentTrfficLight = -1;
    for(let neighbor of neighbors){
        if(neighbor.elem == "T"){
            adjacentTrfficLight = neighbor;
            break;
        }
    }
    if(adjacentTrfficLight != -1){
        let i = list.findIndex(TController => {  
            let j = TController.coordinates.find(elem =>{elem ==adjacentTrfficLight})
            return j != -1;
        })
        point.addTrafficLightProperties();
        correctFlow(point,adjacentTrfficLight);

        list[i].coordinates.push(point);
    }else{
        let trafficController = new TrafficLightController(point);
        list.push(trafficController);
    }
}
function drawTrafficLight(point){
    strokeWeight(1);
    if(point.elem !== 'T') return;
    let drawUp    = point => triangle(point.x * divisor + 4 , point.y * divisor + 4 , point.x * divisor  + 9.5, point.y * divisor + 10, point.x * divisor + 15, point.y * divisor + 4 );
    let drawLeft  = point => triangle(point.x * divisor + 4 , point.y * divisor + 4 , point.x * divisor  + 9.5, point.y * divisor + 10, point.x * divisor + 4 , point.y * divisor + 15);
    let drawRight = point => triangle(point.x * divisor + 15, point.y * divisor + 4 , point.x * divisor  + 9.5, point.y * divisor + 10, point.x * divisor + 15, point.y * divisor + 15);
    let drawDown  = point => triangle(point.x * divisor + 4 , point.y * divisor + 15, point.x * divisor  + 9.5, point.y * divisor + 10, point.x * divisor + 15, point.y * divisor + 15);
    push();
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
    pop();
  }

//checking if the new traffic light flows in the opposite direction of its neighbor
function correctFlow(point1, point2){
    let dirs = Object.keys(point1);
    for(let dir of dirs){
        if(point1.trafficInputDirections[dir] != point1.trafficInputDirections[dir]){
            let oppositeDir = getOppositeDirection(dir);
            if(point1.trafficInputDirections[oppositeDir] || point1.trafficInputDirections[oppositeDir]){
                point2.currentInput = oppositeDir;
                break;
            }

        }
    }
    point2.currentInput = point1.currentInput;
}