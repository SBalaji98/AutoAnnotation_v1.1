import React, { Component } from "react";
import axios from "axios";
import ReactImageAnnotate from "../Annotator/ind";
import swal from "sweetalert";
import ErrorBoundary from '../ErrorBoundary/ErrorBoundary'



class ImageRender extends Component {


    state = {
        src: null,
        image_key: "",
        annotatemode: "object_detection",
        curr_image_index: 0,
        call_type: 'first',
        regions: [],
        metadata: '',
        class_list: '',
        seg_class: [],
        obj_class: [],
        allowed_metadata: {},
        dimension: {
            imgHeight: 0,
            imgWidth: 0
        },
        previewList: [],
        loading: true,
        message: 'Fetching Image for annotation',
        projectId: null
    };

    async toArrayBuffer(myBuf) {
        var myBuffer = new ArrayBuffer(myBuf.length);
        var res = new Uint8Array(myBuffer);
        for (var i = 0; i < myBuf.length; ++i) {
            res[i] = myBuf[i];
        }
        return myBuffer;
    }

    getImageSize = async (img) => {
        //get the size of the image
        let dimension = {}
        return new Promise((resolve, reject) => {
            let theImage = new Image();
            theImage.src = img
            theImage.onload = () => resolve(dimension = { imgHeight: theImage.height, imgWidth: theImage.width })
        })
    }

    titleHandler = (error) => {
        switch (error.message) {
            case "Cannot read property 'map' of undefined":
                return "No segmentation data "
            case "Cannot read property 'data' of undefined":
                return "No more images left for you"
            case "Cannot read property '0' of undefined":
                return "Image not valid"
            default:
                return error.message
        }

    }

    getRandomId = () => Math.random().toString().split(".")[1]


