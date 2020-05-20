import axios from 'axios'
import { nanoid } from 'nanoid'

const hashCode = (str) => {
  var hash = 0;
  for (var i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  return hash;
}

const intToRGB = (i) => {
  var c = (i & 0x00FFFFFF)
    .toString(16)
    .toUpperCase();

  return "00000".substring(0, 6 - c.length) + c;
}

export const getRoute = async (map, token, id, coords) => {
  const url = `https://api.mapbox.com/directions/v5/mapbox/driving/${coords}?geometries=geojson&access_token=${token}`
  const { data } = await axios.get(url)
  const coordinates = data.routes[0].geometry.coordinates
  // const coordinates = Route3.routes[0].geometry.coordinates
  const color = intToRGB(hashCode(nanoid()))
  if (map.getSource(id)) {
    map.getSource(id).setData({
      'type': 'Feature',
      'properties': {},
      'geometry': {
        'type': 'LineString',
        'coordinates': coordinates
      }
    });
  }
  else {
    map.addLayer({
      'id': id,
      'type': 'line',
      'source': {
        'type': 'geojson',
        'data': {
          'type': 'Feature',
          'properties': {},
          'geometry': {
            'type': 'LineString',
            'coordinates': coordinates
          }
        }
      },
      'layout': {
        'line-join': 'round',
        'line-cap': 'round'
      },
      'paint': {
        'line-color': '#' + color,
        'line-width': 5,
        'line-opacity': 0.75
      }
    })
  }
  const distance = parseFloat(data.routes[0].distance) / 1000
  const duration = formatDuration(data.routes[0].duration)
  const destination = data.waypoints[0].name
  const origin = data.waypoints[1].name
  return { distance: distance.toFixed(2), duration, origin, destination }
}
const formatDuration = (duration) => {
  var seconds = parseInt(duration, 10);

  var days = Math.floor(seconds / (3600 * 24));
  seconds -= days * 3600 * 24;
  var hrs = Math.floor(seconds / 3600);
  seconds -= hrs * 3600;
  var mnts = Math.floor(seconds / 60);
  seconds -= mnts * 60;
  let result = []
  if (days) {
    result.push(days + " days")
  }
  if (hrs) {
    result.push(hrs + " hours")
  }
  if (mnts) {
    result.push(mnts + " minutes")
  }
  return result.join(', ')
}

export const createGeofence = function (center, radiusInKm, points) {
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


    // map.on('click', function (e) {
    //   var coordsObj = e.lngLat;
    //   var coords = Object.keys(coordsObj).map(function (key) {
    //     return coordsObj[key];
    //   });
    //   var end = {
    //     type: 'FeatureCollection',
    //     features: [{
    //       type: 'Feature',
    //       properties: {},
    //       geometry: {
    //         type: 'Point',
    //         coordinates: coords
    //       }
    //     }
    //     ]
    //   }
    //   if (map.getLayer('end')) {
    //     map.getSource('end').setData(end);
    //   } else {
    //     map.addLayer({
    //       id: 'end',
    //       type: 'circle',
    //       source: {
    //         type: 'geojson',
    //         data: {
    //           type: 'FeatureCollection',
    //           features: [{
    //             type: 'Feature',
    //             properties: {},
    //             geometry: {
    //               type: 'Point',
    //               coordinates: coords
    //             }
    //           }]
    //         }
    //       },
    //       paint: {
    //         'circle-radius': 10,
    //         'circle-color': '#f30'
    //       }
    //     });
    //   }
    //   getRoute(map, mapboxToken, `-121.215061,40.648229;${coords[0]},${coords[1]}`);
    // });