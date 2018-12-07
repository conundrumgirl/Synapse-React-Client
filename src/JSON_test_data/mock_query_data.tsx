import { QueryResultBundle } from '../lib/utils/jsonResponses/Table/QueryResultBundle';
import { ColumnType } from '../lib/utils/jsonResponses/Table/ColumnType';
import { FacetColumnResultValues } from '../lib/utils/jsonResponses/Table/FacetColumnResult';

let mockData: QueryResultBundle = {
    concreteType: "org.sagebionetworks.repo.model.table.QueryResultBundle",
    columnModels: [{
        id: "2510",
        name: "id",
        defaultValue: "a",
        columnType: ColumnType.STRING,
        enumValues: ["a"],
        maximumSize: 89,
        facetType: "enumeration"
    }],
    facets: [
        {
            concreteType: "a",
            facetType: "enumeration",
            columnName: "name",
            facetValues: [{value: "a", count: 1, isSelected: true}]
        } as FacetColumnResultValues
    ],
    queryResult: {
        queryResults: {
            etag: "s",
            rows: [{
                rowId: 1,
                values: ["syn5604373"],
                versionNumber: 123,
                etag: "a"
            }],
            headers: [{
                name: "header",
                columnType: ColumnType.STRING,
                id: "a"
            }]
        },
        nextPageToken: {token: "123"}
    },
    queryCount: 100,
    selectColumns: [{name: "name", columnType: ColumnType.STRING, id: "a"}],
    sumFileSizes: {sumFileSizesBytes: 1000, greaterThan: false},
    maxRowsPerPage: 100
}

export default mockData