    async main_api(type, key, mode) {
        //main api
        let dim;
        let imgUrl;
        let response;
        let exit = false;
        console.log("Mainapi")
        if (exit) {
            return
        }
        await axios.get(
            "annotations/get-image-data-by-user",
            {
                headers: {
                    Authorization: `bearer ${localStorage.getItem("jwt")}`
                },
                params: {
                    annotate_mode: `${mode}`,
                    call_type: type,
                    curr_image_index: (type === 'first') ? 0 : this.state.curr_image_index,
                    image_key: (type === 'first') ? key : key[1],
                    projectid: (type === 'first') ? this.state.projectId : key[0]
                }
            }
        ).then((res) => {
            console.log(`[${type}]`, res)
            if (res.data.error) {
                this.setState({ loading: false, src: null })
                exit = true
                swal({
                    title: res.data.error,
                    text: "come back later",
                    icon: "warning",
                    buttons: true,
                    // dangerMode: true,
                })
            }
            else {
                localStorage.setItem('metadata', JSON.stringify(res.data.metadata));
                this.toArrayBuffer(res.data.image.data)
                    .then((t) => {

                        const imgFile = new Blob([t], {
                            type: "image/jpeg"
                        });
                        imgUrl = URL.createObjectURL(imgFile);
                        this.getImageSize(imgUrl)
                            .then((dimension) => {
                                dim = dimension
                                let regions = []
                                if (res.data.annotations != null) {
                                    // if ((type === 'next' || 'review') && (res.data.annotations.obj_detect || res.data.annotations.segmentation)) {
                                    if (type === 'first') {
                                        (mode === "object_detection") ?
                                            (res.data.annotations.obj_detect.map((annotation, i) => {
                                                regions.push({
                                                    cls: annotation.Class_Name,
                                                    highlighted: false,
                                                    id: this.getRandomId(),
                                                    x: annotation.Region[0] / dimension.imgWidth,
                                                    y: annotation.Region[1] / dimension.imgHeight,
                                                    w: annotation.Region[2] / dimension.imgWidth,
                                                    h: annotation.Region[3] / dimension.imgHeight,
                                                    color: "hsl(82,100%,50%)",
                                                    type: "box"
                                                })
                                            })) : (
                                                res.data.annotations.segmentation.map((annotation, i) => {
                                                    let points = []
                                                    annotation.Region.map((seg, i) => {
                                                        points.push([seg[0] / dimension.imgWidth, seg[1] / dimension.imgHeight])
                                                    })
                                                    regions.push({
                                                        cls: annotation.Class_Name,
                                                        highlighted: false,
                                                        id: this.getRandomId(),
                                                        points: points,
                                                        color: "hsl(82,100%,50%)",
                                                        type: "polygon"
                                                    })
                                                })
                                            )
                                    }
                                    else {
                                        (mode === "object_detection") ?
                                            (res.data.annotations.map((annotation, i) => {
                                                regions.push({
                                                    cls: annotation.cls,
                                                    highlighted: false,
                                                    id: annotation.id,
                                                    x: annotation.x / dimension.imgWidth,
                                                    y: annotation.y / dimension.imgHeight,
                                                    w: annotation.w / dimension.imgWidth,
                                                    h: annotation.h / dimension.imgHeight,
                                                    color: "hsl(82,100%,50%)",
                                                    type: "box"
                                                })
                                            })
                                            ) : (
                                                res.data.annotations.map((annotation, i) => {
                                                    let points = []
                                                    annotation.points.map((seg, i) => {
                                                        points.push([seg[0] / dimension.imgWidth, [seg[1] / dimension.imgHeight]])
                                                    })
                                                    regions.push({
                                                        cls: annotation.cls,
                                                        highlighted: false,
                                                        id: annotation.id,
                                                        points: points,
                                                        color: "hsl(82,100%,50%)",
                                                        type: "polygon"
                                                    })
                                                })
                                            )
                                    }
                                    console.log("[generarted regions]", regions)
                                    this.setState({
                                        loading: false,
                                        curr_image_index: this.state.curr_image_index,
                                        src: imgUrl,
                                        regions: regions,
                                        metadata: res.data.metadata,
                                        image_key: res.data.image_key,
                                        projectId: res.data.projectId,
                                        dimension: dimension,
                                    })
                                }
                                else {
                                    this.setState({
                                        // region:null,
                                        loading: false
                                    })
                                    swal({
                                        title: "NO Annotations",
                                        icon: "warning",
                                        buttons: true,
                                        // dangerMode: true,
                                    })
                                    this.setState({
                                        curr_image_index: this.state.curr_image_index,
                                        src: imgUrl,
                                        regions: null,
                                        metadata: res.data.metadata,
                                        image_key: res.data.image_key,
                                        dimension: dimension,
                                        loading: false,
                                        projectId: res.data.projectId

                                    })
                                }
                            })
                            .catch(error => {
                                this.setState({
                                    loading: false,
                                    curr_image_index: this.state.curr_image_index,
                                    src: imgUrl,
                                    regions: null,
                                    metadata: res.data.metadata,
                                    image_key: res.data.image_key,
                                    projectId: res.data.projectId,
                                    dimension: dim

                                })
                                if (error.message !== "Cannot read property 'map' of undefined") {
                                    swal({
                                        title: this.titleHandler(error),
                                        icon: "warning",
                                        buttons: true,
                                        // dangerMode: true,
                                    })
                                }
                            })
                    })
                    .catch(error => {
                        this.setState({
                            loading: false,
                            curr_image_index: this.state.curr_image_index,
                            src: imgUrl,
                            regions: null,
                            metadata: res.data.metadata,
                            image_key: res.data.image_key,
                            dimension: dim,
                            projectId: res.data.projectId,

                        })
                        swal({
                            title: this.titleHandler(error),
                            icon: "warning",
                            buttons: true,
                            // dangerMode: true,
                        })
                    })
            }
        })
            .catch(error => {
                this.setState({
                    loading: false,
                    curr_image_index: this.state.curr_image_index,
                    src: imgUrl,
                    regions: null,
                    dimension: dim,

                })
                swal({
                    title: this.titleHandler(error),
                    buttons: true,
                    // dangerMode: true,
                })
            })
    }


