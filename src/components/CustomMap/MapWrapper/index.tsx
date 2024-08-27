/* eslint-disable dot-notation */
import React, { useState, useEffect } from "react";
import { MapContainer, ScaleControl, ZoomControl, Popup } from "react-leaflet";
import L from "leaflet";
import Control from "react-leaflet-custom-control";
import {
  Button,
  Autocomplete,
  Box,
  TextField,
  Typography,
} from "@mui/material";
import InsightsIcon from "@mui/icons-material/Insights";
import AddLocationAltIcon from "@mui/icons-material/AddLocationAlt";
import TravelExploreIcon from "@mui/icons-material/TravelExplore";
import BarChartIcon from "@mui/icons-material/BarChart";
import DeleteForeverIcon from "@mui/icons-material/DeleteForever";
import MSMapSlider from "../MSMapSlider";
import CustomLayer from "../CustomLayer";
import { MapWrapperContainer } from "../custommapstyles";
import Digitizer from "../../Digitizer";
import type { FeatureCollection } from "geojson";
import { LatLngExpression } from "leaflet";

import StatsModal from "../../StatsModal";
import {
  GetCOGStatsGeojson,
  GetCountryList,
  GetStateList,
  GetCountryStats,
  GetCountryGeojson,
  GetStateGeojson,
  GetMultipleCOGStatsGeojson,
} from "../../helpers/api";
import { popup } from "leaflet";

/**
 *
 * @param props properties
 * @returns component
 */
