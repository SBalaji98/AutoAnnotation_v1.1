// @flow

import React, { memo } from "react"
import SidebarBoxContainer from "../SidebarBoxContainer"
import DescriptionIcon from "@material-ui/icons/Description"
import { styled } from "@material-ui/core/styles"
import { grey } from "@material-ui/core/colors"
import Markdown from "react-markdown"
import Select from "react-select"
import { asMutable } from "seamless-immutable"
import{Meta_Data} from "./metadata-tools"


type Props = {
    metadata:Meta_Data
  }

export const MetaData = ({ allowed_metadata, metadata, onChange }: Props) => {
   
    return (
        <SidebarBoxContainer
            title="Meta Data"
            icon={<DescriptionIcon style={{ color: grey[700] }} />}
            expandedByDefault
        >

            <label >Climate</label>

            <Select className="w3-margin-bottom w3-margin-left w3-margin-right"
                placeholder="Classification"
                onChange={o =>
                    onChange({
                        ...(metadata),
                        climate: o.value
                    })
                    
                }
                value={
                    metadata.climate ? { label: metadata.climate, value: metadata.climate } : null
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
                  metadata.road ? { label: metadata.road, value: metadata.road } : null
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
                value={
                    metadata.time_of_day ? { label: metadata.time_of_day, value: metadata.time_of_day } : null
                  }
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
                value={
                    metadata.area ? { label: metadata.area, value: metadata.area } : null
                  }
                options={asMutable(
                    allowed_metadata.area.map(c => ({ value: c, label: c }))
                )}
            />
        </SidebarBoxContainer>

    )
}

export default memo(MetaData)
