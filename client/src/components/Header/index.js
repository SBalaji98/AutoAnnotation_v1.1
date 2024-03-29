// @flow

import React from "react"
import { makeStyles } from "@material-ui/core/styles"
import HeaderButton, { HeaderButtonContext } from "../HeaderButton"
import BackIcon from "@material-ui/icons/KeyboardArrowLeft"
import NextIcon from "@material-ui/icons/KeyboardArrowRight"
import PlayIcon from "@material-ui/icons/PlayArrow"
import PauseIcon from "@material-ui/icons/Pause"
import SettingsIcon from "@material-ui/icons/Settings"
import HelpIcon from "@material-ui/icons/Help"
import FullscreenIcon from "@material-ui/icons/Fullscreen"
import ExitIcon from "@material-ui/icons/ExitToApp"
import QueuePlayNextIcon from "@material-ui/icons/QueuePlayNext"
import HotkeysIcon from "@material-ui/icons/Keyboard"
import styles from "./styles"
import KeyframeTimeline from "../KeyframeTimeline"
import classnames from "classnames"
import BookmarkIcon from "@material-ui/icons/Bookmark"
const useStyles = makeStyles(styles)

type Props = {
  onHeaderButtonClick: string => any,
  title: string,
  inFullScreen?: boolean,
  multipleImages?: boolean,
  isAVideoFrame?: boolean,
  nextVideoFrameHasRegions?: boolean,
  videoDuration?: number,
  videoPlaying?: boolean,

  onChangeCurrentTime?: (newTime: number) => any,
  onPlayVideo?: Function,
  onPauseVideo?: Function
}

export const Header = (
  {
    state,
  onHeaderButtonClick,
  title,
  inFullScreen,
  videoMode,
  isAVideoFrame = false,
  nextVideoFrameHasRegions = false,
  videoDuration,
  currentVideoTime,
  multipleImages,
  videoPlaying,
  onChangeCurrentTime,
  keyframes,
  alwaysShowPrevButton,
  alwaysShowNextButton
}: Props) => {
  const classes = useStyles()
  return (
    <div className={classes.header}>
      <div className={classnames(classes.fileInfo, videoMode && "videoMode")}>
        {title}
      </div>
      <div className={classnames(classes.fileInfo, videoMode && "videoMode")}>
      Mode: {(state.annotatemode==="object_detection")?("Object Detection"):("Segmentation")} 
      </div>
      {videoMode && (
        <KeyframeTimeline
          key="keyframeTimeline"
          currentTime={currentVideoTime}
          duration={videoDuration}
          onChangeCurrentTime={onChangeCurrentTime}
          keyframes={keyframes}
        />
      )}
      <div className={classes.headerActions}>
        <HeaderButtonContext.Provider value={{ onHeaderButtonClick }}>
          {(multipleImages || alwaysShowPrevButton) && (
            <HeaderButton name="Prev" Icon={BackIcon} />
          )}
          {(multipleImages || alwaysShowNextButton) && (
            <>
              <HeaderButton name="Next" Icon={NextIcon} />
              <HeaderButton
                name="Clone"
                disabled={nextVideoFrameHasRegions}
                Icon={QueuePlayNextIcon}
              />
            </>
          )}
          {videoMode && (
            <>
              {!videoPlaying ? (
                <HeaderButton key="play" name="Play" Icon={PlayIcon} />
              ) : (
                <HeaderButton key="pause" name="Pause" Icon={PauseIcon} />
              )}
            </>
          )}
          <HeaderButton name={(state.annotatemode==="object_detection")?("SEGMENTATION"):("OBJECT DETECTION")} Icon={HotkeysIcon} />
          {/* <HeaderButton name="changemode" Icon={HotkeysIcon} /> */}
          <HeaderButton name={(state.lockMode===false)?("lock"):("unlock")} Icon={QueuePlayNextIcon} />

          {(state.curr_image_index > 0) && (
          <HeaderButton name="prev image" Icon={BackIcon} />
          )}
          <HeaderButton name="next image" Icon={NextIcon} />
        

          <HeaderButton name="Settings" Icon={SettingsIcon} />
          {inFullScreen ? (
            <HeaderButton name="Window" Icon={FullscreenIcon} />
          ) : (
            <HeaderButton name="Fullscreen" Icon={FullscreenIcon} />
          )}
          {/* <HeaderButton name="Hotkeys" Icon={HotkeysIcon} /> */}
          {/* <HeaderButton name="Save" Icon={ExitIcon} /> */}
          <HeaderButton name="Review" Icon={BookmarkIcon} />

        </HeaderButtonContext.Provider>
      </div>
    </div>
  )
}

export default Header