    postImage = async (t, type) => {
        console.log("next", t)
        let updated_regions = []
        let imgUrl
        let dim
        let exit = false
        localStorage.setItem("metadata", JSON.stringify(t.metadata))
        const { imgWidth, imgHeight } = this.state.dimension
        if (t.metadata != null) {
            if ((t.images[0].regions !== null)) {
                if (this.state.annotatemode === "object_detection") {
                    t.images[0].regions.map((annotation) => {
                        if (!annotation.cls) {
                            this.setState({
                                loading: false,
                                regions: t.images[0].regions,
                                metadata: (JSON.parse(localStorage.getItem("metadata"))) ? JSON.parse(localStorage.getItem("metadata")) : null
                            })
                            exit = true
                            swal({
                                title: "Annotations class cannot be empty",
                                icon: "warning",
                                buttons: true,
                                // dangerMode: true,
                            })

                        }
                        updated_regions.push({
                            cls: annotation.cls,
                            highlighted: false,
                            id: annotation.id,
                            x: annotation.x * imgWidth,
                            y: annotation.y * imgHeight,
                            w: annotation.w * imgWidth,
                            h: annotation.h * imgHeight,
                            color: "hsl(82,100%,50%)",
                            type: "box",
                            cls_id: `${this.state.class_list.indexOf(annotation.cls)}`
                        })
                    })
                }
                else {
                    t.images[0].regions.map((annotation) => {
                        let points = []
                        annotation.points.map((seg, i) => {
                            points.push([seg[0] * imgWidth, seg[1] * imgHeight])
                        })
                        updated_regions.push({
                            cls: annotation.cls,
                            highlighted: false,
                            id: annotation.id,
                            points: points,
                            color: "hsl(82,100%,50%)",
                            type: "polygon",
                            cls_id: `${this.state.class_list.indexOf(annotation.cls)}`
                        })

                    })
                }

                console.log("[generarted regions]", updated_regions)
                if (type === 'review') {
                    if (localStorage.getItem("checkList")) {
                        const checkList = JSON.parse(localStorage.getItem("checkList"));
                        const newCheckList = [...checkList, [this.state.projectId, this.state.image_key]]
                        localStorage.setItem('checkList', JSON.stringify(newCheckList));
                    }
                    else {
                        localStorage.setItem('checkList', JSON.stringify([[this.state.projectId, this.state.image_key]]))
                    }
                }
                if (exit) {
                    return
                }

                axios.post('/annotations/update-get-image-data-by-user',
                    {
                        image_key: this.state.image_key,
                        metadata: t.metadata,
                        annotations: updated_regions,
                        projectid: this.state.projectId
                    },
                    {
                        headers: {
                            Authorization: `bearer ${localStorage.getItem("jwt")}`
                        },
                        params: {
                            annotate_mode: this.state.annotatemode,
                            call_type: (type === 'review') ? 'next' : type,
                            curr_image_index: (type === "previous") ? (this.state.curr_image_index - 1) : (this.state.curr_image_index + 1)
                        }
                    })
                    .then((res) => {
                        localStorage.setItem('metadata', JSON.stringify(res.data.metadata));
                        console.log("[next api]", res)
                        if (res.data.error) {
                            this.setState({ loading: false, src: null })
                            exit = true
                            swal({
                                title: res.data.error,
                                icon: "warning",
                                buttons: true,
                                // dangerMode: true,
                            })
                        } else {
                            this.toArrayBuffer(res.data.image.data)
                                .then((t) => {
                                    const imgFile = new Blob([t], {
                                        type: "image/jpeg"
                                    });
                                    imgUrl = URL.createObjectURL(imgFile);
                                    this.getImageSize(imgUrl)
                                        .then((dimension) => {
                                            dim = dimension
                                            let regions = []
                                            if ((type === 'next' || 'review') && (res.data.annotations.obj_detect || res.data.annotations.segmentation)) {
                                                (this.state.annotatemode === "object_detection") ?
                                                    (res.data.annotations.obj_detect.map((annotation, i) => {
                                                        regions.push({
                                                            cls: annotation.Class_Name,
                                                            highlighted: false,
                                                            id: this.getRandomId(),
                                                            x: annotation.Region[0] / dimension.imgWidth,
                                                            y: annotation.Region[1] / dimension.imgHeight,
                                                            w: annotation.Region[2] / dimension.imgWidth,
                                                            h: annotation.Region[3] / dimension.imgHeight,
                                                            color: "hsl(82,100%,50%)",
                                                            type: "box"
                                                        })
                                                    })) : (
                                                        res.data.annotations.segmentation.map((annotation, i) => {
                                                            let points = []
                                                            annotation.Region.map((seg, i) => {
                                                                points.push([seg[0] / dimension.imgWidth, seg[1] / dimension.imgHeight])
                                                            })
                                                            regions.push({
                                                                cls: annotation.Class_Name,
                                                                highlighted: false,
                                                                id: this.getRandomId(),
                                                                points: points,
                                                                color: "hsl(82,100%,50%)",
                                                                type: "polygon"
                                                            })
                                                        })
                                                    )
                                            }
                                            else {
                                                (this.state.annotatemode === "object_detection") ?
                                                    (res.data.annotations.map((annotation, i) => {

                                                        regions.push({
                                                            cls: annotation.cls,
                                                            highlighted: false,
                                                            id: annotation.id,
                                                            x: annotation.x / dimension.imgWidth,
                                                            y: annotation.y / dimension.imgHeight,
                                                            w: annotation.w / dimension.imgWidth,
                                                            h: annotation.h / dimension.imgHeight,
                                                            color: "hsl(82,100%,50%)",
                                                            type: "box"
                                                        })
                                                    })
                                                    ) : (
                                                        res.data.annotations.map((annotation, i) => {
                                                            let points = []
                                                            annotation.points.map((seg, i) => {
                                                                points.push([seg[0] / dimension.imgWidth, [seg[1] / dimension.imgHeight]])
                                                            })
                                                            regions.push({
                                                                cls: annotation.cls,
                                                                highlighted: false,
                                                                id: annotation.id,
                                                                points: points,
                                                                color: "hsl(82,100%,50%)",
                                                                type: "polygon"
                                                            })
                                                        })
                                                    )
                                            }
                                            this.setState({
                                                curr_image_index: (type === "previous") ? (this.state.curr_image_index - 1) : (this.state.curr_image_index + 1),
                                                src: imgUrl,
                                                regions: regions,
                                                metadata: res.data.metadata,
                                                image_key: res.data.image_key,
                                                dimension: dimension,
                                                previewList: (JSON.parse(localStorage.getItem("checkList"))) ? JSON.parse(localStorage.getItem("checkList")) : [],
                                                projectId: res.data.projectId,
                                                loading: false
                                            })
                                        })
                                        .catch(error => {
                                            this.setState({
                                                loading: false,
                                                curr_image_index: (type === "previous") ? (this.state.curr_image_index - 1) : (this.state.curr_image_index + 1),
                                                src: imgUrl,
                                                metadata: res.data.metadata,
                                                image_key: res.data.image_key,
                                                dimension: dim,
                                                regions: null,
                                                projectId: res.data.projectId,

                                                previewList: (JSON.parse(localStorage.getItem("checkList"))) ? JSON.parse(localStorage.getItem("checkList")) : [],
                                            })
                                            if (error.message !== "Cannot read property 'map' of undefined") {

                                                swal({
                                                    title: this.titleHandler(error),
                                                    icon: "warning",
                                                    buttons: true,
                                                    // dangerMode: true,
                                                })
                                            }
                                        })

                                })
                                .catch(error => {
                                    this.setState({
                                        loading: false,
                                        curr_image_index: (type === "previous") ? (this.state.curr_image_index - 1) : (this.state.curr_image_index + 1),
                                        src: imgUrl,
                                        metadata: res.data.metadata,
                                        image_key: res.data.image_key,
                                        dimension: dim,
                                        regions: null,
                                        projectId: res.data.projectId,
                                        previewList: (JSON.parse(localStorage.getItem("checkList"))) ? JSON.parse(localStorage.getItem("checkList")) : [],
                                    })
                                    if (error.message !== "Cannot read property 'map' of undefined") {
                                        swal({
                                            title: this.titleHandler(error),
                                            icon: "warning",
                                            buttons: true,
                                            // dangerMode: true,
                                        })
                                    }
                                })
                        }
                    })
                    .catch(error => {
                        this.setState({
                            loading: false,
                            curr_image_index: (type === "previous") ? (this.state.curr_image_index - 1) : (this.state.curr_image_index + 1),
                            src: imgUrl,
                            dimension: dim,
                            regions: null,
                            previewList: (JSON.parse(localStorage.getItem("checkList"))) ? JSON.parse(localStorage.getItem("checkList")) : [],
                        })
                        if (error.message !== "Cannot read property 'map' of undefined") {
                            swal({
                                title: this.titleHandler(error),
                                icon: "warning",
                                buttons: true,
                                // dangerMode: true,
                            })
                        }
                    })
            }
            else {
                this.setState({ loading: false, metadata: (JSON.parse(localStorage.getItem("metadata"))) ? JSON.parse(localStorage.getItem("metadata")) : null })
                // t.metadata})
                swal({
                    title: "Annotations  cannot be empty",
                    icon: "warning",
                    buttons: true,
                    // dangerMode: true,
                })
            }
        }
        else {
            console.log("[image]", t.images[0].regions, "[state]", this.state.regions)
            this.setState({
                loading: false,
                regions: t.images[0].regions
            })

            swal({
                title: "metadata cannot be empty",
                icon: "warning",
                buttons: true,
            })
        }
    }


