function buildMetadata(sample) {

  // Grab a reference to the metadata panel element in the html
  var metadataDisplay = d3.select("#sample-metadata");

  // Clear any existing data
  metadataDisplay.html("");

  // Use `d3.json` to fetch the metadata for a sample
  metadataToDisplay = d3.json(`/metadata/${sample}`).then(function(data){

    // test that the data was read correctly
    //console.log(data);

    // Use `Object.entries` to add each key and value pair to the panel
    Object.entries(data).forEach(([key, value]) => 
      metadataDisplay.append("p").text(`${key}: ${value}`)
      );

    var gaugeTrace = {
      domain: {x: [0, 1], y: [0, 1]},
      value: data.WFREQ,
      title: "Belly Button Scrubs Per Week",
      type: 'indicator',
      mode: 'gauge+number'
    };

    var gaugeData=[gaugeTrace];

    var gaugeLayout = {width: 500, height: 500, margin: {t: 0, b: 0}};

    Plotly.newPlot('gauge',gaugeData,gaugeLayout);


  })

}

function buildCharts(sample) {

  // @TODO: Use `d3.json` to fetch the sample data for the plots

    // @TODO: Build a Bubble Chart using the sample data

  sampleToChart = d3.json(`/samples/${sample}`).then(function(response){

    // test that the data was read correctly
    console.log(response);
    
    //top10 = response.slice(0,10);
    console.log(response.otu_ids.slice(0,10));
    console.log(response.sample_values.slice(0,10));

    // Build trace for pie chart
    var pieTrace = {
      labels: response.sample_values.slice(0,10),
      values: response.otu_ids.slice(0,10),
      type: "pie"
    };

    var pieData = [pieTrace];

    var pieLayout = {
        title: `Top 10 for Sample ${sample}`
        };
    
    Plotly.newPlot("pie", pieData, pieLayout);

    var hoverText = [];

    for(i=0; i < response.otu_ids.length; i++) {
      hoverText.push(`OUT_ID: ${response.otu_ids[i]}<br> Description: ${response.otu_labels[i]} <br> `);
    };

    var bubbleTrace = {
      x: response.otu_ids,
      y: response.sample_values,
      text:  hoverText,
      mode: 'markers',
      marker: {
        size: response.sample_values,
        color: response.otu_ids,
        colorscale: "Rainbow"
      }
    };
    
    var bubbleData = [bubbleTrace];
    
    var bubbleLayout = {
      title: `Full Distribution for Sample ${sample}`,
      xlabel: 'OTU_ID',
      showlegend: false
    };
    
    Plotly.newPlot('bubble', bubbleData, bubbleLayout);

  });



}

function init() {

  // Grab a reference to the dropdown select element
  var selector = d3.select("#selDataset");

  // Use the list of sample names to populate the select options
  d3.json("/names").then((sampleNames) => {
    sampleNames.forEach((sample) => {
      selector
        .append("option")
        .text(sample)
        .property("value", sample);
    });

    //console.log(sampleNames);

    // Use the first sample from the list to build the initial plots
    const firstSample = sampleNames[0];
    buildCharts(firstSample);
    buildMetadata(firstSample);
  });
}

function optionChanged(newSample) {
  // Fetch new data each time a new sample is selected
  buildCharts(newSample);
  buildMetadata(newSample);
}

// Initialize the dashboard
init();
