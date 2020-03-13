
const AUTO_UPDATE = false

var margin = {top: 20, right: 20, bottom: 60, left: 40},
    width = 600 - margin.left - margin.right,
    height = 300 - margin.top - margin.bottom;

// ---------------------------------------- Line chart ---------------------------------------- 
var svgLineChart = d3.select("#svgContainer-timeline").append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)

var xNudge = 50;
var yNudge = 20;
var minDate = new Date();
var maxDate = new Date();

function isSuccess(data) {
  return data !== -1
}

function isFailure(x) {
  return !isSuccess(x)
}

const jsonLineFilePath = 'training.json'
d3.json(`training-data/${jsonLineFilePath}`).then(renderLineChart)
if (AUTO_UPDATE) {
  setInterval(() => d3.json(`training-data/${jsonLineFilePath}`).then(renderLineChart), 500) 
}

function renderLineChart(_data) {
  
  document.getElementById('net-svg').innerHTML = brain.utilities.toSVG(_data.net)

  svgLineChart.select(".chartGroup").remove()
  
  const data = _data.fitnessSnapshots.map(x => ({ ...x, date: new Date(x.date)}))
  
  minDate = d3.min(data, d => d.date)
  maxDate = d3.max(data, d => d.date)
  
  var xScale = d3.scaleTime()
      .domain([minDate,maxDate])
      .range([0, width])

  var yScale = d3.scaleLinear()
      .domain([0, _data['max-fitness']])
      .range([height, 0])

  var line = d3.line()
      .x(d => xScale(d.date))
      .y(d => yScale(d.fitness.filter(isSuccess).length))
      .curve(d3.curveMonotoneX)

  var xAxis = d3.axisBottom()
    .scale(xScale)
    
  var yAxis = d3.axisLeft()
    .scale(yScale)
    .ticks(10);

    var chartGroup = svgLineChart.append("g").attr("class","chartGroup").attr("transform","translate("+xNudge+","+yNudge+")");
    
    chartGroup.append("path")
      .attr("class","line")
      .attr("d",function(d){ return line(data); })    

    chartGroup.append("g")
      .attr("class","axis x")
      .attr("transform","translate(0,"+height+")")
      .call(xAxis)
      .append("text")
        .attr("x", 0)
        .attr("y", 0)
        .attr("dy", "2.5em")
        .attr("dx", "0em")
        .attr("fill", "#e1167c")
        .attr("font-size", "16px")
        .style("text-anchor", "start")
        .text(() => "Time")
      
    chartGroup.append("g")
      .attr("class","axis y")
      .call(yAxis)
      .append("text")
        .attr("x", 0)
        .attr("y", 0)
        .attr("dy", "-1.5em")
        .attr("dx", "-14em")
        .attr("transform", "rotate(-90)" )
        .attr("fill", "#e1167c")
        .attr("font-size", "16px")
        .style("text-anchor", "start")
        .text(() => "Fitness")

    document.getElementById("status").innerHTML = `Status: ${_data.training ? `Training network${new Array(Math.floor(Math.random()*4)).fill(".").join("")}` : 'Training complete'}`
    document.getElementById("status").className = _data.training ? 'blink' : 'green'

    const flatFitness = data.flatMap(x => x.fitness)
    const successes = flatFitness.filter(isSuccess).length
    const total = flatFitness.length
    const failures = total - successes
    const successRate = 100 / (total / successes)
    const finalIteration = (100 * (data[data.length-1].fitness.filter(isSuccess).length / _data['max-fitness']))
    document.getElementById("successRate").innerHTML = `Total success rate ${successRate.toFixed(2)}% - Last iteration ${finalIteration === 100 ? 100 : finalIteration.toFixed(1)}%`

    let b = []
    const config = _data["hyper-parameters"]["BRAIN_CONFIG"]
    for (var p in config) {
      b.push(`&nbsp;&nbsp;&nbsp;${p}: ${config[p]}<br>`)
    }
    document.getElementById("hyper").innerHTML = 
`<strong>Hyper-parameters:</strong><br>
Move limit: ${_data["hyper-parameters"].MOVES}<br>
Iterations: ${_data["hyper-parameters"].ITERATIONS}<br>
Exploration rate: ${_data["hyper-parameters"]["EXPLORATION_RATE"]}<br>
Brain.js parameters: <br>${b}<br>
`
}
