import axios from 'axios'
import React, { useState, useEffect, useRef } from 'react';
import mapboxgl from 'mapbox-gl'
import './App.css'
import { createGeofence, getRoute } from './helpers'
import Assets from './data/assets.json'
import {
  IoMdSearch, IoMdCar, IoIosArrowDropright,
  IoIosRadioButtonOn, IoIosSettings, IoMdClipboard,
  IoMdLocate
} from "react-icons/io";
import { BsSearch, BsTerminal, BsBell, BsGearFill, BsChevronRight } from "react-icons/bs";
import { FaDotCircle } from "react-icons/fa";
import { FiChevronRight } from "react-icons/fi";
import { AiOutlineCalendar, AiOutlineBell, AiOutlineRightCircle, AiOutlineRight } from "react-icons/ai";

const mapboxToken = process.env.REACT_APP_MAPBOX_TOKEN
mapboxgl.accessToken = mapboxToken
const activity = [
  { id: 1, status: 'IN TRANSIT', flag: 'EARLY', ref: '0011.765', distance: 4 },
  { id: 2, status: 'PICKUP', flag: 'EARLY', ref: '0010.965', distance: 22 },
  { id: 3, status: 'PICKUP', flag: 'ON TIME', ref: '0010.332', distance: 46 },
  { id: 4, status: 'DROP', flag: 'ON TIME', ref: '0010.222', distance: 2 },
  { id: 5, status: 'STOPPED', flag: '23 MINS', },
  { id: 6, status: 'PICKUP', flag: 'ON TIME', ref: '0009.965', distance: 41 },
  { id: 7, status: 'PICKUP', flag: 'LATE', ref: '0006.112', distance: 0 },
]
const activity2 = [
  { id: 4, status: 'DROP', flag: 'EARLY', ref: '0010.222', distance: 2 },
  { id: 3, status: 'PICKUP', flag: 'EARLY', ref: '0010.332', distance: 46 },
  { id: 2, status: 'PICKUP', flag: 'ON TIME', ref: '0010.965', distance: 22 },
  { id: 1, status: 'IN TRANSIT', flag: 'EARLY', ref: '0011.765', distance: 4 },
  { id: 6, status: 'PICKUP', flag: 'ON TIME', ref: '0009.965', distance: 41 },
]

