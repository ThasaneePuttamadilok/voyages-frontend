import axios, { AxiosRequestConfig, AxiosResponse } from 'axios';
import React from 'react';
import { RangeSliderProps } from '../components/Slider';
import { AUTHTOKEN, BASEURL } from '../share/AUTH_BASEURL';
import { createAsyncThunk } from '@reduxjs/toolkit';
import { AppDispatch } from '../redux/store';

export const fetchRangeSliderData = createAsyncThunk(
    'rangeSlider/fetchRangeData',
    async (formData: FormData) => {
        try {
            const response = await axios.post(
                `${BASEURL}voyage/aggregations`,
                formData,
                {
                    headers: { 'Authorization': AUTHTOKEN },
                }
            );
            return response.data;
        } catch (error) {
            throw new Error('Failed to fetch range slider data');
        }
    }
);


export const fetchRangeSlider = async (
    keyOption: string,
    setRange: React.Dispatch<React.SetStateAction<[number, number]>>,
    setValue: React.Dispatch<React.SetStateAction<[number, number]>>,
    setMessage: React.Dispatch<React.SetStateAction<string>>
) => {

    const data = new FormData();
    data.append('aggregate_fields', keyOption);
    const config: AxiosRequestConfig = {
        method: 'post',
        baseURL: `${BASEURL}voyage/aggregations`,
        headers: { 'Authorization': AUTHTOKEN },
        data: data
    }
    try {
        const res: AxiosResponse<any> = await axios(config);
        const responseData: RangeSliderProps = res.data;
        if (Object.values(responseData)[0]["min"] || Object.values(responseData)[0]["max"]) {
            setRange([
                Object.values(responseData)[0]["min"],
                Object.values(responseData)[0]["max"],
            ]);
            setValue([
                Object.values(responseData)[0]["min"],
                Object.values(responseData)[0]["max"],
            ]);
        } else if (Object.values(responseData)[0]["min"] === null || Object.values(responseData)[0]["max"] === null) {
            setMessage('Min and Max have not value');
        }
    } catch (error) {
        console.error(error);
    }
}

