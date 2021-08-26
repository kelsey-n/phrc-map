mapboxgl.accessToken = 'pk.eyJ1Ijoia25hbmFuIiwiYSI6ImNrbDlsMXNmNjI3MnEyb25yYjNremFwYXQifQ.l6loLOR-pOL_U2kzWBSQNQ';

// 1. Initialize mapboxgl map and insert into mapcontainer div:
var map = new mapboxgl.Map({
  container: 'mapcontainer', // container ID
  style: 'mapbox://styles/mapbox/dark-v10', // style URL mapbox://styles/knanan/ckle1rswq26lu17paw71lych7
  center: [-73.984, 40.7128], // starting position [lng, lat]
  zoom: 11.5 // starting zoom
});

// add navigation control:
// TO DO: disable scrollwheel zoom
map.addControl(new mapboxgl.NavigationControl({
  showCompass: false,
  showZoom: true
}));

var colors = ['#b2182b','#ef8a62','#fddbc7','#d1e5f0','#67a9cf','#2166ac'] // diverging red -> blue color scheme

map.on('style.load', function() {

  //var colors = ['#b2182b','#ef8a62','#fddbc7','#d1e5f0','#67a9cf','#2166ac'] // diverging red -> blue color scheme

  map.addSource('phrc-map-data', {
    type: 'geojson',
    data: 'data/2021_PHRC_Map.geojson'
  });

  map.addLayer({
    'id': 'schools-layer',
    'type': 'circle',
    'source': 'phrc-map-data',
    'paint': {
      'circle-color': [ //color circle based on its overall grade
        'match',
        ['get', 'Overall_Grade_Letter'],
        'A-', colors[5],
        'A', colors[5],
        'A+', colors[5],
        'B-', colors[4],
        'B', colors[4],
        'B+', colors[4],
        'C-', colors[3],
        'C', colors[3],
        'C+', colors[3],
        'D-', colors[2],
        'D', colors[2],
        'D+', colors[2],
        'E-', colors[1],
        'E', colors[1],
        'E+', colors[1],
        'F-', colors[0],
        'F', colors[0],
        'F+', colors[0],
        'black' // no grade
      ],
      'circle-opacity': 0.75
    },
  });

  // add an empty data source, which we will use to highlight the school that the user is hovering over
  map.addSource('highlight-hoveredschool-source', {
    type: 'geojson',
    data: {
      type: 'FeatureCollection',
      features: []
    }
  });

  // add a layer for the hovered school
  map.addLayer({
    id: 'highlight-hoveredschool-layer',
    type: 'circle',
    source: 'highlight-hoveredschool-source',
    paint: {
      'circle-color': [ //color circle based on its overall grade
        'match',
        ['get', 'Overall_Grade_Letter'],
        'A-', colors[5],
        'A', colors[5],
        'A+', colors[5],
        'B-', colors[4],
        'B', colors[4],
        'B+', colors[4],
        'C-', colors[3],
        'C', colors[3],
        'C+', colors[3],
        'D-', colors[2],
        'D', colors[2],
        'D+', colors[2],
        'E-', colors[1],
        'E', colors[1],
        'E+', colors[1],
        'F-', colors[0],
        'F', colors[0],
        'F+', colors[0],
        'black' // no grade
      ],
      'circle-stroke-color': [ //use same data styling as for original layer
        'match',
        ['get', 'Overall_Grade_Letter'],
        'A-', colors[5],
        'A', colors[5],
        'A+', colors[5],
        'B-', colors[4],
        'B', colors[4],
        'B+', colors[4],
        'C-', colors[3],
        'C', colors[3],
        'C+', colors[3],
        'D-', colors[2],
        'D', colors[2],
        'D+', colors[2],
        'E-', colors[1],
        'E', colors[1],
        'E+', colors[1],
        'F-', colors[0],
        'F', colors[0],
        'F+', colors[0],
        'black' // no grade
      ],
      'circle-stroke-width': 1.5, //stroke color and stroke width give the effect of the circle becoming slightly larger upon hovering
    },
    'circle-opacity': 1
  });

  // Create a popup, but don't add it to the map yet. This will be the hover popup
  var popup = new mapboxgl.Popup({
    closeButton: false,
    closeOnClick: false
  });

  // Function to query rendered features for the station the user is hovering over, then populate popup with that station's info
  map.on('mousemove', function(e) {
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


      window['popupContent'] = `
        <div style = "font-family:sans-serif; font-size:14px; font-weight:bold">${school_name} (${overall_grade})</div>
      `;

      //fix the position of the popup as the position of the circle:
      popup.setLngLat(hoveredFeature.geometry.coordinates).setHTML(popupContent).addTo(map);
      //create and populate a feature with the properties of the hoveredFeature necessary for data-driven styling of the highlight layer
      var hoveredFeature_data = {
        'type': 'Feature',
        'geometry': hoveredFeature.geometry,
        'properties': {
          'Overall_Grade_Letter': overall_grade,
        },
      };
      // set this circle's geometry and properties as the data for the highlight source
      map.getSource('highlight-hoveredschool-source').setData(hoveredFeature_data);

      } else { //if len(features) <1
        // remove the Popup, change back to default cursor and clear data from the highlight data source
        popup.remove();
        map.getCanvas().style.cursor = '';
        map.getSource('highlight-hoveredschool-source').setData({
          'type': 'FeatureCollection',
          'features': []
        })
      }
  });

  // Create a popup for the click action, but don't add it to the map yet
  var popup_click = new mapboxgl.Popup({
  });

  map.on('click', 'schools-layer', function(e) {

    // get the clicked station's complex_id by querying the rendered features
    var features = map.queryRenderedFeatures(e.point, {
        layers: ['schools-layer'],
    });

    var clickedFeature = features[0]

    window['popupContent_click'] = `
      <div style = "font-family:sans-serif; font-size:14px; font-weight:bold">${clickedFeature.properties.School}</div>
      <div style = "font-family:sans-serif; font-size:13px; font-weight:bold">Overall Grade: ${clickedFeature.properties.Overall_Grade_Letter}</div>
      <br>
      <div style = "font-family:sans-serif; font-size:12px;">Curriculum: ${clickedFeature.properties.Curriculum}</div>
      <div style = "font-family:sans-serif; font-size:12px;">Research: ${clickedFeature.properties.Research}</div>
      <div style = "font-family:sans-serif; font-size:12px;">Community Engagement: ${clickedFeature.properties.Community_Engagement}</div>
      <div style = "font-family:sans-serif; font-size:12px;">Support for Student-Led Initiatives: ${clickedFeature.properties.Support_for_Student_Led_Initiatives}</div>
      <div style = "font-family:sans-serif; font-size:12px;">Sustainability: ${clickedFeature.properties.Sustainability}</div>
      <a target="_blank" rel="noopener noreferrer"
        href="${clickedFeature.properties.Link}">Download PHRC
      </a>
      `;

    popup_click.setLngLat(clickedFeature.geometry.coordinates).setHTML(window['popupContent_click']).addTo(map)

  });

})
