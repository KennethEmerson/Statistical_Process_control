//##############################################################################
// sensorsimulator.js is a NODE js program which creates a websocket server
// and streams simulated sensordata over the socket.
// The simulated data can be created using a normal or universal distribution.
// The websocket serve can also receive a message containing new parameter
// settings for the simulation of the sensordata.
//
// to start the application typ "node -r esm sensorsimulator.js" in terminal
//##############################################################################

import { Observable, Subscriber, interval } from "rxjs";
import fs from 'fs';
import WebSocket from 'ws'


//------------------------------------------------------------------------------
// normalDistrRandom: returns a random value using a normal distribution
//                    with given mean and std.
//                    The function uses the Box-Muller transform as a random
//                    sampling method
//------------------------------------------------------------------------------

function normalDistrRandom (mean,stdDev) {
  let u = 0, v = 0;
  while(u === 0) u = Math.random(); 
  while(v === 0) v = Math.random();
  return Math.sqrt(-2*Math.log(u))*Math.cos(2*Math.PI*v)*stdDev+mean
}

//------------------------------------------------------------------------------
// uniformDistrRandom: returns a random value using a universal distribution
//                    with given mean and range.
//------------------------------------------------------------------------------

function uniformDistrRandom (mean,range) {
  var min = mean - (range/2);
  var max = mean + (range/2);
  return Math.random() * (max - min + 1) + min;
}

//------------------------------------------------------------------------------
// createMeasurementMsg: creates a JSON string with the simulated sensorvalue, 
//                       timestamp and unit
//------------------------------------------------------------------------------

function createMeasurementMsg(){
  var msg = {
    type: "measurement",
    timestamp: Date.now(),
    value: distribution(mean,range),
    unit: "kg"
  };
  console.log(msg.value);
  //filestream.write(msg.value.toString()+";")
  return JSON.stringify(msg);
};

//------------------------------------------------------------------------------
// createParameterMsg: creates a JSON string with the simulated sensorvalue, 
//                     timestamp and unit
//------------------------------------------------------------------------------

function createParameterMsg(mean,range,distributionName){
  var msg = {
    type: "parameters",
    mean: mean,
    range: range,
    distribution: distributionName
  };
  return JSON.stringify(msg);
};


//------------------------------------------------------------------------------
// updateParameters: receives a JSON object from the websocket
//------------------------------------------------------------------------------

function updateParameters(emitter,message){
  // check if message contains the correct keys
  if(message.hasOwnProperty("mean") && message.hasOwnProperty("range") && message.hasOwnProperty("type")){
    mean = message.mean;
    range = message.range;
    if(message.type === "gaussian"){
      distribution = normalDistrRandom;
      distributionName = "gaussian"
     }
    else {
      distribution = uniformDistrRandom;
      distributionName = "uniform"
    };
    //resubscribe to interval emmitter
    
    console.log("new settings set (distribution:",message.type,",mean:",mean,",std/range:",range,")")
    emitter.unsubscribe();
    sockets.forEach(s=>s.send(createParameterMsg(mean,range,distributionName)))
    return pulseGenerator.subscribe(x => sockets.forEach(s => s.send(createMeasurementMsg())));
  }
  else {
    console.log("an incorrect message was received and is therefore ignored")
  }
}

//------------------------------------------------------------------------------
// main program: 
//------------------------------------------------------------------------------


const server = new WebSocket.Server({port: 8080});
var mean = 4;
var range = 2;
var distribution = normalDistrRandom;
var distributionName = "gaussian";

//create an empty list of websocket clients
let sockets = [];

//when client requests connection
server.on('connection', function(socket) {
  
  //push the new websocketclient to the list
  sockets.push(socket);
  console.log("new connection made")
  socket.send(createParameterMsg(mean,range,distributionName))
  //when a message from the client is received, update the parameters
  socket.on('message', function(message) {
                        try{
                          console.log("parameter message received: ", message)  
                          emitter = updateParameters(emitter,JSON.parse(message));
                           }
                        catch(err) {
                            console.log("an incorrect message was received and is therefore ignored")
                          }});      //
  
  //delete socket from socketlist when connection is closed
  socket.on('close', function() {sockets = sockets.filter(s => s !== socket);});  
});

//create the observable which emits every 2 seconds
const pulseGenerator = interval(1000);
// subscribe to the pulsgenerator
var emitter = pulseGenerator.subscribe(x => sockets.forEach(s => s.send(createMeasurementMsg())));
//var filestream = fs.createWriteStream("sensorlog.txt");
