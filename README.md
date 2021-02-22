# Statistical process control of sensor measurements through RXJS websocket streaming

This repo contains a webpage which displays two commonly used graphs in statistical process control, namely the X-chart and the R-chart. The general idea is that a stream of certain sensor values is received by the webpage through a WebSocket. The webpage will group these received values into buckets of a configurable size. For each bucket the mean value and range between the largest and smallest value is calculated. After calculation, the mean value is added to the X-chart as a new data point and the range is added to the R-chart. The use of both charts allows to monitor the stability of the given process.

The repo consists of two parts. The first part is a sensor simulator, written in Node.js, which will simulate a sensor streaming its values through the WebSocket. The second part is the SPC client which consists of a webpage with additional JavaScript functionality that will subscribe to the WebSocket, receive the sensor data and dynamically update the charts on the webpage.

To use the application, first start the sensor simulator in the terminal with the command: “node -r esm sensorsimulator.js”. After the sensor simulator is started, you can open the webpage, which will automatically connect to the sensor simulator.

If the webpage is opened before the sensor simulator is running or when the WebSocket connection is lost, the webpage will show an error message with the option to reload the page. By doing so the webpage will try to (re)establish the connection.