function MapWrapper(props: any) {
  //const generalState = useSelector((state: any) => state.reducerState);
  //const drawerOpen = useSelector((state: any) => state.reducerState.drawerOpen);
  const { selectedLayerURL, isTimeSeriesCollection, timeSeriesLayers } = props;
  const [mapWidth, setMapWidth] = useState("100vw");
  const [opacity, setOpacity] = useState("80");
  const [openStatsModal, setOpenStatsModal] = useState(false);
  const [showStatsButton, setShowStatsButton] = useState(false);
  const [activeSearch, setActiveSearch] = useState(false);
  const [countryList, setCountryList] = useState([]);
  const [stateList, setStateList] = useState([]);
  const [selectedCountry, setSelectedCountry] = useState("");
  const [selectedState, setSelectedState] = useState("");
  const [clickedPlace, setClickedPlace] = useState("");
  const [popupOpen, setPopupOpen] = useState(false);
  const [popupProps, setPopupProps] = useState({
    key: 0,
    position: L.latLng(0, 0),
  });
  const emptyFC: FeatureCollection = {
    type: "FeatureCollection",
    features: [],
  };

  let numPopups = 0;
  const [geojson, setGeojson] = useState<FeatureCollection>(emptyFC);
  const [rasterStats, setRasterStats] = useState({});
  const [timeSeriesStats, setTimeSeriesStats] = useState({});

  const handleCountryChange = (value: any, reason: any) => {
    if (reason === "clear") {
      setActiveSearch(false);
    }
    if (value) {
      setShowStatsButton(true);
      GetStateList(value).then((sl) => {
        setStateList(sl.data);
      });
    }
    setSelectedState("");
    setSelectedCountry(value);
  };

  const handleStateChange = (value: any, reason: any) => {
    if (reason === "clear") {
      setActiveSearch(false);
    }
    if (value) {
      setShowStatsButton(true);
    }
    setSelectedState(value);
  };

  const handleAddLocationChange = (value: any) => {
    if (selectedCountry !== "" && selectedState === "") {
      GetCountryGeojson(selectedCountry).then((g: any) => {
        if (g.data) {
          const gj = { ...geojson };
          g.data.features.forEach((f: any) => {
            f.properties.place = selectedCountry;
          });
          gj.features.push(g.data.features[0]);
          setGeojson(gj);
        }
      });
    } else if (selectedCountry !== "" && selectedState !== "") {
      GetStateGeojson(selectedState, selectedCountry).then((g: any) => {
        if (g.data) {
          const gj = { ...geojson };
          g.data.features.forEach((f: any) => {
            f.properties.place = selectedState;
          });
          gj.features.push(g.data.features[0]);
          setGeojson(gj);
        }
      });
    }
  };

  const generateStats = (place: string = "") => {
    setRasterStats({});
    setTimeSeriesStats({});
    setOpenStatsModal(true);
    let gg = { ...geojson };
    if (place !== "" && geojson?.features.length > 0) {
      gg.features = geojson.features.filter(
        (g: any) => g.properties.place === place
      );
    }
    if (gg?.features.length > 0) {
      let i = 0;
      GetCOGStatsGeojson(selectedLayerURL, gg).then((g: any) => {
        const rs: any = {};
        if (g.data) {
          g.data.features.map((m: any) => {
            if (m.properties.place === "Area") {
              m.properties.place = `Area_${i}`;
              i += 1;
            }
            rs[m.properties.place] = m.properties.statistics;
          });
          setRasterStats(rs);
        }
      });
    }
    if (selectedCountry && selectedLayerURL) {
      setOpenStatsModal(true);
      setShowStatsButton(true);
    }
  };

  const generateTimeSeries = () => {
    setRasterStats({});
    setTimeSeriesStats({});
    setOpenStatsModal(true);
    if (geojson?.features.length > 0) {
      GetMultipleCOGStatsGeojson(geojson, timeSeriesLayers).then((st: any) => {
        if (st?.data) {
          setTimeSeriesStats(st.data);
        }
      });
    }
    if (selectedCountry && selectedLayerURL) {
      setOpenStatsModal(true);
      setShowStatsButton(true);
    }
  };

  useEffect(() => {
    GetCountryList().then((cl) => {
      setCountryList(cl.data);
    });
  }, []);

  useEffect(() => {
    setShowStatsButton(false);
    if (geojson.features.length > 0) {
      setShowStatsButton(true);
    }
  }, [geojson]);

  const popitup = (e: any, place: string) => {
    setPopupProps({
      key: numPopups++,
      position: e.latlng,
    });
    setPopupOpen(true);
    setClickedPlace(place);
  };

  const handleDeletePlace = (l: any) => {
    let geo = { ...geojson };
    const g = geo.features?.filter((f: any) => f.properties.place !== l);
    geo.features = g;
    setGeojson(geo);
    setPopupOpen(false);
  };
  /**
   * props for Customlayer component
   */

  return (
    <>
      <MapWrapperContainer>
        <MapContainer
          zoom={3}
          center={[20, 0]}
          zoomControl={false}
          style={{
            width: mapWidth,
            height: "calc(100vh)",
          }}
        >
          <CustomLayer
            {...props}
            opacity={opacity}
            style={{
              width: mapWidth,
            }}
          />
          <MSMapSlider
            absolute={true}
            location={"bottom-left"}
            bottom={40}
            left={10}
            width={200}
            notifyChange={(newValue: any) => setOpacity(newValue)}
            value={opacity}
          />
          <ZoomControl position="topright" />
          <ScaleControl position="bottomright" />
          <Digitizer
            geojson={geojson}
            setGeojson={setGeojson}
            setShowStatsButton={setShowStatsButton}
            handleDeletePlace={handleDeletePlace}
            popitup={popitup}
          />
          <Control position="topright">
            <Button
              sx={{
                background: "white",
                padding: "3px 0px 3px 0px",
                width: "auto",
                minWidth: "35px",
                border: "2px solid #00000077",
                display: `${showStatsButton ? "" : "none"}`, //Can't remove component since it crashes when there are no features
              }}
              onClick={() => generateStats()}
            >
              <BarChartIcon />
            </Button>
            <Button
              sx={{
                background: "white",
                padding: "3px 0px 3px 0px",
                width: "auto",
                minWidth: "35px",
                border: "2px solid #00000077",
                display: `${
                  showStatsButton && isTimeSeriesCollection ? "" : "none"
                }`, //Can't remove component since it crashes when there are no features
              }}
              onClick={generateTimeSeries}
            >
              <InsightsIcon />
            </Button>
          </Control>
          <Control position="topright">
            {activeSearch && (
              <Autocomplete
                id="combo-box-demo"
                autoComplete
                includeInputInList
                options={countryList}
                sx={{ width: 200 }}
                onChange={(event: any, newValue: any, reason: any) => {
                  handleCountryChange(newValue, reason);
                }}
                size="small"
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Country"
                    variant="filled"
                    sx={{ backgroundColor: "white" }}
                  />
                )}
              />
            )}
            {activeSearch && (
              <Autocomplete
                id="combo-box-demo"
                autoComplete
                includeInputInList
                options={stateList}
                sx={{ width: 200, margin: "2px 2px 2px 0px" }}
                onChange={(event: any, newValue: any, reason: any) => {
                  handleStateChange(newValue, reason);
                }}
                size="small"
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="State/Province"
                    variant="filled"
                    sx={{ backgroundColor: "white" }}
                  />
                )}
              />
            )}
            {!activeSearch && (
              <Button
                sx={{
                  background: "white",
                  padding: "3px 0px 3px 0px",
                  width: "auto",
                  minWidth: "35px",
                  border: "2px solid #00000077",
                }}
                onClick={() => {
                  setActiveSearch(true);
                }}
              >
                <TravelExploreIcon />
              </Button>
            )}
            {activeSearch && (
              <Button
                sx={{
                  background: "white",
                  padding: "3px 0px 3px 0px",
                  width: "auto",
                  minWidth: "35px",
                  border: "2px solid #00000077",
                  margin: "2px 2px 2px 0px",
                  float: "right",
                }}
                onClick={handleAddLocationChange}
              >
                <AddLocationAltIcon />
              </Button>
            )}
          </Control>
          {popupOpen && (
            <Popup
              key={`popup-${popupProps.key}`}
              position={popupProps.position}
            >
              <Box>
                <Typography sx={{ fontSize: "18px", fontWeight: "bold" }}>
                  {clickedPlace}
                </Typography>
                <Button
                  sx={{
                    background: "white",
                    padding: "3px 0px 3px 0px",
                    width: "auto",
                    minWidth: "35px",
                    border: "2px solid #00000077",
                    marginRight: "5px",
                  }}
                  onClick={() => {
                    generateStats(clickedPlace);
                  }}
                >
                  <BarChartIcon />
                </Button>
                <Button
                  sx={{
                    background: "white",
                    padding: "3px 0px 3px 0px",
                    width: "auto",
                    minWidth: "35px",
                    border: "2px solid #00000077",
                  }}
                  onClick={() => {
                    handleDeletePlace(clickedPlace);
                  }}
                >
                  <DeleteForeverIcon />
                </Button>
              </Box>
            </Popup>
          )}
        </MapContainer>
        <StatsModal
          rasterStats={rasterStats}
          timeSeriesStats={timeSeriesStats}
          setOpenStatsModal={setOpenStatsModal}
          openStatsModal={openStatsModal}
          selectedCountry={selectedCountry}
        />
      </MapWrapperContainer>
    </>
  );
}

export default MapWrapper;
