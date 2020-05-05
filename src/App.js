// import axios from 'axios'
import React, { useState, useEffect, useRef } from 'react';
import mapboxgl from 'mapbox-gl'
import './App.css'

const mapboxToken = process.env.REACT_APP_MAPBOX_TOKEN
mapboxgl.accessToken = mapboxToken

const assetsData = {
  'type': 'FeatureCollection',
  'features': [
    {
      'type': 'Feature',
      'geometry': {
        'type': 'Point',
        'coordinates': [-121.215061, 40.648229],
      },
      'properties': {
        'description': "Asset 1",
      },
    },
    {
      'type': 'Feature',
      'geometry': {
        'type': 'Point',
        'coordinates': [-121.505684, 40.468084]
      },
      'properties': {
        'description': "Asset 2",
        "geofenceStatus": "INSIDE"
      },
    },
    {
      'type': 'Feature',
      'geometry': {
        'type': 'Point',
        'coordinates': [-121.354465, 40.360737]
      },
      'properties': {
        'description': "Asset 3",
      },
    }
  ]
}
const createGeoJSONCircle = function (center, radiusInKm, points) {
  if (!points) points = 64;
  var coords = {
    latitude: center[1],
    longitude: center[0]
  };
  var km = radiusInKm;
  var ret = [];
  var distanceX = km / (111.320 * Math.cos(coords.latitude * Math.PI / 180));
  var distanceY = km / 110.574;
  var theta, x, y;
  for (var i = 0; i < points; i++) {
    theta = (i / points) * (2 * Math.PI);
    x = distanceX * Math.cos(theta);
    y = distanceY * Math.sin(theta);

    ret.push([coords.longitude + x, coords.latitude + y]);
  }
  ret.push(ret[0]);

  return {
    "type": "geojson",
    "data": {
      "type": "FeatureCollection",
      "features": [{
        "type": "Feature",
        "geometry": {
          "type": "Polygon",
          "coordinates": [ret]
        }
      }]
    }
  };
}

function App() {
  const [config, setConfig] = useState({
    zoom: 10.5,
    center: [-121.359684, 40.483084],
    dst: [-121.499684, 40.473084],
  })
  let mapContainer = useRef(null);
  useEffect(() => {
    const map = new mapboxgl.Map({
      container: mapContainer,
      style: 'mapbox://styles/mapbox/streets-v11',
      center: config.center,
      zoom: config.zoom
    })
    map.on("style.load", () => {
      onLoad(map)
    });
  }, [])
  const onLoad = async (map) => {
    map.addSource("geofences", createGeoJSONCircle(config.dst, 1));
    map.addSource('assets', {
      'type': 'geojson',
      'data': assetsData
    })
    map.addLayer({
      'id': 'geofences',
      'type': 'fill',
      'source': 'geofences',
      'paint': {
        'fill-color': '#888888',
        'fill-opacity': 0.4
      },
      'filter': ['==', '$type', 'Polygon']
    });

    map.addLayer({
      'id': 'assets',
      'type': 'circle',
      'source': 'assets',
      'paint': {
        "circle-radius": [
          "interpolate",
          ["exponential", 1.2],
          ["zoom"],
          0,
          5,
          16,
          10
        ],
        "circle-color": [
          "case",
          ["==", ["get", "geofenceStatus"], "INSIDE"],
          "red",
          "blue"
        ],
      },
      'filter': ['==', '$type', 'Point']
    });
    assetsData.features.map(el => {
      new mapboxgl.Popup({
        closeButton: false,
        closeOnClick: false
      })
        .setLngLat(el.geometry.coordinates)
        .setHTML(el.properties.description)
        .addTo(map);
    })
    // map.on('mouseenter', 'assets', function (e) {
    //   map.getCanvas().style.cursor = 'pointer';
    //   var coordinates = e.features[0].geometry.coordinates.slice();
    //   var description = e.features[0].properties.description;
    //   while (Math.abs(e.lngLat.lng - coordinates[0]) > 180) {
    //     coordinates[0] += e.lngLat.lng > coordinates[0] ? 360 : -360;
    //   }
    //   popup
    //     .setLngLat(coordinates)
    //     .setHTML(description)
    //     .addTo(map);
    // });

    // map.on('mouseleave', 'assets', function () {
    //   map.getCanvas().style.cursor = '';
    //   popup.remove();
    // });
  }
  return (
    <div>
      <div ref={el => mapContainer = el} className="mapContainer" />
    </div>
  );
}

export default App;
