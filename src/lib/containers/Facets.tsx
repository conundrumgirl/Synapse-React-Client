import React from "react";
import { library } from "@fortawesome/fontawesome-svg-core";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTimes } from "@fortawesome/free-solid-svg-icons";
import { faPlus } from "@fortawesome/free-solid-svg-icons";
import { getColorPallette } from "./ColorGradient";
import {QueryWrapperChildProps} from './QueryWrapper'
import { FacetColumnResult, FacetColumnResultValues } from '../utils/jsonResponses/Table/FacetColumnResult';

const cloneDeep = require("lodash.clonedeep");
const SELECT_ALL = "select all";
const DESELECT_ALL = "deselect all";

// Add all icons to the library so you can use it in your page
library.add(faTimes);
library.add(faPlus);

type CheckboxGroupProps = {
    rgbIndex: number
    isChecked: any
    element: any
    clickHandler: any
    showAllFacets: boolean
}

type Info = {
    index: number
    value: string
}

/**
 * Checkbox group represents one column's set of checkbox filters
 *
 * @class CheckboxGroup
 * @extends {React.Component}
 */
const CheckboxGroup: React.SFC<CheckboxGroupProps> = (props) => {
    
    const { element, showAllFacets } = props;
    let children: any = [];
    
    element.facetValues.sort((a: any, b: any) => {
        return b.count - a.count;
    });
    let {colorPalette, textColors} = getColorPallette(props.rgbIndex, element.facetValues.length)
    element.facetValues.forEach((facetValue: any, index: any) => {
        
        let uniqueId = element.columnName + " " + facetValue.value + " " + facetValue.count;
        // caution when using uuId's to not cause extra re-renders from always changing
        let textColor = textColors[index]
        let curColor = colorPalette[index]
        let style: any = {};
        const check = props.isChecked[index] === undefined || props.isChecked[index];
        if (check) {
            style = {
                background: curColor
            };
        } else {
            style = {
                background: `#C4C4C4`
            };
        }
        style.color = textColor;
        if (facetValue.value === "org.sagebionetworks.UNDEFINED_NULL_NOTSET") {
            facetValue.displayValue = "unannotated";
        } else {
            facetValue.displayValue = facetValue.value;
        }
        const showTimes = check;
        children.push(
            <span style={style} className="SRC-facets SRC-primary-background-hover" key={uniqueId} onClick={props.clickHandler({ index, value: facetValue.value, columnName: element.columnName })}>
                <span className="SRC-facets-text">
                    {" "}
                    &nbsp;&nbsp; {facetValue.displayValue} ({facetValue.count}){" "}
                </span>
                <span>&nbsp;&nbsp;</span>
                {showTimes ? <FontAwesomeIcon className="SRC-facets-icon" icon={"times"} /> : <FontAwesomeIcon className="SRC-facets-icon" icon={"plus"} />}
                <span>&nbsp;&nbsp;</span>
            </span>
        );
    });
    return (
        <React.Fragment>
            {children.map((child: any, index: number) => {
                if (!showAllFacets && index > 4) {
                    return false
                } else {
                    return child;
                }
            })}
        </React.Fragment>
    );
}

type FacetsState = {
    selectedFacets: {},
    isChecked: boolean []
    boxCount: number,
    showAllFacets: boolean
};

class Facets extends React.Component<QueryWrapperChildProps, FacetsState> {

