import React, { useRef } from "react";
import Control from "react-leaflet";
import L from "leaflet";
import ReactDOMServer from "react-dom/server";
import { FormGroup, FormControlLabel, Switch } from "@mui/material";

function LegendItem(props: any) {
  const { color = "red", text = "" } = props;
  return (
    <div className="legendItem">
      <div className="legendItemColorBox" style={{ background: color }} />
      <div className="legendItemText">
        <span>{text}</span>
      </div>
    </div>
  );
}

export function Legend(items: any) {
  return (
    <div className="legend">
      {items.items.map((item: any, i: Number) => (
        <LegendItem key={i} color={item.color} text={item.text} />
      ))}
    </div>
  );
}

/**
 * Factory method
 * @param {Number} min bottom of range
 * @param {Number} max top of range
 * @param {Color[]} scaleColors array of colors
 * @returns a leaflet control object
 */
export function createRangeLegendControl(
  min: number,
  max: number,
  scaleColors: any
) {
  const legend = new L.Control({ position: "bottomright" });
  legend.onAdd = function (map: any) {
    const div0 = L.DomUtil.create("div", "legend-group");
    const div = L.DomUtil.create("div", "legend");

    const step = (max - min) / (scaleColors.length - 1);
    let roundFactor = 1;
    if (max <= 10 && max > 1) {
      roundFactor = 100;
    } else if (max <= 1 && max > 0.1) {
      roundFactor = 1000;
    } else if (max < 0.1) {
      roundFactor = 10000;
    }

    const items = scaleColors.map((color: any, i: number) => {
      return {
        color: color,
        text: Math.round(roundFactor * (min + i * step)) / roundFactor,
      };
    });
    div.innerHTML = ReactDOMServer.renderToStaticMarkup(
      <>
        <div className="legend-group">
          <Legend items={items} />
        </div>
      </>
    );
    return div;
  };
  return legend;
}
