/* eslint-disable dot-notation */
import React, { useState, useEffect } from "react";
import ReactDOM from "react-dom";
import { ColorPicker } from "../ColormapPicker";
import MSMapSlider from "../CustomMap/MSMapSlider";

/**
 *
 * @param props properties
 * @returns component
 */
function MapOverlay(props: any) {
  const { opacity, setOpacity, colormap, setColormap, colormapList } = props;

  const overlay = (
    <div style={{ position: "fixed", zIndex: 100002, bottom: 0, left: 0, pointerEvents: "auto" }}>
      <MSMapSlider
        absolute={true}
        location={"bottom-left"}
        bottom={40}
        left={10}
        width={200}
        notifyChange={(newValue: any) => setOpacity(newValue)}
        value={opacity}
      />
      <ColorPicker
        setColormap={setColormap}
        colormap={colormap}
        colormapList={colormapList}
      />
    </div>
  );

  return ReactDOM.createPortal(overlay, document.body);
}

export default MapOverlay;