    prevImage = async (r) => {
        console.log('previous', r)
        try {
            this.setState({ loading: true, message: 'Fetching previous Image ', metadata: null, regions: r.images[0].regions })

            await this.postImage(r, 'previous')
                .then(res => { console.log("[prev call]", res) })
                .catch(e => {
                    this.setState({
                        // region:null,
                        loading: false
                    })
                    swal({
                        title: this.titleHandler(e),
                        icon: "warning",
                        buttons: true,
                        // dangerMode: true,
                    })
                })
        } catch (e) {
            this.setState({
                // region:null,
                loading: false
            })
            swal({
                title: this.titleHandler(e),
                icon: "warning",
                buttons: true,
                // dangerMode: true,
            })
        }
    }
    /////update region function

    nextImage = async (r) => {
        try {
            this.setState({ loading: true, message: 'Fetching Next Image', metadata: null })
            if (this.state.src !== null) {
                console.log("ended")
                await this.postImage(r, 'next')
                    .then(res => { console.log("[next call]", res) })
                    .catch(e => {
                        this.setState({
                            // region:null,
                            loading: false
                        })
                        swal({
                            title: this.titleHandler(e),
                            icon: "warning",
                            buttons: true,
                            // dangerMode: true,
                        })
                    })
            }
            else {
                this.setState({
                    loading: false
                })
                swal({
                    title: "Try reload",
                    icon: "warning",
                    buttons: true,
                    // dangerMode: true,
                })
            }

        } catch (e) {
            this.setState({
                // region:null,
                loading: false
            })

            swal({
                title: this.titleHandler(e),
                icon: "warning",
                buttons: true,
                // dangerMode: true,
            })
        }
    }


