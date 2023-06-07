import { useState, useEffect, useMemo, ChangeEvent, useCallback } from "react";
import Plot from "react-plotly.js";
import VOYAGE_SCATTER_OPTIONS from "@/utils/VOYAGE_SCATTER_OPTIONS.json";
import { Grid, SelectChangeEvent } from "@mui/material";
import { useWindowSize } from "@react-hook/window-size";
import { AppDispatch, RootState } from "@/redux/store";
import { useDispatch, useSelector } from "react-redux";
import { useGetOptionsQuery } from "@/fetchAPI/fetchApiService";
import SelectDropdownScatter from "./SelectDropdownScatter";
import AggregationSumAverage from "./AggregationSumAverage";
import { fetchVoyageScatterGroupby } from "@/fetchAPI/fetchVoyageGroupby";
import {
  PlotXYVar,
  VoyagesOptionProps,
  Options,
  RangeSliderState,
  AutoCompleteInitialState,
  currentPageInitialState,
} from "@/share/InterfaceTypes";
import { fetchOptionsFlat } from "@/fetchAPI/fetchOptionsFlat";
import "@/style/page.scss";

function Scatter() {
  const datas = useSelector(
    (state: RootState | any) => state.getOptions?.value
  );
  const {
    data: options_flat,
    isLoading,
    isSuccess,
  } = useGetOptionsQuery(datas);
  const dispatch: AppDispatch = useDispatch();
  const {
    rangeSliderMinMax: rang,
    varName,
    isChange,
  } = useSelector((state: RootState) => state.rangeSlider as RangeSliderState);
  const { autoCompleteValue, autoLabelName, isChangeAuto } = useSelector(
    (state: RootState) => state.autoCompleteList as AutoCompleteInitialState
  );
  const { currentPage } = useSelector(
    (state: RootState) => state.getScrollPage as currentPageInitialState
  );

  const [optionFlat, setOptionsFlat] = useState<Options>({});
  const [width, height] = useWindowSize();
  const [showAlert, setAlert] = useState(false);
  const [scatterSelectedX, setSelectedX] = useState<PlotXYVar[]>([]);
  const [scatterSelectedY, setSelectedY] = useState<PlotXYVar[]>([]);
  const [scatterPlotX, setPlotX] = useState<number[]>([]);
  const [scatterPlotY, setPlotY] = useState<number[]>([]);
  const [scatterOptions, setScatterOptins] = useState<VoyagesOptionProps>({
    x_vars: VOYAGE_SCATTER_OPTIONS.x_vars[0].var_name,
    y_vars: VOYAGE_SCATTER_OPTIONS.y_vars[0].var_name,
  });

  const [aggregation, setAggregation] = useState<string>("sum");

  const VoyageScatterOptions = () => {
    Object.entries(VOYAGE_SCATTER_OPTIONS).forEach(
      ([key, value]: [string, PlotXYVar[]]) => {
        if (key === "x_vars") {
          setSelectedX(value);
        }
        if (key === "y_vars") {
          setSelectedY(value);
        }
      }
    );
  };

  useEffect(() => {
    VoyageScatterOptions();
    fetchOptionsFlat(
      isSuccess,
      (options_flat as Options) || undefined,
      setOptionsFlat
    );
    const fetchData = async () => {
      const newFormData: FormData = new FormData();
      newFormData.append("groupby_by", scatterOptions.x_vars);
      newFormData.append("groupby_cols", scatterOptions.y_vars);
      newFormData.append("agg_fn", aggregation);
      newFormData.append("cachename", "voyage_xyscatter");
      if (isChange && rang[varName] && currentPage === 2) {
        newFormData.append(varName, String(rang[varName][0]));
        newFormData.append(varName, String(rang[varName][1]));
      }
      if (autoCompleteValue && varName && isChangeAuto) {
        for (let i = 0; i < autoLabelName.length; i++) {
          const label = autoLabelName[i];
          newFormData.append(varName, label);
        }
      }
      try {
        const response = await dispatch(
          fetchVoyageScatterGroupby(newFormData)
        ).unwrap();
        if (response) {
          const keys = Object.keys(response);
          const values = Object.values(response);
          setScatterOptins({
            x_vars: keys[0] || "",
            y_vars: keys[1] || "",
          });
          if (values[0]) {
            setPlotX(values[0] as number[]);
          }
          if (values[1]) {
            setPlotY(values[1] as number[]);
          }
        }
      } catch (error) {
        console.log("error", error);
      }
    };

    fetchData();
  }, [
    dispatch,
    options_flat,
    scatterOptions.x_vars,
    scatterOptions.y_vars,
    aggregation,
    rang,
    varName,
    isChange,
    autoLabelName,
  ]);

  const handleChangeAggregation = useMemo(
    () => (event: ChangeEvent<HTMLInputElement>, name: string) => {
      setAggregation(event.target.value);
    },
    [aggregation]
  );

  const handleChangeVoyageOption = useCallback(
    (event: SelectChangeEvent<string>, name: string) => {
      const value = event.target.value;
      setScatterOptins((prevVoyageOption) => ({
        ...prevVoyageOption,
        [name]: value,
      }));
    },
    [scatterSelectedX, scatterSelectedY, scatterOptions]
  );
  if (isLoading) {
    return <div className="spinner"></div>;
  }
  const maxWidth =
    width > 1024
      ? width > 1440
        ? width * 0.88
        : width * 0.92
      : width === 1024
      ? width * 0.895
      : width < 768
      ? width * 0.92
      : width * 0.95;

  return (
    <div>
      <SelectDropdownScatter
        selectedX={scatterSelectedX}
        selectedY={scatterSelectedY}
        selectedOptions={scatterOptions}
        handleChange={handleChangeVoyageOption}
        maxWidth={maxWidth}
      />
      <AggregationSumAverage
        handleChange={handleChangeAggregation}
        aggregation={aggregation}
        showAlert={showAlert}
        scatterOptions={scatterOptions}
        optionFlat={optionFlat}
      />
      <Grid>
        <Plot
          data={[
            {
              x: scatterPlotX,
              y: scatterPlotY,
              type: "scatter",
              mode: "lines",
              marker: { color: "red" },
              line: { shape: "spline" },
            },
            { type: "bar" },
          ]}
          layout={{
            width: maxWidth,
            height: height * 0.45,
            title: `The ${aggregation} of ${
              optionFlat[scatterOptions.x_vars]?.label || ""
            } vs  <br>${
              optionFlat[scatterOptions.y_vars]?.label || ""
            } Scatter Graph`,
            xaxis: {
              title: {
                text: optionFlat[scatterOptions.x_vars]?.label || "",
              },
              fixedrange: true,
            },
            yaxis: {
              title: {
                text: optionFlat[scatterOptions.y_vars]?.label || "",
              },
              fixedrange: true,
            },
          }}
          config={{ responsive: true }}
        />
      </Grid>
    </div>
  );
}

export default Scatter;
