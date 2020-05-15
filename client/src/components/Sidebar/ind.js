// @flow

import React from "react"
import { makeStyles } from "@material-ui/core/styles"
import TaskDescription from "../TaskDescriptionSidebarBox"
import ImageSelector from "../ImageSelectorSidebarBox"
import RegionSelector from "../RegionSelectorSidebarBox"
import History from "../HistorySidebarBox"
import DebugBox from "../DebugSidebarBox"
import TagsSidebarBox from "../TagsSidebarBox"
import KeyframesSelector from "../KeyframesSelectorSidebarBox"
import type { Region } from "../ImageCanvas/region-tools.js"
import Shortcuts from "../Shortcuts"
import PreventScrollToParents from "../PreventScrollToParents"
import { Preview } from "../Preview"
import { MetaData } from "../Metadata/index"
import {Meta_Data} from "../Metadata/metadata-tools"
const useStyles = makeStyles({})

type Image = {
  name: string,
  src: string,
  cls?: string,
  tags?: Array<string>,
  thumbnailSrc?: string,
  regions?: Array<Region>
}

type Props = {
  debug: any,
  taskDescription: string,
  images?: Array<Image>,
  regions: Array<Region>,
  history: Array<{ state: Object, name: string, time: Date }>,

  labelImages?: boolean,
  currentImage?: Image,
  imageClsList?: Array<string>,
  imageTagList?: Array<string>,
  metadata?:Meta_Data,
  onChangeImage: Image => any,
  onSelectRegion: Region => any,
  onSelectImage: Image => any,
  onChangeRegion: Region => any,
  onDeleteRegion: Region => any,
  onRestoreHistory: () => any,
  onShortcutActionDispatched: (action: any) => any
}

const emptyArr = []

export const Sidebar = ({
  metadata,
  allowed_metadata,
  preview,
  previewList,
  debug,
  taskDescription,
  keyframes,
  images,
  regions,
  history,
  labelImages,
  currentImage,
  currentVideoTime,
  imageClsList,
  imageTagList,
  onChangeMetadata,
  onChangeImage,
  onSelectRegion,
  onSelectImage,
  onChangeRegion,
  onDeleteRegion,
  onRestoreHistory,
  onChangeVideoTime,
  onDeleteKeyframe,
  onShortcutActionDispatched
}: Props) => {
  const classes = useStyles()
  let defaultMeta ={
    climate:'None',
    road:'None',
    time_of_day:"None",
    area:"None"
  }
  // if(metadata!=null){
  //   defaultMeta={...defaultMeta,
  //   metadata
  //   }
  // }

  if (!regions) regions = emptyArr

  return (
    <div>
      <MetaData allowed_metadata={allowed_metadata}
        metadata={(metadata===null)?defaultMeta:metadata}
        onChange={onChangeMetadata}
      />
      <Preview
        handlePreview={preview}
        previewImages={previewList}
      />

      {debug && <DebugBox state={debug} lastAction={debug.lastAction} />}
      {/* {(taskDescription || "").length > 1 && (
        <TaskDescription description={taskDescription} />
      )} */}
      {labelImages && (
        <TagsSidebarBox
          currentImage={currentImage}
          imageClsList={imageClsList}
          imageTagList={imageTagList}
          onChangeImage={onChangeImage}
          expandedByDefault
        />
      )}
      {images && images.length > 1 && (
        <ImageSelector onSelect={onSelectImage} images={images} />
      )}
      <RegionSelector
        regions={regions}
        onSelectRegion={onSelectRegion}
        onChangeRegion={onChangeRegion}
        onDeleteRegion={onDeleteRegion}
      />
      <History history={history} onRestoreHistory={() => onRestoreHistory()} />

      {keyframes && (
        <KeyframesSelector
          currentVideoTime={currentVideoTime}
          keyframes={keyframes}
          onChangeVideoTime={onChangeVideoTime}
          onDeleteKeyframe={onDeleteKeyframe}
        />
      )}
      {/* <Shortcuts onShortcutActionDispatched={onShortcutActionDispatched} /> */}
    </div>
  )
}

export default Sidebar
