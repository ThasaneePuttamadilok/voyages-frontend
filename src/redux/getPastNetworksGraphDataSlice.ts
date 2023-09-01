import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { InitialStatePastNetworksData, Datas } from '@/share/InterfaceTypePastNetworks';

const initialState: InitialStatePastNetworksData = {
    data: {
        nodes: [],
        edges: []
    },
    openModal: false,
    networkID: 0,
    networkKEY: '',
};

const pastNetworksSlice = createSlice({
    name: 'pastNetworks',
    initialState,
    reducers: {
        setPastNetworksData: (state, action: PayloadAction<Datas>) => {
            state.data = action.payload;
        },
        setsetOpenModalNetworks: (state, action: PayloadAction<boolean>) => {
            state.openModal = action.payload;
        },
        setNetWorksID: (state, action: PayloadAction<number>) => {
            state.networkID = action.payload;
        },
        setNetWorksKEY: (state, action: PayloadAction<string>) => {
            state.networkKEY = action.payload;
        },
    }
});

export const { setPastNetworksData, setsetOpenModalNetworks, setNetWorksID, setNetWorksKEY } = pastNetworksSlice.actions;
export default pastNetworksSlice.reducer;