import React, { useContext, useState, useEffect } from "react";
import Grid from "@mui/material/Grid";
import Stack from "@mui/material/Stack";
import Box from "@mui/material/Box";
import { Selector } from "bq-react-lib";
import {
  Title,
  Item,
  SelectorTitle,
  MainTitle,
  MainSubTitle,
} from "../Sidebar/SidebarForms/sidebarformstyles";
import _ from "underscore";
import { GetStac, GetStacSearch, GetCOGBounds } from "../helpers/api";
import { useNavigate, useParams } from "react-router-dom";
import { FormGroup, FormControlLabel, Switch } from "@mui/material";

function IOSidebar(props: any) {
  const {
    t = (text: string) => text,
    setSelectedLayerURL,
    setSelectedLayerAssetName,
    setColormap,
    setColormapList,
    qualcmaps,
    quantcmaps,
    colormap,
    logIt,
    setIsTimeSeriesCollection,
    setTimeSeriesLayers,
  } = props;
  const [collectionList, setCollectionList] = useState([
    { option: "", value: "" },
  ]);
  const [selectedCollection, setSelectedCollection] = useState("");
  const [selectedLayer, setSelectedLayer] = useState("");
  const [level1List, setLevel1List] = useState([{ option: "", value: "" }]);
  const [selectedLevel1, setSelectedLevel1] = useState("1");
  const [level1Title, setLevel1Title] = useState("");
  const [showLevel1, setShowLevel1] = useState(false);
  const [level2List, setLevel2List] = useState([{ option: "", value: "" }]);
  const [selectedLevel2, setSelectedLevel2] = useState("1");
  const [level2Title, setLevel2Title] = useState("");
  const [showLevel2, setShowLevel2] = useState(false);
  const [level3List, setLevel3List] = useState([{ option: "", value: "" }]);
  const [selectedLevel3, setSelectedLevel3] = useState("1");
  const [level3Title, setLevel3Title] = useState("");
  const [showLevel3, setShowLevel3] = useState(false);
  const [bounds, setBounds] = useState([-80, 40, -60, 65]);

  interface defaultYearList {
    option: string;
    value: string;
  }

  const defaultYearList = Array.from({ length: 40 }, (_, i) => i + 1980).map(
    (v: any) => ({
      option: v,
      value: v,
    })
  );
  const [yearList, setYearList] = useState(defaultYearList);

  const navigate = useNavigate();

  interface Params {
    collection: string;
    item: string;
  }
  const { collection, item } = useParams<keyof Params>() as Params;

  interface monthList {
    option: string;
    value: string;
  }

  const monthList = Array.from({ length: 12 }, (_, i) => i + 1).map(
    (v: any) => ({
      option: v,
      value: v,
    })
  );

  const timeSeriesCollections = ["fragmentation-rmf"];

  interface chelsaVariableList {
    option: string;
    value: string;
  }

  const chelsaVariableList = [
    {
      option: "Mean daily air temperature - tas",
      value: "tas",
    },
    {
      option: "Mean daily minimum air temperature - tasmin",
      value: "tasmin",
    },
    {
      option: "Mean daily maximum 2m air temperature - tasmax",
      value: "tasmax",
    },
    {
      option: "Cloud area fraction - clt",
      value: "clt",
    },
    {
      option: "Climate moisture index - cmi",
      value: "cmi",
    },
    {
      option: "Near-surface relative humidity - hurs",
      value: "hurs",
    },
    {
      option: "Potential evapotranspiration - pet_penman",
      value: "pet_penman",
    },
    {
      option: "Precipitation amount - pr",
      value: "pr",
    },
    {
      option: "Near-surface wind speed - sfcWind",
      value: "sfcWind",
    },
    {
      option: "Vapor pressure deficit",
      value: "vpd",
    },
  ];

  const mammalsScenariosList = [
    { option: "SSP2-RCP4.5", value: "1" },
    { option: "SSP3-RCP6.0", value: "2" },
    { option: "SSP4-RCP6.0", value: "3" },
    { option: "SSP5-RCP8.5", value: "4" },
  ];

  const mammalsYearsList = [
    { option: "2015", value: "2015" },
    { option: "2020", value: "2020" },
    { option: "2025", value: "2025" },
    { option: "2030", value: "2030" },
    { option: "2035", value: "2035" },
    { option: "2040", value: "2040" },
    { option: "2045", value: "2045" },
    { option: "2050", value: "2050" },
    { option: "2055", value: "2055" },
  ];

  const handleCollectionChange = async (e: any) => {
    setSelectedCollection(e.value);
    setTimeSeriesLayers([]);
    if (e.value === "chelsa-monthly") {
      setShowLevel1(true);
      setShowLevel2(true);
      setShowLevel3(true);
      //Route set the item
      setLevel1List(chelsaVariableList);
      setLevel2List(defaultYearList);
      setLevel3List(monthList);
      setLevel1Title("Variable");
      setLevel2Title("Year");
      setLevel3Title("Month");
    } else if (e.value === "global-mammals") {
      setShowLevel1(true);
      setShowLevel2(true);
      setShowLevel3(true);
      setLevel2List(mammalsScenariosList);
      setLevel3List(mammalsYearsList);
      setShowLevel1(true);
      setLevel1Title("Species");
      setShowLevel2(true);
      setLevel2Title("Scenario");
      setShowLevel3(true);
      setLevel3Title("Year");
      GetStacSearch({
        query: {
          scenario: { eq: "SSP5-RCP8.5" },
        },
        datetime: "2015-01-01T00:00:00Z",
        limit: 500,
        offset: 500,
      }).then((res: any) => {
        let items: any = res.data.features.map((c: any) => ({
          option: c.properties.species.replace("_", " "),
          value: c.properties.species,
        }));
        setLevel1List(items);
      });
    } else {
      setShowLevel2(false);
      setShowLevel3(false);
      setShowLevel1(true);
      setLevel1Title("Variable");
      let timeSeriesLayers: any = [];
      GetStac(`/collections/${e.value}/items`, { limit: 200 }).then(
        (res: any) => {
          let items: any = "";

          if (res.data) {
            items = res.data.features.map((c: any) => {
              let option = c.properties.description;
              if (
                c.collection === "esacci-lc" ||
                c.collection === "fragmentation-rmf"
              ) {
                option = c.properties.year;
              } else if (c.collection === "chelsa-clim-proj") {
                option = `${c.properties.variable}-${c.properties.rcp}-${c.properties.model}`;
              } else if (c.collection === "soilgrids") {
                option = `${c.properties.variable}-${c.properties.depth}`;
              }
              if (c.collection === "fragmentation-rmf") {
                timeSeriesLayers.push({
                  ref: c.properties.year.toString(),
                  url: c.assets.data.href,
                });
              }
              return {
                option: option,
                value: c.id,
              };
            });
          }
          setTimeSeriesLayers(timeSeriesLayers);
          setLevel1List(items);
        }
      );
    }
  };

  const handleLayerChange = () => {
    if (selectedLevel1) {
      let val = "";
      if (selectedCollection === "chelsa-monthly") {
        let month = "";
        if (parseInt(selectedLevel3) < 10) {
          month = `0${parseInt(selectedLevel3)}`;
        } else {
          month = selectedLevel3;
        }
        val = `${selectedLevel1}_${month}_${selectedLevel2}`;
      } else if (selectedCollection === "global-mammals") {
        val = `${selectedLevel1}_${selectedLevel2}_${selectedLevel3}`;
      } else {
        val = selectedLevel1;
      }
      if (val.indexOf("-lc") !== -1 || val.indexOf("cobertura") !== -1) {
        setColormap("tab10");
        setColormapList(qualcmaps);
      } else if (qualcmaps.includes(colormap)) {
        setColormap("inferno");
        setColormapList(quantcmaps);
      }

      GetStac(`/collections/${selectedCollection}/items/${val}`, {}).then(
        (res: any) => {
          if (res.data) {
            setSelectedLayerURL(
              res.data.assets[Object.keys(res.data.assets)[0]].href
            );
            setSelectedLayerAssetName(Object.keys(res.data.assets)[0]);
            navigate(`/viewer/${selectedCollection}/${val}`);
          }
        }
      );
    }
  };

  const handleLevel1Change = (e: any) => {
    setSelectedLevel1(e.value);
  };
  const handleLevel2Change = (e: any) => {
    setSelectedLevel2(e.value);
  };

  const handleLevel3Change = (e: any) => {
    setSelectedLevel3(e.value);
  };

  useEffect(() => {
    handleLayerChange();
  }, [selectedLevel1, selectedLevel2, selectedLevel3]);

  useEffect(() => {
    setIsTimeSeriesCollection(false);
    if (timeSeriesCollections.includes(collection)) {
      setIsTimeSeriesCollection(true);
    }
  }, [selectedCollection]);

  useEffect(() => {
    GetStac("/collections", {}).then((res: any) => {
      const items: any = res.data.collections
        .map((c: any) => ({
          option: c.title,
          value: c.id,
        }))
        .sort(function (a: any, b: any) {
          if (a.option < b.option) {
            return -1;
          }
          if (a.option > b.option) {
            return 1;
          }
          return 0;
        });
      setCollectionList(items);
    });
  }, []);

  useEffect(() => {
    if (collection) {
      handleCollectionChange({ value: collection }).then(() => {
        if (item) {
          if (collection === "global-mammals") {
            const tt: any = item.split("_");
            setSelectedLevel1(`${tt[0]}_${tt[1]}`);
            setSelectedLevel2(tt[2]);
            setSelectedLevel3(tt[3]);
          } else if (collection === "chelsa-monthly") {
            const tt: any = item.split("_");
            setSelectedLevel1(tt[0]);
            let month = "1";
            if (parseInt(tt[2]) < 10) {
              month = `0${parseInt(tt[2])}`;
            } else {
              month = tt[2];
            }
            setSelectedLevel2(month);
            setSelectedLevel3(tt[1]);
          } else {
            setSelectedLevel1(item);
          }
          setSelectedLayer(item);
        }
      });
    }
  }, [collection, item]);

  return (
    <Grid sx={{ width: "300px", marginLeft: "15px" }}>
      <Title>
        <MainTitle>{import.meta.env.VITE_TITLE}</MainTitle>
        <MainSubTitle>{import.meta.env.VITE_DESCRIPTION}</MainSubTitle>
      </Title>
      <Stack spacing={{ xs: 1, sm: 2, md: 2 }} sx={{ width: "100%" }}>
        <Item>
          <SelectorTitle>Collection</SelectorTitle>
          <Selector
            selectorList={collectionList}
            selectorId="layer-collection"
            value={selectedCollection}
            onValueChange={handleCollectionChange}
            t={t}
          />
        </Item>

        {showLevel1 && (
          <Item>
            <SelectorTitle>{level1Title}</SelectorTitle>
            <Selector
              selectorList={level1List}
              value={selectedLevel1}
              selectorId="level1"
              onValueChange={handleLevel1Change}
              t={t}
            />
          </Item>
        )}
        {showLevel2 && (
          <Item>
            <SelectorTitle>{level2Title}</SelectorTitle>
            <Selector
              selectorList={level2List}
              value={selectedLevel2}
              selectorId="level2"
              onValueChange={handleLevel2Change}
              t={t}
            />
          </Item>
        )}
        {showLevel3 && (
          <Item>
            <SelectorTitle>{level3Title}</SelectorTitle>
            <Selector
              selectorList={level3List}
              value={selectedLevel3}
              selectorId="level3"
              onValueChange={handleLevel3Change}
              t={t}
            />
          </Item>
        )}
        <FormGroup sx={{}}>
          <FormControlLabel
            sx={{ textShadow: "1px 1px 1px #000000" }}
            control={<Switch onChange={logIt} color="secondary" />}
            label="SQRT transform?"
          />
        </FormGroup>
      </Stack>
      <Box
        sx={{
          width: "50%",
        }}
      />
    </Grid>
  );
}

export default IOSidebar;