    checkImage = (r) => {
        try {
            this.setState({ loading: true, message: 'Marking the image for Review' })
            this.postImage(r, 'review')
                .then(res => { console.log("[review]", res) })
                .catch(e => {
                    this.setState({
                        // region:null,
                        loading: false
                    })
                    swal({
                        title: this.titleHandler(e),
                        icon: "warning",
                        buttons: true,
                        // dangerMode: true,
                    })
                })
        } catch (e) {
            this.setState({
                // region:null,
                loading: false
            })
            swal({
                title: this.titleHandler(e),
                icon: "warning",
                buttons: true,
                // dangerMode: true,
            })
        }
    }


    preview = (r) => {
        console.log("[preview image]", r)
        this.setState({ loading: true, message: 'Fething Image for Review' })
        this.main_api('review', r, this.state.annotatemode)

    }


    changeAnnotateMode = (mode) => {
        this.setState({ annotatemode: mode })
        if (mode === 'segmentation') {
            console.log(mode)
            this.setState({ class_list: this.state.seg_class, curr_image_index: 0, loading: true, message: "changing into Segmentation mode" })
            this.main_api('first', 'first', mode)
        }
        else {
            this.setState({ class_list: this.state.obj_class })
            if (this.state.call_type != 'first') {
                this.setState({ loading: true, curr_image_index: 0, message: "changing into Object Detection mode" })
                this.main_api('first', 'first', mode)
            }
        }
    }

