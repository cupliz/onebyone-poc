import axios from 'axios'
import React, { useState, useEffect, useRef } from 'react';
import mapboxgl from 'mapbox-gl'
import './App.css'
import { createGeofence, getRoute } from './helpers'
import Assets from './data/assets.json'

const mapboxToken = process.env.REACT_APP_MAPBOX_TOKEN
mapboxgl.accessToken = mapboxToken

function App() {
  let mapContainer = useRef(null);
  const [config, setConfig] = useState({
    zoom: 10.5,
    minZoom: 4,
    center: [-121.359684, 40.483084],
  })

  useEffect(() => {
    const map = new mapboxgl.Map({
      container: mapContainer,
      style: 'mapbox://styles/mapbox/streets-v11',
      center: config.center,
      zoom: config.zoom,
      minZoom: config.minZoom
    })
    map.on("style.load", async () => {
      await onLoad(map)
    })
  }, [])
  const dst = Assets.data.features[0].geometry.coordinates
  const onLoad = async (map) => {

    Assets.data.features.map(async el => {
      if (el.properties.description) {
        const coords = el.geometry.coordinates
        const data = await getRoute(map, mapboxToken, el.properties.name, `${dst[0]},${dst[1]};${coords[0]},${coords[1]}`);
        console.log(data)
        new mapboxgl.Popup({
          closeButton: false,
          closeOnClick: false
        })
          .setLngLat(el.geometry.coordinates)
          .setHTML(`
            <p>
            <b>${el.properties.description}</b> <br/>
            Distance: ${data.distance} <br/>
            ETA: ${data.duration}
            </p>
          `)
          .addTo(map);
      }
    })

    map.addLayer({
      'id': 'dstGeofence',
      'type': 'fill',
      'source': createGeofence(dst, 3),
      'paint': {
        'fill-color': '#888888',
        'fill-opacity': 0.4
      },
      'filter': ['==', '$type', 'Polygon']
    });

    map.addLayer({
      'id': 'assets',
      'type': 'circle',
      'source': Assets,
      'paint': {
        "circle-radius": 6,
        "circle-color": ["case", ["==", ["get", "geofenceStatus"], "INSIDE"], "red", "blue"],
      },
      'filter': ['==', '$type', 'Point']
    });

    map.on('click', function (e) {
      var coordsObj = e.lngLat;
      var coords = Object.keys(coordsObj).map(function (key) {
        return coordsObj[key];
      });
      console.log(coords)
    });

  }
  return (
    <div>
      <div ref={el => mapContainer = el} className="mapContainer" />
    </div>
  );
}

export default App;
