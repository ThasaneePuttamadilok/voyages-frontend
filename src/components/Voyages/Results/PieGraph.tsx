import { useState, useEffect, ChangeEvent, useCallback, useMemo } from 'react';
import Plot from 'react-plotly.js';
import PIECHART_OPTIONS from '@/utils/flatfiles/VOYAGE_PIECHART_OPTIONS.json';
import { Grid, SelectChangeEvent, Skeleton } from '@mui/material';
import { useWindowSize } from '@react-hook/window-size';
import { AppDispatch, RootState } from '@/redux/store';
import { useDispatch, useSelector } from 'react-redux';
import { useGetOptionsQuery } from '@/fetchAPI/voyagesApi/fetchApiService';
import { SelectDropdown } from './SelectDropdown';
import { AggregationSumAverage } from './AggregationSumAverage';
import LOADINGLOGO from '@/assets/sv-logo_v2_notext.svg';
import { fetchVoyageGraphGroupby } from '@/fetchAPI/voyagesApi/fetchVoyageGroupby';
import {
  VoyagesOptionProps,
  Options,
  RangeSliderState,
  AutoCompleteInitialState,
  CurrentPageInitialState,
  PlotPIEX,
  PlotPIEY,
  TYPESOFDATASET,
} from '@/share/InterfaceTypes';
import { fetchOptionsFlat } from '@/fetchAPI/voyagesApi/fetchOptionsFlat';
import { maxWidthSize } from '@/utils/functions/maxWidthSize';

