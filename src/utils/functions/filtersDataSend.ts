import {
    AFRICANORIGINS,
    ENSLAVEDTEXAS,
    INTRAAMERICAN,
    INTRAAMERICANTRADS,
    TRANSATLANTICPATH,
    TRANSATLANTICTRADS,
} from '@/share/CONST_DATA';
import { Filter } from "@/share/InterfaceTypes";

export const filtersDataSend = (filtersObj: Filter[], styleNameRoute: string, varName?: string, clusterNodeKeyVariable?: string, clusterNodeValue?: string) => {
    let filters: Filter[] = [];
    const filterByVarName = filtersObj && filtersObj.filter((filterItem: Filter) =>
        filterItem.varName !== clusterNodeKeyVariable ||
        filterItem.varName !== varName
    );

    if (clusterNodeKeyVariable && clusterNodeValue) {
        filters = filters.concat({
            varName: clusterNodeKeyVariable,
            searchTerm: [clusterNodeValue],
            op: 'in',
        });
    } else if (Array.isArray(filtersObj[0]?.searchTerm) && filtersObj[0]?.searchTerm.length > 0) {
        filters = filtersObj;
    } else if ((Array.isArray(filtersObj[0]?.searchTerm) &&
        filtersObj[0]?.searchTerm.length > 0) || (!Array.isArray(filtersObj[0]?.op) && filtersObj[0]?.op === 'exact')) {
        filters = filtersObj;
    }
    if (styleNameRoute === TRANSATLANTICPATH) {
        filters.map((item) => ({
            ...item,
            varName: 'dataset',
            searchTerm: [0],
            op: 'in',
        }));
    }
    else if (styleNameRoute === INTRAAMERICAN) {
        filters.map((item) => ({
            ...item,
            varName: 'dataset',
            searchTerm: [1],
            op: 'in',
        }));
    } else if (styleNameRoute === ENSLAVEDTEXAS) {
        filters.push({
            varName:
                'enslaved_relations__relation__voyage__voyage_itinerary__imp_principal_region_slave_dis__name',
            searchTerm: ['Texas'],
            op: 'in',
        });
    } else if (styleNameRoute === AFRICANORIGINS) {
        filters.push({
            varName: 'dataset',
            searchTerm: [0, 0],
            op: 'in',
        });
    } else if (styleNameRoute === TRANSATLANTICTRADS) {
        filters.push({
            varName: 'aliases__enslaver_relations__relation__voyage__dataset',
            searchTerm: 0,
            op: "exact"
        });
    } else if (styleNameRoute === INTRAAMERICANTRADS) {
        filters.push({
            varName: 'aliases__enslaver_relations__relation__voyage__dataset',
            searchTerm: 1,
            op: "exact"
        });
    } else {
        filters = filtersObj;
    }
    // Update filterObject state
    const filterObjectUpdate = {
        filter: filters
    };

    // Update localStorage
    const filterObjectString = JSON.stringify(filterObjectUpdate);
    localStorage.setItem('filterObject', filterObjectString);

    const filterSet = new Set([...filters, ...filterByVarName]);
    return Array.from(filterSet)
}


