// @flow

import React, { memo, Component } from "react"
import SidebarBoxContainer from "../SidebarBoxContainer"
import DescriptionIcon from "@material-ui/icons/Description"
import { styled } from "@material-ui/core/styles"
import { grey } from "@material-ui/core/colors"
import Markdown from "react-markdown"
import Select from "react-select"
import { asMutable } from "seamless-immutable"

export class MetaData extends Component {

    state = {
        climate: '',
        road: '',
        area: '',
        time_of_day: ''
    }

    handleChange(event) {
        this.setState({
          [event.label]: event.value
        });
        console.log(event.value)
        
      }

    componentDidMount() {
        const {metadata} = this.props
        console.log(metadata)
        if (metadata != null) {
            console.log("i")
            this.setState({
                climate:metadata.climate?metadata.climate:'',
                road:metadata.road?metadata.road:'',
                area:metadata.area?metadata.area:'',
                time_of_day:metadata.time_of_day?metadata.time_of_day:''
            })
        }

    }


    // allowed_metadata, metadata, onChange
    render() {
       
        const {allowed_metadata,onChange,metadata}=this.props
        let {climate,road,time_of_day,area}=this.state
        console.log(climate)

    

        return (
            <SidebarBoxContainer
                title="Meta Data"
                icon={<DescriptionIcon style={{ color: grey[700] }} />}
                expandedByDefault
            >

                <label >Climate</label>

                <Select className="w3-margin-bottom w3-margin-left w3-margin-right"
                    placeholder="Classification"
                    onChange={o =>{
                        this.handleChange(o)
                        onChange({
                            ...(metadata:any),
                            climate: o.value
                        })

                    }}
                    value={
                       
                            metadata.climate ? { label: metadata.climate, value: metadata.climate } : null
                          
                        // { label:this.state.climate, value: climate }
                        // metadata.climate ? { label: metadata.climate, value: metadata.climate } : null
                      }

                    options={asMutable(
                        allowed_metadata.climate.map(c => ({ value: c, label: c }))
                    )}
                />



                <label>Road</label>

                <Select className="w3-margin-bottom w3-margin-left w3-margin-right"
                    placeholder="Classification"
                    onChange={o =>
                        onChange({
                            ...(metadata),
                            road: o.value
                        })
                    }
                    value={
                    { label: road, value: road } 
                    }
                    options={asMutable(
                        allowed_metadata.road.map(c => ({ value: c, label: c }))
                    )}
                />


                <label>Time of Day</label>

                <Select className="w3-margin-bottom w3-margin-left w3-margin-right"
                    placeholder="Classification"
                    onChange={o =>
                        onChange({
                            ...(metadata),
                            time_of_day: o.value
                        })
                    }
                    // value={
                    //     metadata.time_of_day ? { label: metadata.time_of_day, value: metadata.time_of_day } : null
                    //   }
                    options={asMutable(
                        allowed_metadata.time_of_day.map(c => ({ value: c, label: c }))
                    )}
                />


                <label>Area</label>

                <Select className="w3-margin-bottom w3-margin-left w3-margin-right"
                    placeholder="Classification"
                    onChange={o =>
                        onChange({
                            ...(metadata),
                            area: o.value
                        })
                    }
                    // value={
                    //     metadata.area ? { label: metadata.area, value: metadata.area } : null
                    //   }
                    options={asMutable(
                        allowed_metadata.area.map(c => ({ value: c, label: c }))
                    )}
                />
                <div>
                    <label>Number of Lanes</label>
                    <input className="w3-button w3-border w3-margin-bottom" placeholder='no. of Lanes' type="number"
                        onChange={o =>
                            onChange({
                                ...(metadata),
                                no_of_lanes: o.currentTarget.value
                            })
                        }
                    ></input>
                </div>
                <div>
                    <label>Number of classes</label>
                    <input className="w3-button w3-border w3-margin-bottom " placeholder='no. of classes' type="number"
                        onChange={o =>
                            onChange({
                                ...(metadata),
                                no_of_classes: o.currentTarget.value
                            })
                        }></input>
                </div>


            </SidebarBoxContainer>

        )
    }
}

export default memo(MetaData)