export default () => {
  let mapContainer = useRef(null);
  const [config, setConfig] = useState({
    zoom: 10.5,
    minZoom: 4,
    center: [-121.359684, 40.483084],
  })
  const [page, setPage] = useState('detail')

  const dst = Assets.data.features[0].geometry.coordinates
  useEffect(() => {
    if (mapContainer.current !== null) {

      const map = new mapboxgl.Map({
        container: mapContainer,
        style: 'mapbox://styles/mapbox/streets-v11',
        center: [dst[0] - 0.2, dst[1]],
        zoom: config.zoom,
        minZoom: config.minZoom
      })
      map.on("style.load", async () => {
        await onLoad(map)
      })
    }
  }, [])
  const onLoad = async (map) => {
    Assets.data.features.map(async el => {
      if (el.properties.name) {
        const coords = el.geometry.coordinates
        const data = await getRoute(map, mapboxToken, el.properties.name, `${dst[0]},${dst[1]};${coords[0]},${coords[1]}`);
        console.log(data)

        var marker = document.createElement('div');
        marker.className = 'marker';
        if (el.properties.geofenceStatus == 'INSIDE') {
          marker.className = 'marker inside';
        }
        new mapboxgl.Marker(marker)
          .setLngLat(el.geometry.coordinates)
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
        "circle-color": ["case", ["==", ["get", "geofenceStatus"], "INSIDE"], "#e53935", "#2da7e0"],
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
  const styleFlag = (text) => {
    if (text === 'EARLY') {
      return 'text-success'
    }
    if (text === 'ON TIME') {
      return 'text-muted'
    }
    return 'text-warning'
  }
  const togglePage = (tp) => {
    if (tp == page) {
      setPage(null)
    } else {
      setPage(tp)
    }
  }
  return (
    <div>
      <div ref={el => mapContainer = el} className="mapContainer" />

      <div className="sidebar">
        <a href="#1"><BsSearch /></a>
        <a href="#2"><IoMdCar /></a>
        <a href="#3" className={page === 'detail' ? 'active' : null} onClick={() => togglePage('detail')}><AiOutlineRightCircle /></a>
        <a href="#4"><IoIosRadioButtonOn /></a>
        <a href="#5"><BsBell /></a>
        <a href="#6"><BsTerminal /></a>
        <a href="#7"><BsGearFill /></a>
      </div>
      {page === 'detail' ?
        <div className="content">

          <div className="card opaque-8">
            <div className="card-body"> <h5><b className=" text-muted">Active / FoxxFleet:</b> Truck002 </h5></div>
          </div>

          <div className="card">
            <div className="card-header">
              <h5 className="text-muted"><IoMdCar className="mb-1" /> Mike Dicsone <button className="btn btn-sm btn-black float-right">AVE 44km</button></h5>
            </div>
            <div className="card-body">
              <div className="row">
                <span className="col text-muted"> STATUS: </span>
                <span className="col text-success"> Moving* </span>
                <span className="col text-muted"> PICKUP: </span>
                <span className="col"> Mascot 01 </span>
              </div>
              <div className="row">
                <span className="col text-muted"> CUSTOMER: </span>
                <span className="col"> Foxx </span>
                <span className="col text-muted"> DROP OFF: </span>
                <span className="col"> CLS, Pyrmont </span>
              </div>
              <div className="row">
                <span className="col text-muted"> TRIP NO: </span>
                <span className="col"> 0011 765 </span>
                <span className="col text-muted"> TRIP TIME: </span>
                <span className="col"> 8 minutes </span>
              </div>
              <div className="row">
                <span className="col text-muted"> ORDERS: </span>
                <span className="col"> 3 </span>
                <span className="col text-muted"> DROP TIME: </span>
                <span className="col"> 18 minutes </span>
              </div>
            </div>
            <div className="card-footer text-right">
              <button className="btn btn-sm btn-outline-secondary m-1">Dash Cam</button>
              <button className="btn btn-sm btn-outline-secondary m-1">SMS Driver</button>
              <button className="btn btn-sm btn-outline-secondary m-1">Edit Trip</button>
            </div>
          </div>

          <div className="card activity">
            <div className="card-header">
              <h5 className="text-muted"><IoIosArrowDropright className="mb-1" /> Activity</h5>
            </div>
            <div className="card-body">
              <div className="timeline">
                {activity.map((act, i) => (
                  <div className="row my-1" key={i}>
                    <div className="col-1 mr-auto text-primary"><i></i></div>
                    <div className="col-3 text-muted p-0">{act.status}</div>
                    <div className={`col-2 p-0 ${styleFlag(act.flag)}`}>{act.flag}</div>
                    <div className="col-3 p-0 pl-2">
                      {act.ref ?
                        <span className="text-muted">NO.<b className="text-dark-gray">{act.ref}</b></span>
                        : ''}
                    </div>
                    <div className="col-2 p-0 text-muted text-center">
                      {act.distance ?
                        <span><b>{("0000" + act.distance).substr(-2, 2)}</b>KMS</span>
                        : null}
                      {act.distance === 0 && 'START'}
                    </div>
                    <div className={`col-1 ml-auto text-${act.status === 'STOPPED' ? 'warning' : 'muted'}`}>
                      <IoMdLocate />
                    </div>
                  </div>
                ))}
              </div>
              <div className="text-muted m-0 ml-3 mt-4">3 FEBRUARY </div>
              <div className="timeline dash">
                {activity2.map((act, i) => (
                  <div className="row my-1" key={i}>
                    <div className="col-1 mr-auto text-primary"><i></i></div>
                    <div className="col-3 text-muted p-0">{act.status}</div>
                    <div className={`col-2 p-0 ${styleFlag(act.flag)}`}>{act.flag}</div>
                    <div className="col-3 p-0 pl-2">
                      {act.ref ?
                        <span className="text-muted">NO.<b className="text-dark-gray">{act.ref}</b></span>
                        : ''}
                    </div>
                    <div className="col-2 p-0 text-muted text-center">
                      {act.distance ?
                        <span><b>{("0000" + act.distance).substr(-2, 2)}</b>KMS</span>
                        : null}
                      {act.distance === 0 && 'START'}
                    </div>
                    <div className={`col-1 ml-auto text-${act.status === 'STOPPED' ? 'warning' : 'muted'}`}>
                      <IoMdLocate />
                    </div>
                  </div>
                ))}
              </div>

            </div>
          </div>

        </div>
        : null
      }
      <div className="card opaque-8 status-bar">
        <div className="card-body">
          <span><AiOutlineCalendar /> <sup className="badge badge-primary">3</sup></span>
          <span><AiOutlineBell /> <sup className="badge badge-primary">3</sup></span>
          <span className="float-right"> <FaDotCircle className="mb-1" /> &nbsp; John Doe <FiChevronRight className="mb-1" /></span>
        </div>
      </div>
      <div className="export dropdown">
        <button className="btn btn-sm btn-secondary dropdown-toggle">
          <span className="mr-4">Export</span>
        </button>

        <div className="dropdown-menu" aria-labelledby="dropdownMenuLink">
          <a className="dropdown-item" href="#">Action</a>
          <a className="dropdown-item" href="#">Another action</a>
          <a className="dropdown-item" href="#">Something else here</a>
        </div>
      </div>
    </div>
  );
}
