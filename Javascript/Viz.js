
var dimensions = ['Diabetes','RBP', 'Obesity'];
var radviz = radvizComponent()
    .config({
        el: document.querySelector('.container'),
        colorAccessor: function(d) {
            return d['Country'];
        },
        colorScale: d3.scale.category10(), //d3scale.ordinal().range([' #428bca','#f0ad4e','#5bc0de', '#d9534f', '#5cb85c']),
        dimensions: dimensions,
        size: 600,
        margin: 80,
        dotRadius: 2,
        zoomFactor: 1,
        drawLinks: false,
        useRepulsion: false,
        useTooltip: true,
        tooltipFormatter: function(d) {
                return '<h6>' +'&nbsp&nbsp&nbsp&nbsp'+ d.Country +'&nbsp&nbsp&nbsp&nbsp'+'</h6>' + 
            dimensions.map(function(dB) {
                    return;
                }).join('<br />');
        },

    });

//data variable stores the csv file
d3.csv("NCD_RisC.csv", function(datum) {     
    radviz.render(datum);  
}); 

radviz.on('dotEnter', function(d){
    renderList(d);
 
})

var renderList = function(datum) {
      d3.select('.state').text(datum.Country);
      d3.select('.year').text(datum.Year);
      d3.select('.sex').text(datum.Sex);

      //console.log(datum);

      var list = d3.select('.list-container')
          .selectAll('div.item')
          .data(dimensions);
      list.enter().append('div').classed('item', true);
      list.transition().style({
              width: function(d) {
                  return datum[d] * 100 + 'px';
              }
          })
          .text(function(d) {
              return d + ': ' + d3.format('%')(datum[d]);
          });
      
      list.exit().remove();
}
 

function getCountryChecked(){
        var checkboxes = document.getElementsByClassName('Country');
        var checkedBoxes = [];


    for (i = 0; i < checkboxes.length; i++) {

        if (checkboxes[i].checked == true)

            checkedBoxes.push(checkboxes[i].defaultValue);
    }

    return checkedBoxes;

    }

//function to get all checkedboxes for both male and female
function getGenderCheckedBoxes() {
    var genderCheckB = document.getElementsByClassName('Gender');
    var genderCheckedB = [];

    //console.log('genderCheckB', genderCheckB);
    for (i = 0; i < genderCheckB.length; i++) {
        if (genderCheckB[i].checked == true) {

            genderCheckedB.push(genderCheckB[i].defaultValue);
        }
    }
    return genderCheckedB;
}

//function to get all checkedboxes for year
function getYearCheckedBoxes(){
  var yearCheckB = document.getElementsByClassName('Year');
  var yearCheckedB = []; 

  for(i=0;i<yearCheckB.length;i++){
    if(yearCheckB[i].checked==true){
      yearCheckedB.push(yearCheckB[i].defaultValue);
    }

  }
  //console.log(yearCheckedB);
  return yearCheckedB; 
} 

function clearSVG(){
  d3.csv("NCD_RisC.csv",function(error, data){
    d3.select('svg').remove();
    radviz.render(data);
  });

}


