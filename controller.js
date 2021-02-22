
//##############################################################################
// loading controller.js will start the application by initializing the socket 
// subject, creating the subscriptions to the websocket and the submitbutton
//  and creating both graph objects 
//##############################################################################

// create objects of graphs
var xChart = createXChart(getXChartFromGui());
var rChart = createRChart(getRChartFromGui());

//create an event observable on the submitbutton  
const submitEvent = createSubmitEvent(getsubmitObject());

//create a websocket subject using RXJS and create the subscriptions to the socket
// and the submit button event observable
try {
  const socket = createSocket("ws://localhost:8080");
  subscribeToSocket(socket,submitEvent,xChart,rChart);
  subscribeToSubmit(submitEvent,socket);
}
//if the connection failed the connectionLost function is triggered
catch(err) {
  connectionLost()
}






