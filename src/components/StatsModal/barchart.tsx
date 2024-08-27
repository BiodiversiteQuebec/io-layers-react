import * as Plot from "@observablehq/plot";
import * as d3 from "d3";
import "./styles_histo.css";
import { useRef, useEffect, useState } from "react";

interface Props {
  data: any;
  bounds: any;
}

export default function BarChart({ data, bounds }: Props) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const barChart = Plot.plot({
      y: {
        grid: true,
      },
      marks: [
        Plot.rectY(data, {
          y2: "yval",
          x: "xval",
          interval:
            bounds[1] > 2
              ? Math.ceil((bounds[1] - bounds[0]) / 20)
              : (bounds[1] - bounds[0]) / 20,
          mixBlendMode: "saturation",
          fy: "place",
          fill: "place",
        }),
        Plot.axisX(d3.ticks(bounds[0], bounds[1], 15), {
          label: "Value",
          tickFormat: (d, i, _) => d,
        }),
        Plot.axisY({ label: "Frequency", marginTop: 100 }),
        Plot.ruleY([0]),
      ],
      color: { legend: true },
      marginTop: 20,
      marginLeft: 60,
      marginRight: 60,
      marginBottom: 50,
    });
    ref.current?.append(barChart);
    return () => barChart.remove();
  }, [data]);

  return (
    <div>
      <div ref={ref} className="plotDiv"></div>
    </div>
  );
}
