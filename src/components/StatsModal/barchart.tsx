import * as Plot from "@observablehq/plot";
import "./styles_histo.css";
import { useRef, useEffect, useState } from "react";

interface Props {
  data: any;
}

export default function BarChart({ data }: Props) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const barChart = Plot.plot({
      marks: [
        Plot.barY(data, {
          x: "xval",
          y: "yval",
          fill: "orange",
        }),
        Plot.axisX({ label: "Value" }),
        Plot.axisY({ label: "Frequency", marginTop: 100 }),
        Plot.ruleY([0]),
      ],
      y: {
        grid: true,
      },
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
