//##############################################################################
// model.js contains all the functions for connecting to the websocket,
// calculate the values to display and creating relevant RXJS obervable
//##############################################################################

const {fromEvent} = rxjs
const { bufferCount, reduce, catchError, filter, takeUntil} = rxjs.operators;
const { WebSocketSubject, webSocket } = rxjs.webSocket;

//------------------------------------------------------------------------------
// getActualValues: receives JSON message with values, prepares the data 
//                  and returns a JS object with the modified values
//------------------------------------------------------------------------------

function getActualValues(message){
  var actualValue= {
    //converts JS date object to a timestring 
    timestamp: (new Date(message.timestamp)).toLocaleTimeString('en-GB'),
    //rounds the received value to 3 decimals
    value: Math.round(message.value * 1000) / 1000,
    unit: message.unit
  };
  return actualValue;
}

//------------------------------------------------------------------------------
// getCalculatedValues: receives array with JSON messages from the buffer
//                      containing the actual values and calculates the average, 
//                      range,... and subsequently
//                      returns a JS object with the modified values
//------------------------------------------------------------------------------

function getCalculatedValues(buffer){
  console.log(buffer);
  var initValue = buffer[0].value;
  var calculatedValues= {
    //converts JS date object to a timestring 
    timestamp: (new Date(buffer[buffer.length-1].timestamp)).toLocaleTimeString('en-GB'),
    unit: buffer[buffer.length-1].unit,
    //calculate the average of the buffer array received and rounds it to 3 decimals
    average: Math.round(buffer.reduce((acc,curr) =>acc + curr.value,0)*1000/buffer.length)/1000,
    // calculate the range of the buffer array received and rounds it to 3 decimals
    range: Math.round(Math.abs(
                      buffer.reduce((acc,curr) => Math.max(acc,curr.value),initValue) - 
                      buffer.reduce((acc,curr) => Math.min(acc,curr.value),initValue))*1000)/1000
  };
  return calculatedValues;
}

//------------------------------------------------------------------------------
// receiveMessage: checks if the received JSON object is a "measurement" message
//                 or a "parameter" message and sends the object to the correct function
//------------------------------------------------------------------------------

function receiveMessage(message){
  if(message.hasOwnProperty("type")){
    if(message.type == "measurement"){updateActualValuesOnPage(getActualValues(message))}
    if(message.type == "parameters"){
      updateParametersToGui(message)
    }
  }
}

//------------------------------------------------------------------------------
// create_msg_to_simulator: create JSON object with new mean, range and expected
//                          sample distribution 
//------------------------------------------------------------------------------

function createMsgToSimulator(){ 
  var msg = {
    mean: getMeanFromGui(),
    range: getRangeFromGui(),
    type: getDistrTypeFromGui()
  };
  return msg;
};

//------------------------------------------------------------------------------
// createSocket: create a new RXJS websocket subject and returns it
//------------------------------------------------------------------------------

function createSocket(adress){
  const socket = webSocket(adress);
  return socket;
}

//------------------------------------------------------------------------------
// createSubmitEvent: returns an event observable for a html DOM button object
//------------------------------------------------------------------------------

function createSubmitEvent(submitObject){
  return fromEvent(submitObject,'click');
}

//------------------------------------------------------------------------------
// subscribeToSocket: subscribes the relevant obervers to the connected socket.                     
//------------------------------------------------------------------------------

function subscribeToSocket(socket, submitEvent,xChart, rChart){
  //gets the required buffersize from the GUI
  var clustersize = getBufferSizeFromGui();
  
  //subscribes to the socket and sends the message to the receivedMessage function
  //the subscription will end when the submitevent is triggered. This will result in a reset of the charts
  socket.pipe(takeUntil(submitEvent)).subscribe(message=>receiveMessage(message),
                      err => {}, 
                      () => {resetChart(xChart);resetChart(rChart);});

  //subscribes to the socket, filter out all "measurement" messages and creates a buffer 
  //which will broadcast an array with "clustersize" elements 
  //when submitevent is triggered the subscription will automattically resubscribe with the actual buffersize
  // when the socket connection is lost the connectionLost function will be triggered
  socket.pipe(takeUntil(submitEvent),
              filter(message => message.type=="measurement"),
              bufferCount(clustersize,clustersize)).subscribe(
                        message=>updateCalculateValuesOnPage(getCalculatedValues(message), xChart, rChart),
                        err => connectionLost(), 
                        () => subscribeToSocket(socket, submitEvent,xChart, rChart));
}

//------------------------------------------------------------------------------
// subscribeToSubmit: creates a subscription to a given event observable
//                    the subscription will when triggered, send the current
//                    parameters from the GUI to the simulator
//------------------------------------------------------------------------------

function subscribeToSubmit(submitEvent,socket){
  submitEvent.subscribe(event => socket.next(createMsgToSimulator(getMeanFromGui(),getRangeFromGui(),getDistrTypeFromGui())));
}


