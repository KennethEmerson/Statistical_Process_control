//#################################################################################
//File contains functions to create the X-chart and R-chart object using chart.js
//and to update the data for any of both graphs.
//#################################################################################



//----------------------------------------------------------------------------------------
//function to create the X-chart object
//----------------------------------------------------------------------------------------

function createXChart(ctx) {
  return new Chart(ctx, {type: 'line',
                            data: {
                              labels: [],
                              datasets: [
                                {data: [], label: "measured", borderColor: "#000000", fill: false, lineTension: 0},
                                {data: [], label: "UCL", borderColor: "#ff0000",borderDash:[10, 10],lineTension: 0,pointRadius:0},
                                {data: [], label: "LCL", borderColor: "#ff0000",borderDash:[10, 10], lineTension: 0,pointRadius:0}]            
                            },
                            options: {
                              animation: {
                                duration: 0.8
                              },
                              title: {
                                display: false,
                                text: 'X-C chart'
                              },
                              scales: {
                                yAxes: [{
                                    ticks: {
                                        stepValue: 3,
                                    }
                                }]
                              }
                            }});
};

//----------------------------------------------------------------------------------------
//function to create the R-chart object
//----------------------------------------------------------------------------------------

function createRChart(ctx) {
  return new Chart(ctx, {type: 'line',
                            data: {
                              labels: [],
                              datasets: [
                                {data: [], label: "measured", borderColor: "#000000", fill: false, lineTension: 0},
                                {data: [], label: "UCL", borderColor: "#ff0000",borderDash:[10, 10],lineTension: 0,pointRadius:0}],      
                            },
                            options: {
                              animation: {
                                duration: 0.8
                              },
                              title: {
                                display: false,
                                text: 'X-R chart'
                              },
                              scales: {
                                yAxes: [{
                                    ticks: {
                                        min:0,
                                        stepValue: 3,
                                    }
                                }]
                              }
                            }});

};

//----------------------------------------------------------------------------------------
//function to add new data to the chart object
//----------------------------------------------------------------------------------------

function addDataToChart(chart, label, value,UCL,LCL="NaN") {
  
  //if number of datapoints is larger than given value, oldest datapoint gets removed
  while (chart.data.labels.length>=getNbrOfDatapointsFromGui()){
    chart.data.labels.shift();
    chart.data.datasets[0].data.shift();
    chart.data.datasets[1].data.shift();
    if(LCL != "NaN") {chart.data.datasets[2].data.shift()};
  }
  //ad ddatapoint to relevant datasets of the graph
  chart.data.labels.push(label);
  chart.data.datasets[0].data.push(value);
  chart.data.datasets[1].data.push(UCL);
  if(LCL != "NaN") {chart.data.datasets[2].data.push(LCL)};
  chart.update();
}

//----------------------------------------------------------------------------------------
//function to empty the charts
//----------------------------------------------------------------------------------------

function resetChart(chart){
  chart.data.labels = [];
  for (i = 0; i < chart.data.datasets.length; i++) { 
    chart.data.datasets[i].data = [];
  }
  chart.update();
}