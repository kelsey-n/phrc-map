mapboxgl.accessToken =
  'pk.eyJ1Ijoia2FybHloYW1wc2hpcmUiLCJhIjoiY2t0YWo3OGNoMW1raDJ2czF0Y2hldWg5ZCJ9.weTyH0bvFpB7aGv8POA5IA';

// 1. Initialize mapboxgl map and insert into mapcontainer div:
var map = new mapboxgl.Map({
  container: 'mapcontainer',
  style: 'mapbox://styles/mapbox/light-v10',
  bounds: [
    [-127.77006, 22.52332],
    [3.26688, 59.99842],
  ],
  scrollZoom: false, // disable map zoom when using scroll
});
// add navigation control:
map.addControl(
  new mapboxgl.NavigationControl({
    showCompass: false,
    showZoom: true,
  })
);

var colors = ['#DA0037', '#e8724b', '#e59e4d', '#44679F', '#68BB59']; // F --> A, red --> green

var background_colors = {
  A: '#68BB59dd',
  B: '#44679Fdd',
  C: '#e59e4ddd',
  D: '#e8724bdd',
  F: '#DA0037dd',
};

var text_colors = {
  A: '',
  B: '#ffffffee',
  C: '',
  D: '',
  F: '#ffffffee',
};

map.on('style.load', function () {
  map.addSource('phrc-map-data', {
    type: 'geojson',
    data: 'data/2023_PHRC_Map_Updated.geojson',
  });

  map.addLayer({
    id: 'schools-layer',
    type: 'circle',
    source: 'phrc-map-data',
    paint: {
      'circle-color': [
        //color circle based on its overall grade
        'match',
        ['get', 'Overall_Grade_Letter'],
        'A-',
        colors[4],
        'A',
        colors[4],
        'A+',
        colors[4],
        'B-',
        colors[3],
        'B',
        colors[3],
        'B+',
        colors[3],
        'C-',
        colors[2],
        'C',
        colors[2],
        'C+',
        colors[2],
        'D-',
        colors[1],
        'D',
        colors[1],
        'D+',
        colors[1],
        // 'E-', colors[1],
        // 'E', colors[1],
        // 'E+', colors[1],
        'F-',
        colors[0],
        'F',
        colors[0],
        'F+',
        colors[0],
        'black', // no grade
      ],
      'circle-opacity': 0.85,
      'circle-radius': {
        base: 9,
        stops: [
          [3, 9],
          [10, 13],
        ],
      },
    },
  });

  // add an empty data source, which we will use to highlight the school that the user is hovering over
  map.addSource('highlight-hoveredschool-source', {
    type: 'geojson',
    data: {
      type: 'FeatureCollection',
      features: [],
    },
  });

  // add a layer for the hovered school
  map.addLayer({
    id: 'highlight-hoveredschool-layer',
    type: 'circle',
    source: 'highlight-hoveredschool-source',
    paint: {
      'circle-color': [
        //color circle based on its overall grade
        'match',
        ['get', 'Overall_Grade_Letter'],
        'A-',
        colors[4],
        'A',
        colors[4],
        'A+',
        colors[4],
        'B-',
        colors[3],
        'B',
        colors[3],
        'B+',
        colors[3],
        'C-',
        colors[2],
        'C',
        colors[2],
        'C+',
        colors[2],
        'D-',
        colors[1],
        'D',
        colors[1],
        'D+',
        colors[1],
        // 'E-', colors[1],
        // 'E', colors[1],
        // 'E+', colors[1],
        'F-',
        colors[0],
        'F',
        colors[0],
        'F+',
        colors[0],
        'black', // no grade
      ],
      'circle-stroke-color': [
        //use same data styling as for original layer
        'match',
        ['get', 'Overall_Grade_Letter'],
        'A-',
        colors[4],
        'A',
        colors[4],
        'A+',
        colors[4],
        'B-',
        colors[3],
        'B',
        colors[3],
        'B+',
        colors[3],
        'C-',
        colors[2],
        'C',
        colors[2],
        'C+',
        colors[2],
        'D-',
        colors[1],
        'D',
        colors[1],
        'D+',
        colors[1],
        // 'E-', colors[1],
        // 'E', colors[1],
        // 'E+', colors[1],
        'F-',
        colors[0],
        'F',
        colors[0],
        'F+',
        colors[0],
        'black', // no grade
      ],
      'circle-stroke-width': 1.5, //stroke color and stroke width give the effect of the circle becoming slightly larger upon hovering
      'circle-opacity': 1,
      'circle-radius': {
        base: 9,
        stops: [
          [3, 9],
          [10, 13],
        ],
      },
    },
  });

  // Create a popup, but don't add it to the map yet. This will be the hover popup
  window['popup'] = new mapboxgl.Popup({
    closeButton: false,
    closeOnClick: false,
  });

  // Function to query rendered features for the station the user is hovering over, then populate popup with that station's info
  map.on('mousemove', function (e) {
    //query for the features under the mouse:
    var features = map.queryRenderedFeatures(e.point, {
      layers: ['schools-layer'],
    });

    // Check whether features exist
    if (features.length > 0) {
      map.getCanvas().style.cursor = 'pointer'; //change cursor to pointer if hovering over a circle/feature

      var hoveredFeature = features[0];
      //Extract necessary variables:
      var school_name = hoveredFeature.properties.School;
      var overall_grade = hoveredFeature.properties.Overall_Grade_Letter;
      grade_letter = overall_grade.slice(0, 1);

      //Add class to color popup based on overall grade:
      popup.addClassName(`${grade_letter}-popup`);

      window['popupContent'] = `
        <div style = "font-size:14px; font-weight:bold; color: ${text_colors[grade_letter]}; background-color: ${background_colors[grade_letter]};">${school_name} (${overall_grade})</div>
      `;

      //fix the position of the popup as the position of the circle:
      popup
        .setLngLat(hoveredFeature.geometry.coordinates)
        .setHTML(popupContent)
        .addTo(map);
      //create and populate a feature with the properties of the hoveredFeature necessary for data-driven styling of the highlight layer
      var hoveredFeature_data = {
        type: 'Feature',
        geometry: hoveredFeature.geometry,
        properties: {
          Overall_Grade_Letter: overall_grade,
        },
      };
      // set this circle's geometry and properties as the data for the highlight source
      map
        .getSource('highlight-hoveredschool-source')
        .setData(hoveredFeature_data);
    } else {
      //if len(features) <1
      // remove the Popup, change back to default cursor and clear data from the highlight data source
      popup.remove();
      map.getCanvas().style.cursor = '';
      map.getSource('highlight-hoveredschool-source').setData({
        type: 'FeatureCollection',
        features: [],
      });
    }
  });

  map.on('click', 'schools-layer', function (e) {
    // get the clicked station's complex_id by querying the rendered features
    var features = map.queryRenderedFeatures(e.point, {
      layers: ['schools-layer'],
    });

    var clickedFeature = features[0];
    var overall_grade = clickedFeature.properties.Overall_Grade_Letter;
    var grade_letter = overall_grade.slice(0, 1);

    // Create a popup for the click action, but don't add it to the map yet
    // Add a class to color the popup background based on the grade color
    var popup_click = new mapboxgl.Popup({
      className: `${grade_letter}-popup`,
    });

    window['popupContent_click'] = `
      <div style = "font-size:14px; font-weight:bold; color: ${text_colors[grade_letter]}; background-color: ${background_colors[grade_letter]};">${clickedFeature.properties.School}</div>
      <br>
      <div style = "font-size:13px; font-weight:bold; color: ${text_colors[grade_letter]}; background-color: ${background_colors[grade_letter]};">Overall Grade: ${clickedFeature.properties.Overall_Grade_Letter}</div>
      <div style = "font-size:13px;"><em>Curriculum</em>: ${clickedFeature.properties.Curriculum}</div>
      <div style = "font-size:13px;"><em>Research</em>: ${clickedFeature.properties.Research}</div>
      <div style = "font-size:13px;"><em>Community Engagement</em>: ${clickedFeature.properties.Community_Engagement}</div>
      <div style = "font-size:13px;"><em>Support for Student-Led Initiatives</em>: ${clickedFeature.properties.Support_for_Student_Led_Initiatives}</div>
      <div style = "font-size:13px;"><em>Sustainability</em>: ${clickedFeature.properties.Sustainability}</div>
      <a target="_blank" rel="noopener noreferrer"
        href="${clickedFeature.properties.Link}">View full school report card
      </a>
      `;

    popup_click
      .setLngLat(clickedFeature.geometry.coordinates)
      .setHTML(window['popupContent_click'])
      .addTo(map);
  });
});