function PieGraph() {
  const datas = useSelector((state: RootState) => state.getOptions?.value);
  const {
    data: options_flat,
    isSuccess,
    isLoading,
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
    (state: RootState) => state.getScrollPage as CurrentPageInitialState
  );
  const { dataSetKey, dataSetValue, styleName } = useSelector(
    (state: RootState) => state.getDataSetCollection
  );
  const { isChangeGeoTree, geoTreeValue, geoTreeSelectValue } = useSelector(
    (state: RootState) => state.getGeoTreeData
  );
  const [optionFlat, setOptionsFlat] = useState<Options>({});
  const [width, height] = useWindowSize();
  const [pieGraphSelectedX, setSelectedX] = useState<PlotPIEX[]>([]);
  const [pieGraphSelectedY, setSelectedY] = useState<PlotPIEY[]>([]);
  const [plotX, setPlotX] = useState<any[]>([]);
  const [plotY, setPlotY] = useState<any[]>([]);
  const maxWidth = maxWidthSize(width);

  const [pieGraphOptions, setPieOptions] = useState<VoyagesOptionProps>({
    x_vars: PIECHART_OPTIONS.x_vars[0].var_name,
    y_vars: PIECHART_OPTIONS.y_vars[0].var_name,
  });
  const [aggregation, setAggregation] = useState<string>('sum');

  const VoyagepieGraphOptions = () => {
    Object.entries(PIECHART_OPTIONS).forEach(
      ([key, value]: [string, PlotPIEX[]]) => {
        if (key === 'x_vars') {
          setSelectedX(value);
        }
        if (key === 'y_vars') {
          setSelectedY(value);
        }
      }
    );
  };

  useEffect(() => {
    VoyagepieGraphOptions();
    let subscribed = true;
    fetchOptionsFlat(isSuccess, options_flat as Options, setOptionsFlat);

    const fetchData = async () => {
      const newFormData: FormData = new FormData();
      newFormData.append('groupby_by', pieGraphOptions.x_vars);
      newFormData.append('groupby_cols', pieGraphOptions.y_vars);
      newFormData.append('agg_fn', aggregation);
      newFormData.append('cachename', 'voyage_bar_and_donut_charts');

      if (styleName !== TYPESOFDATASET.allVoyages) {
        for (const value of dataSetValue) {
          newFormData.append(dataSetKey, String(value));
        }
      }
      if (isChange && rang && currentPage === 4) {
        for (const rangKey in rang) {
          newFormData.append(rangKey, String(rang[rangKey][0]));
          newFormData.append(rangKey, String(rang[rangKey][1]));
        }
      }
      if (autoCompleteValue && varName && currentPage === 4) {
        for (const autoKey in autoCompleteValue) {
          for (const autoCompleteOption of autoCompleteValue[autoKey]) {
            if (typeof autoCompleteOption !== 'string') {
              const { label } = autoCompleteOption;

              newFormData.append(autoKey, label);
            }
          }
        }
      }

      if (isChangeGeoTree && varName && geoTreeValue && currentPage === 4) {
        for (const keyValue in geoTreeValue) {
          for (const keyGeoValue of geoTreeValue[keyValue]) {
            newFormData.append(keyValue, String(keyGeoValue));
          }
        }
      }
      try {
        const response = await dispatch(
          fetchVoyageGraphGroupby(newFormData)
        ).unwrap();

        if (subscribed && response) {
          const keys = Object.keys(response);
          if (keys[0]) {
            setPlotX(response[keys[0]]);
          }
          if (keys[1]) {
            setPlotY(response[keys[1]]);
          }
        }
      } catch (error) {
        console.log('error', error);
      }
    };
    fetchData();
    return () => {
      subscribed = false;
    };
  }, [
    dispatch,
    options_flat,
    pieGraphOptions.x_vars,
    pieGraphOptions.y_vars,
    aggregation,
    rang,
    varName,
    isChange,
    autoCompleteValue,
    autoLabelName,
    currentPage,
    isSuccess,
    dataSetValue,
    dataSetKey,
    styleName,
    geoTreeSelectValue,
    geoTreeValue,
  ]);

  const handleChangeAggregation = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      setAggregation(event.target.value);
    },
    []
  );

  const handleChangeSingleSelect = useMemo(() => {
    return (event: SelectChangeEvent<string>, name: string) => {
      const value = event.target.value;
      setPieOptions((prevVoygOption) => ({
        ...prevVoygOption,
        [name]: value,
      }));
    };
  }, [pieGraphOptions]);

  const isPlotYZeroAll = plotY.every((item) => item === 0);
  return (
    <div>
      <SelectDropdown
        selectedX={pieGraphSelectedX}
        selectedY={pieGraphSelectedY}
        selectedOptions={pieGraphOptions}
        handleChange={handleChangeSingleSelect}
        handleChangeMultipleYSelected={() =>
          console.log('handleChangeMultipleYSelected optional for PIE')
        }
        graphType="PIE"
        maxWidth={maxWidth}
        XFieldText={'Sectors'}
        YFieldText={'Values'}
        optionsFlatY={PIECHART_OPTIONS.y_vars}
      />
      <AggregationSumAverage
        handleChange={handleChangeAggregation}
        aggregation={aggregation}
      />
      {plotX.length > 0 && !isPlotYZeroAll ? (
        <Grid>
          <Plot
            data={[
              {
                labels: plotX,
                values: plotY,
                type: 'pie',
                mode: 'lines+markers',
                textinfo: 'label+percent',
                insidetextorientation: 'radial',
                hole: 0.2,
                textposition: 'inside',
                showlegend: maxWidth < 400 ? false : true,
              },
            ]}
            layout={{
              width: maxWidth,
              height: height * 0.5,
              title: `The ${aggregation} of ${
                optionFlat[pieGraphOptions.x_vars]?.label || ''
              } vs <br> ${
                optionFlat[pieGraphOptions.y_vars]?.label || ''
              } Pie Chart`,
              font: {
                family: 'Arial, sans-serif',
                size: maxWidth < 400 ? 7 : 10,
                color: '#333333',
              },
            }}
            config={{ responsive: true }}
          />
        </Grid>
      ) : (
        <div className="loading-logo">
          <img src={LOADINGLOGO} />
        </div>
      )}
    </div>
  );
}

export default PieGraph;