//function for filtering using multiple data variables  e.g. gender and year
function allFilter() {
    
    d3.selectAll('.svg-container').remove();

    var countries = []; 
    countries = getCountryChecked();

    var genders = [];
    genders = getGenderCheckedBoxes();

    var years = []; 
    years = getYearCheckedBoxes();

    // set the dimensions and margins of the graph
    var margin = {top: 20, right: 50, bottom: 100, left: 50},
        width = 500 - margin.left - margin.right,
        height = 500 - margin.top - margin.bottom;

    // parse the date / time
    var parseDate = d3.time.format('%Y').parse;
    var formatPercent = d3.format(".0%");

    // Set the ranges
    var x = d3.time.scale().range([0, width]);
    var y = d3.scale.linear().range([height, 0]);

    // Define the axes
    var xAxis = d3.svg.axis().scale(x)
        .orient("bottom").ticks(5);

    var yAxis = d3.svg.axis().scale(y)
        .orient("left").ticks(5).tickFormat(formatPercent);
;

    // define the 1st line
    var countryLine = d3.svg.line()
        .x(function(d) { return x(d.Year); })
        .y(function(d) { return y(d.Obesity); });


    var svg = d3.select(".obesitylinechartM")
         .append("div")
         .classed("svg-container", true) //container class to make it responsive
         .append("svg")
         //responsive SVG needs these 2 attributes and no width and height attr
         .attr("preserveAspectRatio", "xMinYMin meet")
         .attr("viewBox", "0 0 600 400")
         //class to make it responsive
         .classed("svg-content-responsive", true)
         .attr("width", width + margin.left + margin.right)
         .attr("height", height + margin.top + margin.bottom)
         .append("g")
         .attr("transform",
              "translate(" + margin.left + "," + margin.top + ")");; 

  
  //filtering based on regions that are checked
  d3.csv("NCD_RisC.csv", function(datum) {
        d3.select("svg").remove();
        dataset = datum.filter(function(d) {
        //if year is checked and region and gender are all checked
        return (years.indexOf(d['Year'])>-1 && genders.indexOf(d['Sex'])>-1 && countries.indexOf(d['Country'])>-1);
    });   

  radviz.render(dataset);
  //console.log('after',dataset);

  male_dataset = dataset.filter(function(d){
    return d.Sex!=="Female";
  }); 

  male_dataset.forEach(function(d){
      d.Year = parseDate(d.Year.toString());
      d.Obesity = +d.Obesity;
  });

  //console.log(male_dataset);



    // Scale the range of the data
    x.domain(d3.extent(male_dataset, function(d) { return d.Year; }));
    y.domain([d3.min(male_dataset, function(d) { return d.Obesity; }), 
    d3.max(datum, function(d) { return d.Obesity; })]); 

    //var color = d3.scale.ordinal().range(['#428bca','#f0ad4e','#5bc0de', '#d9534f', '#5cb85c']);

    var color = d3.scale.category10();

    // Nest the entries by symbol
    var dataNest = d3.nest()
        .key(function(d) {return d.Country;})
        .entries(male_dataset);

  // Loop through each symbol / key
  dataNest.forEach(function(d) {
        svg.append("path")
            .attr("class", "line")
            .style("stroke", function(){
              return d.color = color(d.key); })
            .attr("d", countryLine(d.values)); 
    });

  svg.append("text")
      .attr("class", "y label")
      .attr("text-anchor", "end")
      .attr("y", 6)
      .attr("dy", ".75em")
      .attr("transform", "rotate(-90)")
      .text("Obesity Prevalence (Male)");

    // Add the X Axis
    svg.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(0," + height + ")")
        .call(xAxis);

    // Add the Y Axis
    svg.append("g")
        .attr("class", "y axis")
        .call(yAxis);

});

  maleDiabetesLineChart();
  maleRBPLineChart();

  femaleObesityLineChart();
  femaleDiabetesLineChart();
  femaleRBPLineChart();

}

