import * as React from "react";
import ColorGradient from "./ColorGradient";
import PropTypes from 'prop-types';
import QueryWrapper from './QueryWrapper';
import { SynapseConstants } from '..';
import StackedRowHomebrew from './StackedRowHomebrew';
import { Facets } from './Facets';
import SynapseTable from './SynapseTable';

type MenuState = {
    menuIndex: number
};

type MenuConfig = {
    sql: string
    filter: string
    title: string
    unitDescription?: string
    synapseId: string
}

type Props = {
    menuConfig: MenuConfig []
    token: string
    rgbIndex: number,
}

type Info = {
    isSelected: boolean
    originalColor: string
}

// will take in a default facet  originalColor: "#F5F5F5"
export default class Menu extends React.Component<Props, MenuState> {

    static propTypes = {
        menuConfig: PropTypes.arrayOf(PropTypes.any),
        token: PropTypes.string,
        rgbIndex: PropTypes.number,
        filter: PropTypes.string
    }

    constructor(props: Props) {
        super(props)
        this.state = {
            menuIndex: 0
        }
        this.handleHoverLogic = this.handleHoverLogic.bind(this)
    }

    handleHoverLogic = (info: Info) => (event: React.MouseEvent<HTMLDivElement>) => {
        if (!info.isSelected && event.currentTarget.tagName === "DIV") {
            event.currentTarget.style.backgroundColor = info.originalColor;
        }
      } 
    
    render () {
        let {token, menuConfig, rgbIndex} = this.props

        const colorGradient: ColorGradient = new ColorGradient(this.props.rgbIndex);
        const originalColor = colorGradient.getOriginalColor();

        let menuDropdown = menuConfig.map(
            (config: MenuConfig, index:number) => {
            
                let isSelected: boolean = (index === this.state.menuIndex)
                let style: any = {}
                let selectedStyling: string = ""

                if (isSelected) {
                    // we have to programatically set the style since the color is chosen from a color
                    // wheel
                    style.background = originalColor;
                    // below has to be set so the pseudo element created will inherit its color
                    // appropriately
                    style.borderLeftColor = originalColor;
                    selectedStyling = "SRC-pointed SRC-whiteText";
                } else {
                    // change background to class
                    selectedStyling = "SRC-blackText SRC-light-background";
                }

                let infoEnter: Info = {isSelected, originalColor}
                let infoLeave: Info = {isSelected,  originalColor: "#F5F5F5" }

                return (
                    <div
                        onMouseEnter={this.handleHoverLogic(infoEnter)}
                        onMouseLeave={this.handleHoverLogic(infoLeave)}
                        key={config.filter}
                        className={`SRC-hoverWhiteText SRC-menu SRC-hand-cursor SRC-menu-hover SRC-hoverBox SRC-text-chart ${selectedStyling}`}
                        onClick={() => {this.setState({menuIndex: index})}}
                        style={style}>
                        {config.filter}
                    </div>
                )
            }
        )
        
        let queryWrapper = menuConfig.map(
            (config: MenuConfig, index: number) => {
                let isSelected: boolean = (this.state.menuIndex === index)
                let style: any
                if (!isSelected) {
                    style = {visibility: "hidden", display: "none"}
                }
                return (
                <span style={style} >
                    <QueryWrapper
                    showMenu
                    initQueryRequest={{
                        concreteType: "org.sagebionetworks.repo.model.table.QueryBundleRequest",
                        partMask:
                        SynapseConstants.BUNDLE_MASK_QUERY_COLUMN_MODELS |
                        SynapseConstants.BUNDLE_MASK_QUERY_FACETS |
                        SynapseConstants.BUNDLE_MASK_QUERY_RESULTS,
                        query: {
                        isConsistent: false,
                        sql: config.sql,
                        limit: 25,
                        offset: 0
                        }
                    }}
                    filter={config.filter}
                    token={token}
                    rgbIndex={rgbIndex}>
                    <StackedRowHomebrew
                        synapseId={config.synapseId}
                        unitDescription={(config.unitDescription || "files")}
                        loadingScreen={<div>I'm loading as fast as I can</div>} />
                    <Facets/>
                        <SynapseTable 
                        title={config.title}
                        synapseId={config.synapseId}
                        // specify visible column count
                        visibleColumnCount={4} />  
                    </QueryWrapper>
                </span>
                )
            }
        )

        return (
            <div className="container-fluid">
                <div className="col-xs-2">
                    {menuDropdown}
                </div>
                <div className="col-xs-10">
                    {queryWrapper}
                </div>
            </div>
        )
    }
}
