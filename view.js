//##############################################################################
// view.js contains all necessary functions to interact with the GUI/webpage
//##############################################################################

//------------------------------------------------------------------------------
// updateActualValuesOnPage: receives a JSON object containing the timestamp
//                           actual value and unit of the value and updates
//                           the values on the GUI accordingly
//------------------------------------------------------------------------------

function updateActualValuesOnPage(actualValue){
    document.getElementById("actualTimestamp").innerHTML = actualValue.timestamp;
    document.getElementById("actualValue").innerHTML = actualValue.value;
    document.getElementById("actualValueUnit").innerHTML = actualValue.unit;
}

//------------------------------------------------------------------------------
// updateCalculateValuesOnPage: receives a JSON object with all calculated
//                              values and the corresponding timestamp and unit
//                              and updates the values and charts on the GUI/webpage
//                              accordingly. 
//                              If the alarm values are exceeded the alarm buttons
//                              will be set.
//------------------------------------------------------------------------------

function updateCalculateValuesOnPage(calculatedValues, xChart,rChart){
  
  // get the set alarm limits grom the webpage
  var uclXChart = document.getElementById("uclXChart").value
  var lclXChart = document.getElementById("lclXChart").value
  var uclRChart = document.getElementById("uclRChart").value

  // update all values on the GUI/webpage
  document.getElementById("averageTimestamp").innerHTML = calculatedValues.timestamp;
  document.getElementById("averageValue").innerHTML = calculatedValues.average;
  document.getElementById("averageValueUnit").innerHTML = calculatedValues.unit;
  document.getElementById("rangeTimestamp").innerHTML = calculatedValues.timestamp;
  document.getElementById("rangeValue").innerHTML = calculatedValues.range;
  document.getElementById("rangeValueUnit").innerHTML = calculatedValues.unit;

  // set the alarm button if the alarm values of the X chart are exceeded
  if(uclXChart< calculatedValues.average || lclXChart > calculatedValues.average) {
    document.getElementById("limitButtonXChart").classList.remove('btn-outline-danger');
    document.getElementById("limitButtonXChart").classList.remove('disabled');
    document.getElementById("limitButtonXChart").classList.add('btn-danger');
  }
  
  // set the alarm button if the alarm value of the R chart is exceeded
  if(uclRChart< calculatedValues.range) {
    document.getElementById("limitButtonRChart").classList.remove('btn-outline-danger');
    document.getElementById("limitButtonRChart").classList.remove('disabled');
    document.getElementById("limitButtonRChart").classList.add('btn-danger');
  }
  
  //add the new calculate values as a datapoint to the charts
  addDataToChart(xChart,calculatedValues.timestamp,calculatedValues.average, uclXChart,lclXChart);
  addDataToChart(rChart,calculatedValues.timestamp,calculatedValues.range, uclRChart);

}

//------------------------------------------------------------------------------
// updateParametersToGui sets the new parameters received from the simulator
//------------------------------------------------------------------------------

function updateParametersToGui(message){
  document.getElementById("mean").value = message.mean
  document.getElementById("deviation").value = message.range
  
  if(message.distributionName == "gaussian"){
    document.getElementById("gaussian").checked = true;
    document.getElementById("uniform").checked = false;
  }
  if(message.distributionName == "uniform"){
    document.getElementById("gaussian").checked = false;
    document.getElementById("uniform").checked = true;
  }
}

//------------------------------------------------------------------------------
// resets the X chart alarm button
//------------------------------------------------------------------------------

function resetXChartAlarm(){
  document.getElementById("limitButtonXChart").classList.remove('btn-danger');
  document.getElementById("limitButtonXChart").classList.add('disabled');
  document.getElementById("limitButtonXChart").classList.add('btn-outline-danger');
}

//------------------------------------------------------------------------------
// resets the R chart alarm button
//------------------------------------------------------------------------------

function resetRChartAlarm(){
  document.getElementById("limitButtonRChart").classList.remove('btn-danger');
  document.getElementById("limitButtonRChart").classList.add('disabled');
  document.getElementById("limitButtonRChart").classList.add('btn-outline-danger');
}

//------------------------------------------------------------------------------
// opens the modal messagebox regarding the connection loss with the
// websocket server
//------------------------------------------------------------------------------

function connectionLost(){ $("#lostConnectionModal").modal();}

//------------------------------------------------------------------------------
// Get the DOM object for the submit button
//------------------------------------------------------------------------------

function getsubmitObject(){
  return document.getElementById("submit");
}

//------------------------------------------------------------------------------
// Various getter functions to retrieve values from the GUI/webpage
//------------------------------------------------------------------------------

function getXChartFromGui(){return document.getElementById('x-chart');}
function getRChartFromGui(){return document.getElementById('r-chart');}
function getBufferSizeFromGui(){return parseInt(document.getElementById("clustersize").value);}
function getMeanFromGui() {return parseInt(document.getElementById("mean").value);}
function getRangeFromGui() {return parseInt(document.getElementById("deviation").value);}
function getNbrOfDatapointsFromGui() {return parseInt(document.getElementById("datapoints").value);}
function getDistrTypeFromGui() {return document.querySelector('input[name="distribution"]:checked').value;}