function femaleObesityLineChart(){
    

    var countries = []; 
    countries = getCountryChecked();

    var genders = [];
    genders = getGenderCheckedBoxes();

    var years = []; 
    years = getYearCheckedBoxes();

    // set the dimensions and margins of the graph
    var margin = {top: 50, right: 50, bottom: 100, left: 50},
        width = 500 - margin.left - margin.right,
        height = 500 - margin.top - margin.bottom;

    // parse the date / time
    var parseDate = d3.time.format('%Y').parse;
    var formatPercent = d3.format(".0%");

    // Set the ranges
    var x = d3.time.scale().range([0, width]);
    var y = d3.scale.linear().range([height, 0]);

    // Define the axes
    var xAxis = d3.svg.axis().scale(x)
        .orient("bottom").ticks(5);

    var yAxis = d3.svg.axis().scale(y)
        .orient("left").ticks(5).tickFormat(formatPercent);
;

    // define the 1st line
    var countryLine = d3.svg.line()
        .x(function(d) { return x(d.Year); })
        .y(function(d) { return y(d.Obesity); });


    var svg = d3.select(".obesitylinechartF")
         .append("div")
         .classed("svg-container", true) //container class to make it responsive
         .append("svg")
         //responsive SVG needs these 2 attributes and no width and height attr
         .attr("preserveAspectRatio", "xMinYMin meet")
         .attr("viewBox", "0 0 600 400")
         //class to make it responsive
         .classed("svg-content-responsive", true)
         .attr("width", width + margin.left + margin.right)
         .attr("height", height + margin.top + margin.bottom)
         .append("g")
         .attr("transform",
              "translate(" + margin.left + "," + margin.top + ")");; 

  
  //filtering based on regions that are checked
  d3.csv("NCD_RisC.csv", function(datum) {
        d3.select("svg").remove();
        dataset = datum.filter(function(d) {
        //if year is checked and region and gender are all checked
        return (years.indexOf(d['Year'])>-1 && genders.indexOf(d['Sex'])>-1 && countries.indexOf(d['Country'])>-1);
    });   

  radviz.render(dataset);
  //console.log('after',dataset);

  female_dataset = dataset.filter(function(d){
    return d.Sex!=="Male";
  }); 

  female_dataset.forEach(function(d){
      d.Year = parseDate(d.Year.toString());
      d.Obesity = +d.Obesity;
  });

  //console.log(male_dataset);



    // Scale the range of the data
    x.domain(d3.extent(female_dataset, function(d) { return d.Year; }));
    y.domain([d3.min(female_dataset, function(d) { return d.Obesity; }), 
    d3.max(datum, function(d) { return d.Obesity; })]); 

    //var color = d3.scale.ordinal().range(['#428bca','#f0ad4e','#5bc0de', '#d9534f', '#5cb85c']);

    var color = d3.scale.category10();

    // Nest the entries by symbol
    var dataNest = d3.nest()
        .key(function(d) {return d.Country;})
        .entries(female_dataset);

  // Loop through each symbol / key
  dataNest.forEach(function(d) {
        svg.append("path")
            .attr("class", "line")
            .style("stroke", function(){
              return d.color = color(d.key); })
            .attr("d", countryLine(d.values)); 
    });

  svg.append("text")
      .attr("class", "y label")
      .attr("text-anchor", "end")
      .attr("y", 6)
      .attr("dy", ".75em")
      .attr("transform", "rotate(-90)")
      .text("Obesity Prevalence (Female)");

    // Add the X Axis
    svg.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(0," + height + ")")
        .call(xAxis);

    // Add the Y Axis
    svg.append("g")
        .attr("class", "y axis")
        .call(yAxis);

});

}


function maleDiabetesLineChart(){


    var countries = []; 
    countries = getCountryChecked();

    var genders = [];
    genders = getGenderCheckedBoxes();

    var years = []; 
    years = getYearCheckedBoxes();

// set the dimensions and margins of the graph
    var margin = {top: 20, right: 50, bottom: 100, left: 50},
        width = 500 - margin.left - margin.right,
        height = 500 - margin.top - margin.bottom;

    // parse the date / time
    var parseDate = d3.time.format('%Y').parse;
    var formatPercent = d3.format(".0%");

    // Set the ranges
    var x = d3.time.scale().range([0, width]);
    var y = d3.scale.linear().range([height, 0]);

    // Define the axes
    var xAxis = d3.svg.axis().scale(x)
        .orient("bottom").ticks(5);

    var yAxis = d3.svg.axis().scale(y)
        .orient("left").ticks(5).tickFormat(formatPercent);
;

    // define the 1st line
    var countryLine = d3.svg.line()
        .x(function(d) { return x(d.Year); })
        .y(function(d) { return y(d.Diabetes); });


    
    var svg = d3.select(".DiabeteslinechartM")
         .append("div")
         .classed("svg-container", true) //container class to make it responsive
         .append("svg")
         //responsive SVG needs these 2 attributes and no width and height attr
         .attr("preserveAspectRatio", "xMinYMin meet")
         .attr("viewBox", "0 0 600 400")
         //class to make it responsive
         .classed("svg-content-responsive", true)
         .attr("width", width + margin.left + margin.right)
         .attr("height", height + margin.top + margin.bottom)
         .append("g")
         .attr("transform",
              "translate(" + margin.left + "," + margin.top + ")");;     
  

    //filtering based on regions that are checked
  d3.csv("NCD_RisC.csv", function(datum) {
        d3.select("svg").remove();
        dataset = datum.filter(function(d) {
        //if year is checked and region and gender are all checked
        return (years.indexOf(d['Year'])>-1 && genders.indexOf(d['Sex'])>-1 && countries.indexOf(d['Country'])>-1);
    });   

  radviz.render(dataset);      

  male_dataset = dataset.filter(function(d){
    return d.Sex!=="Female";
  }); 

  male_dataset.forEach(function(d){
      d.Year = parseDate(d.Year.toString());
      d.Diabetes = +d.Diabetes;
  });


    // Scale the range of the data
    x.domain(d3.extent(male_dataset, function(d) { return d.Year; }));
    y.domain([d3.min(male_dataset, function(d) { return d.Diabetes; }), 
    d3.max(datum, function(d) { return d.Obesity; })]); 

    //var color = d3.scale.ordinal().range(['#428bca','#f0ad4e','#5bc0de', '#d9534f', '#5cb85c']);
    var color = d3.scale.category10();

    // Nest the entries by symbol
    var dataNest = d3.nest()
        .key(function(d) {return d.Country;})
        .entries(male_dataset);

  // Loop through each symbol / key
  dataNest.forEach(function(d) {
        svg.append("path")
            .attr("class", "line")
            .style("stroke", function(){
              return d.color = color(d.key); })
            .attr("d", countryLine(d.values)); 
    });

  svg.append("text")
      .attr("class", "y label")
      .attr("text-anchor", "end")
      .attr("y", 6)
      .attr("dy", ".75em")
      .attr("transform", "rotate(-90)")
      .text("Diabetes Prevalence (Male)");

    // Add the X Axis
    svg.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(0," + height + ")")
        .call(xAxis);

    // Add the Y Axis
    svg.append("g")
        .attr("class", "y axis")
        .call(yAxis);
});    

}


