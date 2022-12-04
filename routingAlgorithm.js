const UNEXPLORED = undefined;
const VISITED     = "VISITED";

//Time complexity O(4v * 4e), where v is the number of connected vertices and e is the sum v's edges;
function CreateRoutesToExit(exit){
    let vertices = [];
    getConnectedVertices(exit.parentTrafficLight, vertices);
    exit.parentTrafficLight.routableExits.push({exit:exit, outgoingEdge: exit.parentEdge});
    console.log(vertices);
    removeIncomingEdgesLabels(vertices);//remove all the labels that were added from getConnectedVertices()
    for(let vertex of vertices){
        createRoute(vertex, exit);//all conntected vertices also lead to this exit
    }
    console.log(vertices);
    removeOutgoingEdgesLabels(vertices);
    // printRoutableExits(vertices);
}
function printRoutableExits(vertices){
    for(let v of vertices){
        for(let exit of v.routableExits){
            console.log("V:", v.x+"-"+v.y, "Exit:", exit);
        }
    }
}
//performs a breadth-first search to notify all connected vertices about the exit
function createRoute(vertex, exit){
    let nextVertices = [];//acts like a queue in this context.
    nextVertices.push(vertex);

    while(nextVertices.length != 0){
        let v = nextVertices.shift();
        for(let edge of v.outgoingEdges){
            if(edge.label == UNEXPLORED){
                edge.label = VISITED;
                let oppositeVertex = edge.endVertex;
                if(oppositeVertex.label == UNEXPLORED){
                    //oppositeVertex.label = VISITED;
                    v.routableExits.push({exit: exit, outgoingEdge:edge.outgoingEdge});
                    nextVertices.push(oppositeVertex);
                }
            }
            edge.label = VISITED;
        }
    }    
}
//can be more efficent with a better data structure for the traffic lights
//returns a subgraph of all the connected traffic lights using a depth-first search 
function getConnectedVertices(vertex, subgraph){
    vertex.label = VISITED;
    subgraph.push(vertex);
    for(let edge of vertex.incomingEdges){
        
        //undefined == unexplored
        if(edge.label == UNEXPLORED){
            let oppositeVertex = edge.endVertex;
            
            if(oppositeVertex.label == UNEXPLORED){
                getConnectedVertices(oppositeVertex, subgraph);
            }
            edge.label = VISITED;
        }
            
    }
}
function removeIncomingEdgesLabels(vertices){
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
function setEdgeLabels(vertices, label){
    for(let vertex of vertices){
        for(edge in vertex.outgoingEdges){
            edge.label = label
        }
    }
}