    // updateRegion=(region)=>{
    //     this.setState({regions:region})
    // }
    get_class = async (project_val) => {
        await axios.get(
            "/get_class",
            {
                params: {
                    project: project_val,
                }
            }
        )
            .then((res) => {
                console.log(res)
                this.setState({
                    obj_class: res.data.classes.obj_class,
                    seg_class: res.data.classes.seg_class,
                    class_list: res.data.classes.obj_class,
                    allowed_metadata: res.data.classes.meta_data
                })
            }).catch((e) => {
                this.setState({
                    // region:null,
                    loading: false
                })

                swal({
                    title: this.titleHandler(e),
                    icon: "warning",
                    buttons: true,
                    // dangerMode: true,
                })
            })
    }

    async componentDidMount() {
        console.log("did mount")
        await this.get_class('global')
        // first api
        try {

            if (this.state.call_type === 'first') {
                this.setState({ loading: true, message: 'Fetching Image for annotation' })
                localStorage.removeItem('checkList')
                this.main_api('first', 'first', this.state.annotatemode)
                this.setState({ call_type: "previous" })
            }
        } catch (e) {
            console.log(e.response);
            alert("could'nt load image")
        }
    }


    render() {

        const { loading, message, metadata, allowed_metadata, previewList, curr_image_index, annotatemode, class_list, src, regions } = this.state

        return (
            <ErrorBoundary>
                <ReactImageAnnotate
                    loading={loading}
                    message={message}
                    metadata={metadata}
                    allowed_metadata={allowed_metadata}
                    // updateRegion={this.updateRegion}
                    // nextImage={this.nextImage}
                    // prevImage={this.prevImage}
                    preview={this.preview}
                    previewList={previewList}
                    curr_image_index={curr_image_index}
                    changeAnnotateMode={this.changeAnnotateMode}
                    annotatemode={annotatemode}
                    allowedArea={{
                        x: 0,
                        y: 0,
                        w: 1,
                        h: 1
                    }
                    }
                    taskDescription="Annotate the imaes by selecting the mode for object detection or segmentationl"
                    images={
                        [
                            {
                                src: src,
                                name: "Task:Enter the Metadata First then Annotate",
                                regions: regions
                            }
                        ]}
                    regionClsList={class_list}
                    // regionTagList={["Road", "Highway", "LeaseRoad", "MainRoad"]}
                    onPrevImage={this.prevImage}
                    onNextImage={this.nextImage}
                    onExit={this.checkImage}
                />
            </ErrorBoundary>
        );
    }
}

export default ImageRender;