    constructor(props: QueryWrapperChildProps) {
        super(props);
        this.handleClick = this.handleClick.bind(this);
        this.state = {
            // we store the selected facets by column name for ease of use,
            // this has to be later converted when making the api call
            selectedFacets: {},
            boxCount: 0,
            isChecked: [],
            showAllFacets: false
        };
        this.showAllFacets = this.showAllFacets.bind(this)
        this.updateStateAndMakeQuery = this.updateStateAndMakeQuery.bind(this);
        this.updateSelection = this.updateSelection.bind(this);
    }
    /**
     * Display the view of the facets
     *
     * @returns
     * @memberof Facets
     */
    showFacetFilter() {
        // iterate through the loaded data and write out the appropriate checkboxes,
        // filling in the state of the checkboxes according to the current selection
        let structuredRender: JSX.Element[] = [];
        // read in the most up to date data
        // display the data -- currently we only support enumerations
        this.props.data!.facets.forEach((element: FacetColumnResult) => {
            if (element.columnName === this.props.filter && element.facetType === "enumeration") {
                let group = (
                    <CheckboxGroup
                        showAllFacets={this.state.showAllFacets}
                        rgbIndex={this.props.rgbIndex!}
                        key={element.columnName}
                        element={element}
                        isChecked={this.props.isChecked}
                        clickHandler={this.handleClick}
                    />
                );
                structuredRender.push(group);
            }
        });
        return (
            <React.Fragment>
                {structuredRender.map(element => {
                    return element;
                })}
            </React.Fragment>
        );
    }
    /**
     * Handle checkbox click event
     */
    handleClick = (dict: Info) => (event: React.MouseEvent<HTMLSpanElement>) => {
        if (!this.state.showAllFacets) {
            this.setState({
                showAllFacets: true
            })
        }
        // https://medium.freecodecamp.org/reactjs-pass-parameters-to-event-handlers-ca1f5c422b9
        let queryRequest: any = this.props.getLastQueryRequest!();
        let { selectedFacets } = queryRequest.query;
        // grab the facet values assoicated for this column
        let specificFacet = selectedFacets[0];
        // if its not selected then we add as having been chosen, otherwise we
        // have to delete it
        if (specificFacet.facetValues.indexOf(dict.value) === -1) {
            specificFacet.facetValues.push(dict.value);
        } else {
            // remove value
            specificFacet.facetValues.splice(specificFacet.facetValues.indexOf(dict.value), 1);
        }
        let { isChecked } = cloneDeep(this.props);
        if (isChecked[dict.index] === undefined) {
            isChecked[dict.index] = false;
        } else {
            isChecked[dict.index] = !isChecked[dict.index];
        }
        queryRequest.query.selectedFacets = selectedFacets;
        this.props.updateParentState!({ isChecked });
        this.props.executeQueryRequest!(queryRequest);
    };
    /**
     * Handle select all or deselect all event, selection group specifies which
     * option was chosen
     *
     * @memberof Facets
     */
    updateSelection = (selectionGroup: string) => (event: React.MouseEvent<HTMLAnchorElement>) => {
        event.preventDefault();
        let { isChecked } = cloneDeep(this.props);
        let queryRequest = cloneDeep(this.props.getLastQueryRequest!());
        if (selectionGroup === SELECT_ALL) {
            for (let i = 0; i < 100; i++) {
                isChecked[i] = true;
            }
            this.props.updateParentFilter!(this.props.filter!);
            this.props.updateParentState!({ isChecked });
            this.props.executeInitialQueryRequest!();
        } else {
            for (let i = 0; i < 100; i++) {
                isChecked[i] = false;
            }
            // hack to make deselct all work
            queryRequest.query.selectedFacets[0].facetValues = [];
            this.props.updateParentState!({ isChecked, showNothing: true, lastQueryRequest: queryRequest });
        }
    };

    showAllFacets (event: React.MouseEvent<HTMLAnchorElement>) {
        event.preventDefault()
        this.setState({
            showAllFacets: true
        })
    }

    /**
     * Update the state with selected facets and call props to update data
     *
     * @param {*} selectedFacets
     * @memberof Facets
     */
    updateStateAndMakeQuery(selectedFacets: any) {
        // have to reformat the selected facets to format for the api call
        let selectedFacetsFormatted = Object.keys(selectedFacets).map(key => {
            return selectedFacets[key];
        });
        let queryRequest = this.props.getLastQueryRequest!();
        queryRequest.query.selectedFacets = selectedFacetsFormatted;
        this.props.executeQueryRequest!(queryRequest);
    }

    render() {
        if (this.props.data === undefined) {
            return (<div></div>);
        }
        let {showAllFacets}= this.state
        let curFacets = this.props.data!.facets.
                                            filter( (facet: FacetColumnResultValues) => {return facet.columnName === this.props.filter && facet.facetType === "enumeration"} )[0] as FacetColumnResultValues

        if (!curFacets) {
            return (<div></div>)
        }

        let curFacetsLength = curFacets.facetValues.length

        if (curFacetsLength < 5) {
            // override
            showAllFacets = true
        }

        return (
            <div className="container-fluid SRC-syn-border-spacing ">
                <div className="col-xs">
                    <form>
                        <div className="SRC-marginFive form-group">{this.showFacetFilter()}
                            {!showAllFacets
                                &&
                                <span className="SRC-inlineBlock">
                                    <a href={""} className="SRC-primary-text-color SRC-no-text-decor" onClick={this.showAllFacets}>
                                    {" "}
                                    Show All ({curFacetsLength}){" "}
                                    </a>   
                                </span>
                            }
                        </div>
                        <div className="SRC-marginFive form-group">
                            <p>
                               {showAllFacets &&
                                    <React.Fragment>
                                        <a href={""} className="SRC-primary-text-color SRC-no-text-decor" onClick={this.updateSelection(SELECT_ALL)}>
                                            {" "}
                                            Select All{" "}
                                        </a>
                                        <span style={{marginLeft: "5px", marginRight: "5px"}}>
                                            |
                                        </span>
                                        <a href={""} className="SRC-primary-text-color SRC-no-text-decor" onClick={this.updateSelection(DESELECT_ALL)}>
                                            {" "}
                                            Deselect All{" "}
                                        </a>
                                    </React.Fragment>
                                }
                            </p>
                        </div>
                    </form>
                </div>
            </div>
        );
    }
}

export { Facets, CheckboxGroup };