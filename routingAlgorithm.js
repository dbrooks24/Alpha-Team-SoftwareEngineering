const UNEXPLORED = undefined;
const VISITED     = "VISITED";

//Time complexity O(2e), where e is the number of edges in the subgraph;
function CreateRoutesToExit(exit){
    let vertices = [];
    let dist = exit.distanceFromParent;
    exit.parentVertex.routableExits.push({exit:exit, outgoingEdge: exit.parentEdge, distanceFromExit: dist});
    createRoute(exit.parentVertex, exit, vertices,  dist);
    console.log("connected subgraph: ",  vertices);

    removeLabels(vertices);//remove all the labels that were added from createRoute()
}

//Deth-first search to get the connected directed graph that leeds to this exit
function createRoute(vertex, exit, subgraph, distanceToExit){
    if(vertex.incomingEdges == undefined) return;
    vertex.label = VISITED;

    subgraph.push(vertex);
    for(let edge of vertex.incomingEdges){
        if(edge.label == UNEXPLORED){
            edge.label = VISITED;
            let oppositeVertex = edge.endVertex;
            if(!isVertex(oppositeVertex)) continue;
            let dist = edge.distanceFromEndVertex + distanceToExit;
            oppositeVertex.routableExits.push({exit: exit, outgoingEdge:edge.outgoingEdge, distanceFromExit: dist});
            if(oppositeVertex.label == UNEXPLORED){
                oppositeVertex.label = VISITED;
                createRoute(oppositeVertex,exit, subgraph, dist);
            }
        }
            
    }
}
function removeLabels(vertices){
    for(let vertex of vertices){
        vertex.label = undefined;
        for(let edge of vertex.incomingEdges){
            edge.label = undefined;
        }
    }

}
function removeOutgoingEdgesLabels(vertices){
    for(let vertex of vertices){
        vertex.label = undefined;
        for(let edge of vertex.outgoingEdges){
            edge.label = undefined;
        }
    }

}
//a splitting road is a road tile that leeer
function isASplittingRoad(point){
    if(point.elem == "T" || point == undefined)return false;//Traffic lights are not to be considered
    let isSplitting = false;    
    let count = 0;
    for(let dir of Object.values(point.direction)){
        if(dir) ++count;
        if(count >= 2){
            isSplitting = true;
            break;
        }
    }
    return isSplitting;
}
function getParentEdge(initial, current){
  if(current.x == initial.x -1)  return 'left';
  if(current.x == initial.x + 1) return 'right';
  if(current.y == initial.y - 1) return 'up';
  if(current.y == initial.y + 1) return 'down';
}
//INPUTS: the coodinate, traffic light or splitting road, to add the vertex properties to.
//        the road directly before this one
function addVertexProperties(point, prev){
    if(point.outgoingEdges == undefined) point.outgoingEdges = [];
    if(point.incomingEdges == undefined) point.incomingEdges = [];
    if(point.routableExits == undefined) point.routableExits = [];

    //update parent vertex about the new vertex  
    //not needed for branching roads
    let p = point.parentVertex;
    if(p != undefined  && p != point){//update parent when a vertex light is made. if the parentVertex exists.
      //directed graph
      grid[p.x][p.y].outgoingEdges.push({endVertex: point, outgoingEdge:point.parentEdge, distanceFromEndVertex: point.distanceFromParent})//outgoingEdge == a direction.
      point.incomingEdges.push({endVertex: p, outgoingEdge: point.parentEdge, distanceFromEndVertex: point.distanceFromParent});//used to back track the parent vertices
    }
    if(prev != undefined ){//splitting roads do not have a prev edge
        let newEdge = prev.parentEdge;
        if(isVertex(prev)){
          newEdge = getParentEdge(prev, point);//since parentEdge is undefined for vertices or stores a temporary value
        }
        let prevP = prev.parentVertex;
        if(prevP != undefined){//if the previous point has a a parent then notify its parent about the new vertex
            grid[prevP.x][prevP.y].outgoingEdges.push({endVertex: point, outgoingEdge: newEdge,distanceFromEndVertex: prev.distanceFromParent});
            point.incomingEdges.push({endVertex: prevP, outgoingEdge:newEdge, distanceFromEndVertex: prev.distanceFromParent});//used to back track the parent vertices
        }  
    }
    //vertices do not have parent vertices
    point.parentVertex = point;         
    point.parentEdge = undefined;
    //point.distanceFromEndVertex = 0;
    point.distanceFromParent = 1;
}
function removeVertexProperties(point){
    point.incomingEdges = undefined;
    point.outogoingEdges = undefined;
    point.routableExits = undefined;

}
//get the other edge that doesn't lead to the neighbor
function getOtherEdge(point, neighbor){
    let newParentEdge;
    for(const [dir , value] of Object.entries(point.direction)){
        if(value){
            let n = point.seeNeighbor(dir);
            if(n.x != neighbor.x  && n.y != neighbor.y){
                newParentEdge = dir;
            }
        }
    }
    return newParentEdge;
}
//MUST BE CALLED BEFORE POINT'S PARENT VERTEX VARIABLE IS UPDATED
//handling merging points. When a new traffic light merges into a road, update all the srounding road tiles about the new parent vertex, and parent edge
function handleMerge(point, neighbor){
    updateAllOutGoingEdges(point);
    
    //handling routable exits
    if(point.elem == "SV" || point.elem == "T"){
        let pv = point.parentVertex;//get the nearest vertex along this directed subgraph
                                            //niehgbor here is the previous road tile
        let allExits = pv.routableExits;
        if(allExits == undefined) return;
        let routableExits = [];
        if(point.parentEdge != undefined){// is not a vertex
            allExits.forEach(exit => {if(exit.outgoingEdge == point.parentEdge) routableExits.push(exit)})
        }else{//is a vertex
            routableExits = allExits;
        }
        routableExits = routableExits.slice();
                (point, neighbor, routableExits);//slice returns a copy, if not used, it will result in an infinite loop.
    }else if(point.elem == "SR"){//this new vertex now leeds to all the routable exits the parent Vertex leads to
        
        //new SR elements will only have two outgoing edges one that leeds to the neighbor and one that was there before merging
        //the edge that leeds to the routable exits is the edge that doesn't leed to the newly created neighbor
        let newParentEdge = getOtherEdge(point, neighbor);

        if(point.routableExits == undefined) point.routableExits = [];
        let pv = point.parentVertex;
        if(!isVertex(pv)) return;//dealing with loops
        //update outgoing edges
        let i = grid[pv.x][pv.y].outgoingEdges.findIndex(edge => edge.outgoingEdge == point.parentEdge);
        if(i != -1){
            
            if(point.outgoingEdge  == undefined) point.outgoingEdges = [];
            let d = grid[pv.x][pv.y].outgoingEdges[i].distanceFromParent - point.distanceFromParent;
            point.outgoingEdges.push({endVertex: pv, outgoingEdge: newParentEdge, distanceFromEndVertex: d});
            grid[pv.x][pv.y].outgoingEdges.splice(i, 1);
        }
        //update routable exits
        for(let exit of pv.routableExits){
            let d = exit.distanceFromExit - point.distanceFromParent;
            point.routableExits.push({exit: exit.exit, outgoingEdge: newParentEdge, distanceFromExit: d});
        }
    }
}
function BoradcastRoutableExitsToAllParents(point, prev, routableExits){
    if(point == undefined) return;
    let vertices = [];
    let parent = prev.parentVertex;
    for(let exit of routableExits){
        let dist = exit.distanceFromExit - point.distanceFromParent;
        let newEdge; for(let dir in point.direction){ if (point.direction[dir]){newEdge = dir;break;}}
        if(newEdge == undefined) newEdge = getParentEdge(prev, point);
        if(point.routableExits== undefined){//is a new vertex
            point.routableExits = [];
            point.routableExits.push({exit:exit.exit, outgoingEdge: newEdge, distanceFromExit: dist});//point at this point is not a vertex yet and cannot be passed to createRoute
        }
        let prevParentEdge = prev.parentEdge == undefined? getParentEdge(prev, point): prev.parentEdge;
        grid[parent.x][parent.y].routableExits.push({exit:exit.exit, outgoingEdge: prevParentEdge});
        createRoute(prev.parentVertex, exit.exit, vertices, dist);
        removeLabels(vertices);
    }
}
function updateAllOutGoingEdges(point){
    //no need to label items since it finds the nearest vertex and stops
    //let neighboringRoads = [];
    let oldParentVertex = point.parentVertex;

    //point.incomingEdges.push({endVertex:point.parentVertex, outgoingEdge:})
    for(let dir in point.direction){
        if(point.direction[dir]){
            let neighbor = point.seeNeighbor(dir);
            let newParentEdge = getParentEdge(point, neighbor);
            updateRoadTileParent(neighbor, point, newParentEdge, oldParentVertex, 1);
        }
    }
}
//Depth-first search
function updateRoadTileParent(point, newParentVertex, newParentEdge, oldParentVertex, prevDistanceFromParent){
    if(point.elem == "T" || point.elem == "SR" || point.elem == "SV"){
        updateVertexEdge(point, newParentVertex, newParentEdge, oldParentVertex);
        return;
    }
    point.parentEdge   = newParentEdge;
    point.parentVertex = newParentVertex;
    point.distanceFromParent = prevDistanceFromParent + 1;
    for(let dir in point.direction){
        if(point.direction[dir]){
            
            let neighbor = point.seeNeighbor(dir);
            
            updateRoadTileParent(neighbor, newParentVertex, newParentEdge, oldParentVertex, point.distanceFromParent);
        }
    }
}
//neighboring road is the road tile that lead to this Vertex
function updateVertexEdge(currentVertex, newParentVertex, newParentEdge, oldParentVertex){
    if(oldParentVertex == undefined  || currentVertex == undefined || newParentEdge == undefined || newParentVertex == undefined) return;
    if(currentVertex.incomingEdges == undefined) return;
    let index = currentVertex.incomingEdges.findIndex( edge => (edge.endVertex.x == oldParentVertex.x) && (edge.endVertex.y == oldParentVertex.y) && edge.outgoingEdge != undefined);
    if(index == -1) return;
    currentVertex.incomingEdges[index].endVertex = newParentVertex;
    currentVertex.incomingEdges[index].outgoingEdge = newParentEdge;

    //not sure if I can manipulate it directly without using the gird
    index = grid[oldParentVertex.x][oldParentVertex.y].outgoingEdges.findIndex( edge => edge.endVertex == currentVertex);
     //no need to update the currentVertex.incomingEdges[i].outgoingEdge. it is the same
    if(index != -1){
        grid[oldParentVertex.x][oldParentVertex.y].outgoingEdges[index].endVertex = currentVertex;
    }
    let routableExits = [];
    // console.log("new parent", newParentVertex);
    // console.log("old", oldParentVertex)
    // if(newParentVertex.parentVertex != undefined){
    //     routableExits = newParentVertex.parentVertex.routableExits;
    // }

}
function isVertex(point){
    return point.elem == "T" || point.elem == "SR" || point.elem == "SV";
}