function femaleDiabetesLineChart(){


    var countries = []; 
    countries = getCountryChecked();

    var genders = [];
    genders = getGenderCheckedBoxes();

    var years = []; 
    years = getYearCheckedBoxes();

// set the dimensions and margins of the graph
    var margin = {top: 50, right: 50, bottom: 100, left: 50},
        width = 500 - margin.left - margin.right,
        height = 500 - margin.top - margin.bottom;

    // parse the date / time
    var parseDate = d3.time.format('%Y').parse;
    var formatPercent = d3.format(".0%");

    // Set the ranges
    var x = d3.time.scale().range([0, width]);
    var y = d3.scale.linear().range([height, 0]);

    // Define the axes
    var xAxis = d3.svg.axis().scale(x)
        .orient("bottom").ticks(5);

    var yAxis = d3.svg.axis().scale(y)
        .orient("left").ticks(5).tickFormat(formatPercent);
;

    // define the 1st line
    var countryLine = d3.svg.line()
        .x(function(d) { return x(d.Year); })
        .y(function(d) { return y(d.Diabetes); });


    
    var svg = d3.select(".DiabeteslinechartF")
         .append("div")
         .classed("svg-container", true) //container class to make it responsive
         .append("svg")
         //responsive SVG needs these 2 attributes and no width and height attr
         .attr("preserveAspectRatio", "xMinYMin meet")
         .attr("viewBox", "0 0 600 400")
         //class to make it responsive
         .classed("svg-content-responsive", true)
         .attr("width", width + margin.left + margin.right)
         .attr("height", height + margin.top + margin.bottom)
         .append("g")
         .attr("transform",
              "translate(" + margin.left + "," + margin.top + ")");;     
  

    //filtering based on regions that are checked
  d3.csv("NCD_RisC.csv", function(datum) {
        d3.select("svg").remove();
        dataset = datum.filter(function(d) {
        //if year is checked and region and gender are all checked
        return (years.indexOf(d['Year'])>-1 && genders.indexOf(d['Sex'])>-1 && countries.indexOf(d['Country'])>-1);
    });   

  radviz.render(dataset);      

  female_dataset = dataset.filter(function(d){
    return d.Sex!=="Male";
  }); 

  female_dataset.forEach(function(d){
      d.Year = parseDate(d.Year.toString());
      d.Diabetes = +d.Diabetes;
  });


    // Scale the range of the data
    x.domain(d3.extent(female_dataset, function(d) { return d.Year; }));
    y.domain([d3.min(female_dataset, function(d) { return d.Diabetes; }), 
    d3.max(datum, function(d) { return d.Obesity; })]); 

    //var color = d3.scale.ordinal().range(['#428bca','#f0ad4e','#5bc0de', '#d9534f', '#5cb85c']);
    var color = d3.scale.category10();

    // Nest the entries by symbol
    var dataNest = d3.nest()
        .key(function(d) {return d.Country;})
        .entries(female_dataset);

  // Loop through each symbol / key
  dataNest.forEach(function(d) {
        svg.append("path")
            .attr("class", "line")
            .style("stroke", function(){
              return d.color = color(d.key); })
            .attr("d", countryLine(d.values)); 
    });

  svg.append("text")
      .attr("class", "y label")
      .attr("text-anchor", "end")
      .attr("y", 6)
      .attr("dy", ".75em")
      .attr("transform", "rotate(-90)")
      .text("Diabetes Prevalence (Female)");

    // Add the X Axis
    svg.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(0," + height + ")")
        .call(xAxis);

    // Add the Y Axis
    svg.append("g")
        .attr("class", "y axis")
        .call(yAxis);
});    

}


