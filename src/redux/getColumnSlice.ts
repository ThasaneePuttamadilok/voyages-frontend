import { InitialStateColumnProps, TableCellStructureProps } from '@/share/InterfaceTypesTable';
import jsonData from '@/utils/voyage_table_cell_structure__updated21June.json'
import { PayloadAction, createSlice } from "@reduxjs/toolkit"

const initialState: InitialStateColumnProps = {
    valueCells: jsonData,
    visibleColumnCells: []
};
export const getColumnsSlice = createSlice({
    name: "getColumns",
    initialState,
    reducers: {
        getColumnsSelectorTree: (state, action: PayloadAction<TableCellStructureProps>) => {
            state.valueCells = action.payload;
        },
        setVisibleColumn: (state, action: PayloadAction<string[]>) => {
            state.visibleColumnCells = action.payload;
        },
    },
});

export const { setVisibleColumn } = getColumnsSlice.actions;

export default getColumnsSlice.reducer;