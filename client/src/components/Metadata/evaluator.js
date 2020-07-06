// @flow

import React, { memo } from "react"
import SidebarBoxContainer from "../SidebarBoxContainer"
import DescriptionIcon from "@material-ui/icons/Description"
import { styled } from "@material-ui/core/styles"
import { grey } from "@material-ui/core/colors"
import Markdown from "react-markdown"
import Select from "react-select"
import { asMutable } from "seamless-immutable"
import { Meta_Data } from "./metadata-tools"



// type Props = {
//     metadata: Meta_Data
// }
const MarkdownContainer = styled("div")({
    paddingLeft: 16,
    paddingRight: 16,
    fontSize: 12,
    "& h1": { fontSize: 18 },
    "& h2": { fontSize: 14 },
    "& h3": { fontSize: 12 },
    "& h4": { fontSize: 12 },
    "& h5": { fontSize: 12 },
    "& h6": { fontSize: 12 },
    "& p": { fontSize: 12 },
    "& a": {},
    "& img": { width: "100%" }
})

export const MetaData = ({ metadata }: Props) => {

    // const metadata={
    //     road:'least',
    //     area:'rural',
    //     time_of_day:'night',
    //     climate:'sunny'
    // }
    return (
        <SidebarBoxContainer
            title="Meta Data"
            icon={<DescriptionIcon style={{ color: grey[700] }} />}
            expandedByDefault
        >

            <MarkdownContainer>
                <h2><strong>Climate : {metadata.climate ? metadata.climate : null}</strong></h2>
            </MarkdownContainer>

            <MarkdownContainer>
                <h2><strong>Road :  {metadata.road ? metadata.road : null}</strong></h2>
            </MarkdownContainer>

            <MarkdownContainer>
                <h2><strong>Time of Day : {metadata.time_of_day ? metadata.time_of_day : null}</strong></h2>
            </MarkdownContainer>

            <MarkdownContainer>
                <h2><strong>Area : {metadata.area ? metadata.area : null}</strong></h2>
            </MarkdownContainer>

        </SidebarBoxContainer>


        // <label>Road</label>

        // <Select className="w3-margin-bottom w3-margin-left w3-margin-right"
        //     placeholder="Classification"
        //     onChange={o =>
        //         onChange({
        //             ...(metadata),
        //             road: o.value
        //         })
        //     }
        //     value={
        //         metadata.road ? { label: metadata.road, value: metadata.road } : null
        //     }
        //     options={asMutable(
        //         allowed_metadata.road.map(c => ({ value: c, label: c }))
        //     )}
        // />


        // <label>Time of Day</label>

        // <Select className="w3-margin-bottom w3-margin-left w3-margin-right"
        //     placeholder="Classification"
        //     onChange={o =>
        //         onChange({
        //             ...(metadata),
        //             time_of_day: o.value
        //         })
        //     }
        //     value={
        //         metadata.time_of_day ? { label: metadata.time_of_day, value: metadata.time_of_day } : null
        //     }
        //     options={asMutable(
        //         allowed_metadata.time_of_day.map(c => ({ value: c, label: c }))
        //     )}
        // />


        // <label>Area</label>

        // <Select className="w3-margin-bottom w3-margin-left w3-margin-right"
        //     placeholder="Classification"
        //     onChange={o =>
        //         onChange({
        //             ...(metadata),
        //             area: o.value
        //         })
        //     }
        //     value={
        //         metadata.area ? { label: metadata.area, value: metadata.area } : null
        //     }
        //     options={asMutable(
        //         allowed_metadata.area.map(c => ({ value: c, label: c }))
        //     )}
        // />

    )
}

export default memo(MetaData)