function maleRBPLineChart(){

    var countries = []; 
    countries = getCountryChecked();

    var genders = [];
    genders = getGenderCheckedBoxes();

    var years = []; 
    years = getYearCheckedBoxes();

// set the dimensions and margins of the graph
    var margin = {top: 20, right: 50, bottom: 100, left: 50},
        width = 500 - margin.left - margin.right,
        height = 500 - margin.top - margin.bottom;

    // parse the date / time
    var parseDate = d3.time.format('%Y').parse;
    var formatPercent = d3.format(".0%");

    // Set the ranges
    var x = d3.time.scale().range([0, width]);
    var y = d3.scale.linear().range([height, 0]);

    // Define the axes
    var xAxis = d3.svg.axis().scale(x)
        .orient("bottom").ticks(5);

    var yAxis = d3.svg.axis().scale(y)
        .orient("left").ticks(5).tickFormat(formatPercent);
;

    // define the 1st line
    var countryLine = d3.svg.line()
        .x(function(d) { return x(d.Year); })
        .y(function(d) { return y(d.RBP); });


    var svg = d3.select(".RBPlinechartM")
         .append("div")
         .classed("svg-container", true) //container class to make it responsive
         .append("svg")
         //responsive SVG needs these 2 attributes and no width and height attr
         .attr("preserveAspectRatio", "xMinYMin meet")
         .attr("viewBox", "0 0 600 400")
         //class to make it responsive
         .classed("svg-content-responsive", true)
         .attr("width", width + margin.left + margin.right)
         .attr("height", height + margin.top + margin.bottom)
         .append("g")
         .attr("transform",
              "translate(" + margin.left + "," + margin.top + ")");;     
  
  

    //filtering based on regions that are checked
  d3.csv("NCD_RisC.csv", function(datum) {
        d3.select("svg").remove();
        dataset = datum.filter(function(d) {
        //if year is checked and region and gender are all checked
        return (years.indexOf(d['Year'])>-1 && genders.indexOf(d['Sex'])>-1 && countries.indexOf(d['Country'])>-1);
    });   

  radviz.render(dataset);      

  RBP_male_dataset = dataset.filter(function(d){
    return d.Sex!=="Female";
  }); 

  RBP_male_dataset.forEach(function(d){
      d.Year = parseDate(d.Year.toString());
      d.RBP = +d.RBP;
  });



    // Scale the range of the data
    x.domain(d3.extent(RBP_male_dataset, function(d) { return d.Year; }));
    y.domain([d3.min(RBP_male_dataset, function(d) { return d.RBP; }), 
    d3.max(datum, function(d) { return d.RBP; })]); 

    //var color = d3.scale.ordinal().range(['#428bca','#f0ad4e','#5bc0de', '#d9534f', '#5cb85c']);

    var color = d3.scale.category10();

    // Nest the entries by symbol
    var dataNest = d3.nest()
        .key(function(d) {return d.Country;})
        .entries(RBP_male_dataset);

  // Loop through each symbol / key
  dataNest.forEach(function(d) {
        svg.append("path")
            .attr("class", "line")
            .style("stroke", function(){
              return d.color = color(d.key); })
            .attr("d", countryLine(d.values)); 
    });

  svg.append("text")
      .attr("class", "y label")
      .attr("text-anchor", "end")
      .attr("y", 6)
      .attr("dy", ".75em")
      .attr("transform", "rotate(-90)")
      .text("RBP Male)");

    // Add the X Axis
    svg.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(0," + height + ")")
        .call(xAxis);

    // Add the Y Axis
    svg.append("g")
        .attr("class", "y axis")
        .call(yAxis);
}); 

}


