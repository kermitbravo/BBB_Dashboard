function init() {
  // Grab a reference to the dropdown select element
  var selector = d3.select("#selDataset");

  // Use the list of sample names to populate the select options
  d3.json("static/samples.json").then((data) => {
    var sampleNames = data.names;

    sampleNames.forEach((sample) => {
      selector
        .append("option")
        .text(sample)
        .property("value", sample);
    });

    // Use the first sample from the list to build the initial plots
    var firstSample = sampleNames[0];
    buildCharts(firstSample);
    buildMetadata(firstSample);
  });
}

// Initialize the dashboard
init();

function optionChanged(newSample) {
  // Fetch new data each time a new sample is selected
  buildMetadata(newSample);
  buildCharts(newSample);

}

// Demographics Panel 
function buildMetadata(sample) {
  d3.json("static/samples.json").then((data) => {
    var metadata = data.metadata;
    // Filter the data for the object with the desired sample number
    var resultArray = metadata.filter(sampleObj => sampleObj.id == sample);
    var result = resultArray[0];
    // Use d3 to select the panel with id of `#sample-metadata`
    var PANEL = d3.select("#sample-metadata");

    // Use `.html("") to clear any existing metadata
    PANEL.html("");

    // Use `Object.entries` to add each key and value pair to the panel
    // Hint: Inside the loop, you will need to use d3 to append new
    // tags for each key-value in the metadata.
    Object.entries(result).forEach(([key, value]) => {
      PANEL.append("h6").text(`${key.toUpperCase()}: ${value}`);
    });

  });
}

// 1. Create the buildCharts function.
function buildCharts(sample) {
  // 2. Use d3.json to load and retrieve the samples.json file 
  d3.json("static/samples.json").then((data) => {
    // 3. Create a variable that holds the samples array. 
    var samples = data.samples;
    // 4. Create a variable that filters the samples for the object with the desired sample number.
    //  5. Create a variable that holds the first sample in the array.
    var result = samples.filter(sampleObj => sampleObj.id === sample)[0];
    // 6. Create variables that hold the otu_ids, otu_labels, and sample_values.
    // 7. Create the yticks for the bar chart.
    // Hint: Get the the top 10 otu_ids and map them in descending order  
    //  so the otu_ids with the most bacteria are last. 
    var sampleValue = Object.values(result.sample_values).map(sampleValue => sampleValue).sort((a, b) => a.sample_values - b.sample_values).slice(0, 10).reverse();
    var otuIds = Object.values(result.otu_ids).map(otuId => `OTU ${otuId}`).sort((a, b) => a.sample_values - b.sample_values).slice(0, 10).reverse();
    var otuLabels = Object.values(result.otu_labels).map(otuLabel => otuLabel).sort((a, b) => a.sample_values - b.sample_values).slice(0, 10).reverse();
    var otuIdsBubble = Object.values(result.otu_ids).map(otuId => otuId).sort((a, b) => a.sample_values - b.sample_values).slice(0, 10).reverse();
    var washFrequency = parseFloat(Object.values(data.metadata).filter(sampleObj => sampleObj.id == sample).map(meta => meta.wfreq));
    console.log(washFrequency);
    // console.log(sample_value);
    // console.log(otu_ids);
    // console.log(otu_labels);

    var yticks = {
      x: sampleValue,
      y: otuIds,
      text: otuLabels,
      name: "Bacteria",
      type: "bar",
      orientation: "h"
    };

    // 8. Create the trace for the bar chart. 
    var barData = [yticks];
    // 9. Create the layout for the bar chart. 
    var barLayout = {
      title: {
        text: "<b>Top 10 Bacteria Cultures Found</b>",
      },
      paper_bgcolor: 'rgba(0,0,0,0)',
      plot_bgcolor: 'rgba(0,0,0,0)'
    };
    // 10. Use Plotly to plot the data with the layout. 
    Plotly.newPlot("plot", barData, barLayout);

    // 1. Create the trace for the bubble chart.
    var bubbleData = [{
      x: otuIdsBubble,
      y: sampleValue,
      text: otuLabels,
      mode: 'markers',
      marker: {
        color: otuIdsBubble,
        colorscale: 'Earth',
        size: sampleValue,
      }
    }];

    // 2. Create the layout for the bubble chart.
    var bubbleLayout = {
      title: "<b>Bacteria Cultures Per Sample</b>",
      xaxis: { title: "<b>OTU ID</b>" },
      hovermode: 'closest',
      paper_bgcolor: 'rgba(0,0,0,0)',
      plot_bgcolor: 'lightgrey'
    };

    // 3. Use Plotly to plot the data with the layout.
    Plotly.newPlot("bubble", bubbleData, bubbleLayout);

    var gaugeData = [{
      type: 'indicator',
      mode: 'gauge+number',
      value: washFrequency,
      gauge: {
        axis: {
          visible: true,
          range: [0, 10],
          tickwidth: 1,
          tickcolor: "black"
        },
        bar: { color: "black" },
        steps: [
          { range: [0, 2], color: "red" },
          { range: [2, 4], color: "orange" },
          { range: [4, 6], color: "yellow" },
          { range: [6, 8], color: "lime" },
          { range: [8, 10], color: "green" },
        ]
      }
    }];

    // 5. Create the layout for the gauge chart.
    var gaugeLayout = {
      title: { text: "<b>Belly Button Washing Frequency</b><br><span style='font-size:1em'>Scrubs per Week</span>" },
      width: 460,
      height: 500,
      paper_bgcolor: 'rgba(0,0,0,0)',
      plot_bgcolor: 'rgba(0,0,0,0)'
    };

    // 6. Use Plotly to plot the gauge data and layout.
    Plotly.newPlot("gauge", gaugeData, gaugeLayout);
  });
}
