var margin = {top: 20, right: 20, bottom: 60, left: 40},
    width = 600 - margin.left - margin.right,
    height = 300 - margin.top - margin.bottom;

// ---------------------------------------- Line chart ---------------------------------------- 
var svgLineChart = d3.select("#svgContainer-timeline").append("svg:svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
  .append("g")
    .attr("transform", 
          "translate(" + margin.left + "," + margin.top + ")");


var xNudge = 50;
var yNudge = 20;
var parseDate = d3.time.format("%m/%d/%Y").parse;
var minDate = new Date();
var maxDate = new Date();

const jsonLineFilePath = 'test.json'
d3.json(`training-data/${jsonLineFilePath}`, function(error, data) {

  data = data.map(x => ({ ...x, date: parseDate(x.date)}))
  
  minDate = d3.min(data, d => d.date)
  maxDate = d3.max(data, d => d.date)
  const max = d3.max(data, d => d.fitness)

  var xScale = d3.time.scale()
      .domain([minDate,maxDate])
      .range([0, width])

  var yScale = d3.scale.linear()
      .domain([0, max])
      .range([height, 0])

  var line = d3.svg.line()
      .x(function(d, i) { return xScale(d.date); })
      .y(function(d) { return yScale(d.fitness); })
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
      .call(xAxis);
      
    chartGroup.append("g")
      .attr("class","axis y")
      .call(yAxis);
})

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

function isSuccess({ moves }) {
  return moves !== -1
}

function isFailure(x) {
  return !isSuccess(x)
}

if (jsonFilePath === null) {
  document.body.innerHTML = "Add JSON file path to url as query string parameter ?file=stats.json"
} else {

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

    document.getElementById("hyper").innerHTML = 
`<strong>Hyper-parameters:</strong><br>
Move limit: ${data["hyper-parameters"].MOVES}<br>
Iterations: ${data["hyper-parameters"].ITERATIONS}<br>
Amount of Q-Tables trained: ${data["hyper-parameters"].TABLES}<br>
Exploration rate: ${data["hyper-parameters"]["EXPLORATION_RATE"]}<br>
Exploration drop-off: ${data["hyper-parameters"]["EXPLORATION_DROPOFF"]}<br>

`
  })
  
}
