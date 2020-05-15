// @flow

import React, { memo } from "react"
import SidebarBoxContainer from "../SidebarBoxContainer"
import DescriptionIcon from "@material-ui/icons/Description"
import { styled } from "@material-ui/core/styles"
import { grey } from "@material-ui/core/colors"
import Markdown from "react-markdown"
import Select from "react-select"
import { asMutable } from "seamless-immutable"
import RateReviewIcon from "@material-ui/icons/RateReview"

export const Preview = ({ handlePreview, previewImages }: props) => {
  return (
    <SidebarBoxContainer
      title="Review"
      icon={<RateReviewIcon style={{ color: grey[700] }} />}
      expandedByDefault
    >
      {
        (previewImages.length > 0) && (
          <table className="w3-table" >
            <thead >
              <tr>
                <th>sl.No</th>
                <th>Images</th>
              </tr>
            </thead>

            <tbody>
              {
                previewImages.map((item, i) => (
                  <tr onClick={() => handlePreview(item)}>
                    <td>{i + 1}</td>
                    <td className='w3-hover-grey'>{item[1]}</td>
                  </tr>
                ))}
            </tbody>
          </table >
        )
      }

    </SidebarBoxContainer>

  )
}

export default memo(Preview)
