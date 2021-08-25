mapboxgl.accessToken = 'pk.eyJ1Ijoia25hbmFuIiwiYSI6ImNrbDlsMXNmNjI3MnEyb25yYjNremFwYXQifQ.l6loLOR-pOL_U2kzWBSQNQ';

// 1. Initialize mapboxgl map and insert into mapcontainer div:
var map = new mapboxgl.Map({
  container: 'mapcontainer', // container ID
  style: 'mapbox://styles/knanan/ckle1rswq26lu17paw71lych7', // style URL
  center: [-73.984, 40.7128], // starting position [lng, lat]
  zoom: 11.5 // starting zoom
});

// add navigation control:
// TO DO: disable scrollwheel zoom
map.addControl(new mapboxgl.NavigationControl({
  showCompass: false,
  showZoom: true
}));

map.on('style.load', function() {

  map.addSource('phrc-map-data', {
    type: 'geojson',
    data: 'data/2021_PHRC_Map.geojson'
  });

  map.addLayer({
    'id': 'schools-layer',
    'type': 'circle',
    'source': 'phrc-map-data',
    'paint': {
      'circle-color': 'black',//[ //color circle based on its subway lines going
      //   'match',
      //   ['get', 'line_color'],
      //   'blue', '#0039A6',
      //   'brown', '#996633',
      //   'gray', '#A7A9AC',
      //   'green', '#00933C',
      //   'lightgreen', '#6CBE45',
      //   'orange', '#FF6319',
      //   'purple', '#B933AD',
      //   'red', '#EE352E',
      //   'shuttlegray', '#808183',
      //   'yellow', '#FCCC0A',
      //   'white' //'multiple' line_colors
      // ],
      'circle-opacity': 0.75
    },
  }); //, "settlement-subdivision-label"

})
