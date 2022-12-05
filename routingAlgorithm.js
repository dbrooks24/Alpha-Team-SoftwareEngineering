const UNEXPLORED = undefined;
const VISITED     = "VISITED";

//Time complexity O(2e), where e is the number of edges in the subgraph;
function CreateRoutesToExit(exit){
    let vertices = [];
    createRoute(exit.parentVertex, exit, vertices);
    exit.parentVertex.routableExits.push({exit:exit, outgoingEdge: exit.parentEdge});
    console.log(vertices);
    removeLabels(vertices);//remove all the labels that were added from getConnectedVertices()
}
function createRoute(vertex, exit, subgraph){
    console.log(vertex);
    vertex.label = VISITED;
    subgraph.push(vertex);
    for(let edge of vertex.incomingEdges){
        if(edge.label == UNEXPLORED){
            edge.label = VISITED;
            let oppositeVertex = edge.endVertex;
            oppositeVertex.routableExits.push({exit: exit, outgoingEdge:edge.outgoingEdge});
            if(oppositeVertex.label == UNEXPLORED){
                oppositeVertex.label = VISITED;
                createRoute(oppositeVertex,exit, subgraph);
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
function isASplittingRoad(point){
    if(point.elem == "T")return false;//Traffic lights are not to be considered
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
//INPUTS: the coodinate, traffic light or splitting road, to add the vertex properties to.
//        the road directly before this one
function addVertexProperties(point, prev){
    point.outgoingEdges = [];
    point.incomingEdges = [];
    point.routableExits = [];

    //update parent vertex about the new vertex
    let p = point.parentVertex;
    if(p != undefined){//update parent when a vertex light is made. if the parentVertex exists.
      //directed graph
      grid[p.x][p.y].outgoingEdges.push({endVertex: point, outgoingEdge: point.parentEdge})//outgoingEdge == a direction.
      point.incomingEdges.push({endVertex: p, outgoingEdge: point.parentEdge});//used to back track the parent vertices
    }
    if(prev != undefined){//splitting roads do not have a prev edge
        let prevP = prev.parentVertex;
        if(prevP != undefined){//if the previous point has a a parent then notify its parent about the new vertex
            grid[prevP.x][prevP.y].outgoingEdges.push({endVertex: point, outgoingEdge: prev.parentEdge});
            point.incomingEdges.push({endVertex: prevP, outgoingEdge: prev.parentEdge});//used to back track the parent vertices
        }  
    }

    //vertices do not have parent vertices
    point.parentVertex = point;         
    point.parentEdge = undefined;
}

// function printRoutableExits(vertices){
//     for(let v of vertices){
//         for(let exit of v.routableExits){
//             console.log("V:", v.x+"-"+v.y, "Exit:", exit);
//         }
//     }
// }