function femaleRBPLineChart(){
    

    var countries = []; 
    countries = getCountryChecked();

    var genders = [];
    genders = getGenderCheckedBoxes();

    var years = []; 
    years = getYearCheckedBoxes();

// set the dimensions and margins of the graph
    var margin = {top: 50, right: 50, bottom: 100, left: 50},
        width = 500 - margin.left - margin.right,
        height = 500 - margin.top - margin.bottom;

    // parse the date / time
    var parseDate = d3.time.format('%Y').parse;
    var formatPercent = d3.format(".0%");

    // Set the ranges
    var x = d3.time.scale().range([0, width]);
    var y = d3.scale.linear().range([height, 0]);

    // Define the axes
    var xAxis = d3.svg.axis().scale(x)
        .orient("bottom").ticks(5);

    var yAxis = d3.svg.axis().scale(y)
        .orient("left").ticks(5).tickFormat(formatPercent);
;

    // define the 1st line
    var countryLine = d3.svg.line()
        .x(function(d) { return x(d.Year); })
        .y(function(d) { return y(d.RBP); });


    var svg = d3.select(".RBPlinechartF")
         .append("div")
         .classed("svg-container", true) //container class to make it responsive
         .append("svg")
         //responsive SVG needs these 2 attributes and no width and height attr
         .attr("preserveAspectRatio", "xMinYMin meet")
         .attr("viewBox", "0 0 600 400")
         //class to make it responsive
         .classed("svg-content-responsive", true)
         .attr("width", width + margin.left + margin.right)
         .attr("height", height + margin.top + margin.bottom)
         .append("g")
         .attr("transform",
              "translate(" + margin.left + "," + margin.top + ")");;     
  
  

    //filtering based on regions that are checked
  d3.csv("NCD_RisC.csv", function(datum) {
        d3.select("svg").remove();
        dataset = datum.filter(function(d) {
        //if year is checked and region and gender are all checked
        return (years.indexOf(d['Year'])>-1 && genders.indexOf(d['Sex'])>-1 && countries.indexOf(d['Country'])>-1);
    });   

  radviz.render(dataset);      

  RBP_female_dataset = dataset.filter(function(d){
    return d.Sex!=="Male";
  }); 

  RBP_female_dataset.forEach(function(d){
      d.Year = parseDate(d.Year.toString());
      d.RBP = +d.RBP;
  });



    // Scale the range of the data
    x.domain(d3.extent(RBP_female_dataset, function(d) { return d.Year; }));
    y.domain([d3.min(RBP_female_dataset, function(d) { return d.RBP; }), 
    d3.max(datum, function(d) { return d.RBP; })]); 

    //var color = d3.scale.ordinal().range(['#428bca','#f0ad4e','#5bc0de', '#d9534f', '#5cb85c']);

    var color = d3.scale.category10();

    // Nest the entries by symbol
    var dataNest = d3.nest()
        .key(function(d) {return d.Country;})
        .entries(RBP_female_dataset);

  // Loop through each symbol / key
  dataNest.forEach(function(d) {
        svg.append("path")
            .attr("class", "line")
            .style("stroke", function(){
              return d.color = color(d.key); })
            .attr("d", countryLine(d.values)); 
    });

  svg.append("text")
      .attr("class", "y label")
      .attr("text-anchor", "end")
      .attr("y", 6)
      .attr("dy", ".75em")
      .attr("transform", "rotate(-90)")
      .text("RBP (Female)");

    // Add the X Axis
    svg.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(0," + height + ")")
        .call(xAxis);

    // Add the Y Axis
    svg.append("g")
        .attr("class", "y axis")
        .call(yAxis);
}); 

}

function clearVis(){
  location.reload();
}

