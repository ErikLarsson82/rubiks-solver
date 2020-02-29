
var margin = {top: 20, right: 20, bottom: 60, left: 40},
    width = 600 - margin.left - margin.right,
    height = 300 - margin.top - margin.bottom;

// ---------------------------------------- Line chart ---------------------------------------- 
var svgLineChart = d3.select("#svgContainer-timeline").append("svg:svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)

var xNudge = 50;
var yNudge = 20;
var parseDate = d3.time.format("%m/%d/%Y").parse;
var minDate = new Date();
var maxDate = new Date();

function isSuccess(data) {
  return data !== -1
}

function isFailure(x) {
  return !isSuccess(x)
}

const jsonLineFilePath = 'training.json'
d3.json(`training-data/${jsonLineFilePath}`, renderLineChart)
setInterval(() => d3.json(`training-data/${jsonLineFilePath}`, renderLineChart), 500)

function renderLineChart(error, _data) {
  if (error) {
    console.error(error)
    return
  }
  svgLineChart.select("#test").remove()
  svgLineChart.select(".chartGroup").remove()
  
  svgLineChart.append("g")
    .attr("id", "test")
    .attr("transform", 
          "translate(" + margin.left + "," + margin.top + ")");

  const data = _data.fitnessSnapshots.map(x => ({ ...x, date: new Date(x.date)}))
  
  minDate = d3.min(data, d => d.date)
  maxDate = d3.max(data, d => d.date)
  
  var xScale = d3.time.scale()
      .domain([minDate,maxDate])
      .range([0, width])

  var yScale = d3.scale.linear()
      .domain([0, _data['max-fitness']])
      .range([height, 0])

  var line = d3.svg.line()
      .x(d => xScale(d.date))
      .y(d => yScale(d.fitness.filter(isSuccess).length))
      //.curve(d3.curveMonotoneX) // apply smoothing to the line

  var xAxis = d3.svg.axis()
    .scale(xScale)
    .orient("bottom")
    
  var yAxis = d3.svg.axis()
    .scale(yScale)
    .orient("left")
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
        .attr("y", 0)
        .attr("dy", "3.2em")
        .attr("dx", "24em")
        .style("text-anchor", "start")
        .text("Time")
      
    chartGroup.append("g")
      .attr("class","axis y")
      .call(yAxis)
      .append("text")
        .attr("y", 6)
        .attr("dy", "-3.8em")
        .attr("dx", "-10em")
        .style("text-anchor", "start")
        .text("Fitness")
        .attr("transform", "rotate(-90)" );

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

/*
// ---------------------------------------- Barchart ---------------------------------------- 
var x = d3.scale.ordinal().rangeRoundBands([0, width], .05);

var y = d3.scale.linear().range([height, 0]);

var xAxis = d3.svg.axis()
    .scale(x)
    .orient("bottom")

var yAxis = d3.svg.axis()
    .scale(y)
    .orient("left")
    .ticks(10);

var svgBarchart = d3.select("#svgContainer-barchart").append("svg:svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
  .append("g")
    .attr("transform", 
          "translate(" + margin.left + "," + margin.top + ")");

const urlParams = new URLSearchParams(location.search);
const jsonFilePath = urlParams.get('file')

if (false && jsonFilePath === null) {
  document.body.innerHTML = "Add JSON file path to url as query string parameter ?file=stats.json"
} else if (false) {

  d3.json(`training-data/${jsonFilePath}`, function(error, data) {

    const successes = data.results.filter(isSuccess).length
    const failures = data.results.filter(isFailure).length
    const total = data.results.length
    const successRate = 100 / (total / successes)

    x.domain(["success", "failure"])
    y.domain([0, total]);

    const dataAggregate = [
      {
        type: "success",
        amount: successes
      },
      {
        type: "failure",
        amount: failures
      }
    ]

    svgBarchart.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(0," + height + ")")
        .call(xAxis)
      .selectAll("text")
        .style("text-anchor", "center")
        .attr("dy", "2em")

    svgBarchart.append("g")
        .attr("class", "y axis")
        .call(yAxis)
      .append("text")
        .attr("y", 6)
        .attr("dy", "-3.8em")
        .attr("dx", "-10em")
        .style("text-anchor", "start")
        .text("Amount")
        .attr("transform", "rotate(-90)" );


    svgBarchart.selectAll("bar")
        .data(dataAggregate)
      .enter().append("rect")
        .style("fill", "steelblue")
        .attr("x", ({ type }) => x(type))
        .attr("width", x.rangeBand())
        .attr("y", ({ amount}) => y(amount))
        .attr("height", ({ amount }) => height - y(amount))


    document.getElementById("successRate").innerHTML = `Success rate ${successRate}%`
    
  })
  
}
*/
