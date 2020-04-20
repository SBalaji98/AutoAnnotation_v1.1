// @flow

import React, { useReducer, useEffect } from "react"
import type { Node } from "react"
import MainLayout from "../MainLayout/ind"
import type {
    ToolEnum,
    Image,
    Mode,
    MainLayoutState,
    Action
} from "../MainLayout/types"
import SettingsProvider from "../SettingsProvider"
import { useSettings } from "../SettingsProvider"


import combineReducers from "./reducers/combine-reducers.js"
import generalReducer from "./reducers/general-reducer.js"
import imageReducer from "./reducers/image-reducer.js"
import videoReducer from "./reducers/video-reducer.js"
import historyHandler from "./reducers/history-handler.js"
import useEventCallback from "use-event-callback"
import makeImmutable, { without } from "seamless-immutable"

type Props = {
    taskDescription: string,
    allowedArea?: { x: number, y: number, w: number, h: number },
    regionTagList?: Array<string>,
    regionClsList?: Array<string>,
    imageTagList?: Array<string>,
    imageClsList?: Array<string>,
    enabledTools?: Array<string>,
    showTags?: boolean,
    selectedImage?: string,
    images?: Array<Image>,
    showPointDistances?: boolean,
    pointDistancePrecision?: number,
    RegionEditLabel?: Node,
    onExit: MainLayoutState => any,
    videoTime?: number,
    videoSrc?: string,
    keyframes?: Object,
    videoName?: string,

}


export const Annotator = ({
    images,
    allowedArea,
    selectedImage = images && images.length > 0 ? images[0].src : undefined,
    showPointDistances,
    pointDistancePrecision,
    showTags = true,
    enabledTools = ["select", "create-point", "create-box"],
    regionTagList = [],
    regionClsList = [],
    imageTagList = [],
    imageClsList = [],
    keyframes = {},
    taskDescription,
    RegionEditLabel,
    videoSrc,
    videoTime = 0,
    videoName,
    onExit,
    onNextImage,
    onPrevImage,
    nextImage,
    prevImage,
    changeAnnotateMode,
    annotatemode
}: Props) => {
    const settings = useSettings()
    if (!images && !videoSrc)
        return 'Missing required prop "images" or "videoSrc"'
    const annotationType = images ? "image" : "video"
    const [state, dispatchToReducer] = useReducer(
        historyHandler(
            combineReducers(
                annotationType === "image" ? imageReducer : videoReducer,
                generalReducer
            )
        ),
        makeImmutable(
            {
                annotationType,
                nextImage,
                prevImage,
                changeAnnotateMode,
                annotatemode,
                showTags,
                allowedArea,
                showPointDistances,
                pointDistancePrecision,
                selectedTool: "select",
                mode: null,
                taskDescription,
                labelImages: imageClsList.length > 0 || imageTagList.length > 0,
                regionClsList,
                regionTagList,
                imageClsList,
                imageTagList,
                currentVideoTime: videoTime,
                enabledTools,
                history: [],
                videoName,
                ...(annotationType === "image"
                    ? {
                        selectedImage,
                        images,
                        selectedImageFrameTime:
                            images && images.length > 0 ? images[0].frameTime : undefined
                    }
                    : {
                        videoSrc,
                        keyframes
                    })
            }
        )
    )

    const dispatch = useEventCallback((action: Action) => {
        if (action.type === "HEADER_BUTTON_CLICKED") {
            if (["Exit", "Done", "Save", "Complete", "Next Image"].includes(action.buttonName)) {
                return onExit(without(state, "history"))
            }
            else if (action.buttonName === "Next" && onNextImage) {
                return onNextImage(without(state, "history"))
            } else if (action.buttonName === "Prev" && onPrevImage) {
                return onPrevImage(without(state, "history"))
            }
        }
        dispatchToReducer(action)
    })

    useEffect(() => {
        dispatchToReducer({ type: "SELECT_IMAGE", image: state.images.find(img => img.src === selectedImage) })
    }, [selectedImage])
    useEffect(() => {
        dispatchToReducer({ type: "RELOAD", image: images })
        dispatchToReducer({ type: "SELECT_IMAGE", image: images[0] })
    }, [images])

    useEffect(() => {
        dispatchToReducer({ type: "CLASS_LIST", classlist: regionClsList })
    }, [regionClsList])

    useEffect(() => {
        if (state.annotatemode === "Object Detection") {
            dispatchToReducer({ type: "ANNOTATION_MODE" })
            dispatchToReducer({ type: "SELECT_TOOL", selectedTool: "create-box" })
            state.changeAnnotateMode(state.annotatemode)

        } else {
            dispatchToReducer({ type: "ANNOTATION_MODE" })
            dispatchToReducer({ type: "SELECT_TOOL", selectedTool: "create-polygon" })
            state.changeAnnotateMode(state.annotatemode)

        }

    }, [state.annotatemode])


    return (
        <SettingsProvider>
            <MainLayout
                RegionEditLabel={RegionEditLabel}
                alwaysShowNextButton={Boolean(onNextImage)}
                alwaysShowPrevButton={Boolean(onPrevImage)}
                state={state}
                dispatch={dispatch}
            />
        </SettingsProvider>
    )
}

export default Annotator
