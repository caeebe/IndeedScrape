
//URLs to APIs to access data
var urlMap = "http://localhost:5000/data";
var urlBar = "http://localhost:5000/title";
var urlPie = "http://localhost:5000/city";

// colors needs to be global
var colors = {}

// init will fill in the colors object, make the map and bar chart, 
// and start the pie chart with the first summed by city array
init();

///////////////////////
//ADD the base map
//////////////////////
function buildMap(){
    
    // Center the map on the bay area
    var myMap = L.map("map", {
      center: [37.6, -122.15],
      zoom: 9
    });

    // Adding base tile layer
    L.tileLayer("https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}", {
      attribution: "Map data &copy; <a href='https://www.openstreetmap.org/'>OpenStreetMap</a> contributors, <a href='https://creativecommons.org/licenses/by-sa/2.0/'>CC-BY-SA</a>, Imagery © <a href='https://www.mapbox.com/'>Mapbox</a>",
      maxZoom: 18,
      id: "mapbox.streets",
      accessToken: API_KEY
    }).addTo(myMap);

    // api source of the data, read the json
    d3.json(urlMap, function(rawdata) {
        var response = Object.values(rawdata);
        console.log(response);
        
          // Cast Data as numbers
        // ==============================
        response.forEach(function(data) {
            data.lat = +data.lat;
            data.lng = +data.lng;
        });
        

        // Create a new marker cluster group
        var markers = L.markerClusterGroup();

        // cycle through each posting and place a marker with the color and shape desired for each
        for (var i = 0; i < response.length; i++) {
            var options = {
                icon: 'star-o',
                iconShape: 'marker',
                borderColor: colors[response[i].job_cat], 
                textColor: colors[response[i].job_cat]
            };
            // Add a new marker to the cluster group and bind a pop-up
            markers.addLayer(L.marker([response[i].lat, response[i].lng], {
                icon: L.BeautifyIcon.icon(options),
                draggable: false
                })
                .bindPopup(`${response[i].job_title}<br/>${response[i].comp_name}<br/>$${response[i].salary_estimate}`)
                );

        }

        // Add our marker cluster layer to the map
        myMap.addLayer(markers);

    });
}

///////////////////////
// Now add the barchart
///////////////////////
function buildBar(){
    
    // get data, read the json
    d3.json(urlBar, function(response) {
    //var response = Object.values(rawTitle);

        // create the datasets and link the colors to be used
        var barData = {};
        // use the list of cities for the x axis
        barData["label"] = response[Object.keys(response)[0]].cities;
        barData["datasets"] = [];
        // cycle through the datasets for each jobTitle
        Object.keys(response).forEach(function(title, index) {
            var dataset = {
                label: title,
                data: response[title].postings,
                backgroundColor: colors[title],
                borderColor: "black",
                borderWidth: 1
            };
            barData["datasets"].push(dataset);
        });

        // add a chart.js Stacked Bar chart with a legend
        var bar = document.getElementById('barChart');
        var myChart = new Chart(bar, {
            type: 'bar',
            data: {
                labels: barData.label,
                datasets: barData.datasets
            },
            options: {
                scales: {
                    xAxes: [{
                        stacked: true
                    }],
                    yAxes: [{
                        scaleLabel: {
                            display: true,
                            labelString: '# of job postings'
                        },
                        stacked: true
                    }]
                },
                legend: {
                    position: 'top',
                }
            }
        });

    });
}

///////////////////////
// Now add the piechart
///////////////////////
function buildPie(cityChoice){
    
    d3.json(urlPie, function(response) {
        
        // create the datasets and colors to be used
        var pieData = {};
        pieData["label"] = response[cityChoice].titles;                   
        pieData["datasets"] = [
            {
                label: Object.keys(response[cityChoice]),
                data: response[cityChoice].postings,
                backgroundColor: Object.values(colors),
                borderColor: "black",
                borderWidth: 1
            }
        ];

        // add a chart.js pie chart
        var pie = document.getElementById('pieChart');
        var myChart = new Chart(pie, {
            type: 'doughnut',
            data: {
                labels: pieData.label,
                datasets: pieData.datasets
            },
            options: {
                responsive: true,
                legend: {
                    position: 'top',
                }
            }
        });
    });
}

function init() {

  // Grab a reference to the dropdown select element
  var selector = d3.select("#selDataset");

    console.log(urlPie)
  // Use the list of city names to populate the select options
    d3.json(urlPie, function(response) {

      console.log(response)
    
        // first set up the color scheme to be used throughout
        response["All"]["titles"].forEach(function(title, i){
            colors[title] = d3.interpolateViridis(i / (response["All"]["titles"].length));
        });
        console.log(colors);
    
        // Set up the selector html to allow the user to choose the city for the pie chart 
        Object.keys(response).forEach((city) => {
          selector
            .append("option")
            .text(city)
            .property("value", city);
        });

        // Build the Map and Bar chart
        buildMap();
        buildBar();

        // Use the first sample from the list to build the initial Pie chart
        var firstCity = Object.keys(response)[0];
        buildPie(firstCity);

  });
}

// This is called by the dropdown selector to reset the Pie Chart
function optionChanged(newChoice) {
  // Fetch new data each time a new sample is selected
  buildPie(newChoice);
}


        