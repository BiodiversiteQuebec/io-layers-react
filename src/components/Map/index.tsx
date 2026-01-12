import { useEffect, useState, useRef, useCallback } from "react";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";

export default function Map(props: any) {
  const { selectedLayerTiles, opacity } = props;

  const [mapp, setMapp]: any = useState(null);
  const mapRef = useRef();

  useEffect(() => {
    // create the map on mount regardless of whether tiles are available yet
    if (!mapp) {
      const map = new maplibregl.Map({
        container: "App",
        zoom: 4,
        center: [-70, 53],
        style: {
          version: 8,
          projection: {
            type: "globe",
          },
          sources: {
            satellite: {
              url: "https://api.maptiler.com/tiles/satellite-v2/tiles.json?key=get_your_own_OpIi9ZULNHzrESv6T2vL",
              type: "raster",
            },
            cog: {
              type: "raster",
              // start empty; tiles will be set when selectedLayerTiles becomes available
              tiles: [selectedLayerTiles || ""],
              tileSize: 256,
            },
            terrain: {
              type: "raster-dem",
              tiles: [
                "https://tiler.biodiversite-quebec.ca/cog/tiles/{z}/{x}/{y}?url=https://object-arbutus.cloud.computecanada.ca/bq-io/io/earthenv/topography/elevation_1KMmn_GMTEDmn.tif&rescale=0,2013&bidx=1&expression=b1",
              ],
              tileSize: 256,
            },
            background: {
              type: "raster",
              tiles: [
                "https://01.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png",
              ],
              tileSize: 256,
            },
          },
          terrain: { source: "terrain", exaggeration: 0.025 },
          layers: [
            {
              id: "back",
              type: "raster",
              source: "background",
            },

            {
              id: "cog",
              type: "raster",
              source: "cog",
              paint: {
                "raster-opacity": opacity / 100,
              },
            },
            {
              id: "hillsh",
              type: "hillshade",
              source: "terrain",
              paint: {
                "hillshade-exaggeration": 0.01,
                "hillshade-shadow-color": "#473B24",
              },
              layout: {
                visibility: "visible",
              },
            },
          ],
          sky: {
            "atmosphere-blend": [
              "interpolate",
              ["linear"],
              ["zoom"],
              0,
              1,
              5,
              1,
              7,
              0,
            ],
          },
          light: {
            anchor: "viewport",
            position: [1.5, 90, 40],
            intensity: 0.25,
            color: "#555",
          },
        },
      });

      // add globe control only if it's available in this build
      if (typeof (maplibregl as any).GlobeControl === "function") {
        try {
          map.addControl(new (maplibregl as any).GlobeControl());
        } catch (e) {
          // ignore if GlobeControl not supported
          console.warn("GlobeControl not available or failed to initialize", e);
        }
      }

      map.addControl(
        new maplibregl.NavigationControl({
          showZoom: true,
          showCompass: false,
        })
      );
      setMapp(map);
      return () => {
        map.remove();
      };
    }
  }, []);

  useEffect(() => {
    if (mapp && mapp.getSource && selectedLayerTiles) {
      mapp.getSource("cog").setTiles([selectedLayerTiles]);
      mapp.setPaintProperty("cog", "raster-opacity", opacity / 100);
      mapp.triggerRepaint();
    }
    return () => {};
  }, [mapp, selectedLayerTiles, opacity]);

  const base = import.meta.env.BASE_URL || "/";

  return (
    <div
      id="App"
      className="App"
      style={{
        width: "100vw",
        height: "100vh",
        backgroundImage: `url(${base}night-sky.png)`,
        position: "absolute",
        zIndex: 0,
      }}
    ></div>
  );
}
