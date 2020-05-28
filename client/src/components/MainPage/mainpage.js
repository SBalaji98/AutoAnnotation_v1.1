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
        projectId: null,
        lockMode: false,
        prevResponse: {}
    };

    /**
       **toArrayBuffer
       * @description converts a image buffer to an buffer array
       * @param {*} myBuf image buffer to be changed into buffer array
       * @returns buffer array - myBuffer
       */
    toArrayBuffer = async (myBuf) => {
        var myBuffer = new ArrayBuffer(myBuf.length);
        var res = new Uint8Array(myBuffer);
        for (var i = 0; i < myBuf.length; ++i) {
            res[i] = myBuf[i];
        }
        return myBuffer;
    }


    /**
       **getImageSize
       * @description gets the image dimensions
       * @param {*} img image whose dimensions are to be measured
       * @returns promise - dimension
       */
    getImageSize = async (img) => {
        let dimension = {}
        return new Promise((resolve, reject) => {
            let theImage = new Image();
            theImage.src = img
            theImage.onload = () => resolve(dimension = { imgHeight: theImage.height, imgWidth: theImage.width })
        })
    }


    /**
   **titleHandler
   * @description error messages are identified and alternate display messages are returned
   * @param {*} error the error occured
   * @returns string - message
   */
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

    /**
 **getRandomId
 * @description generates randomid for the annotations
 * @returns int - id
 */
    getRandomId = () => Math.random().toString().split(".")[1]


    /**
      **main_api
      * @description this method makes a get request to the backend to get the image for annotation 
      *              and set the image along with its annotations and metadata either in object detection or 
      *              segmentation mode as per the mode selected
      * @param {string} type type of call, it can be "first" or "review"
      * @param {string} key image key passed during review type of call
      * @param {string} mode annotation mode "object_detection" or "segmentation" 
      */
    async main_api(type, key, mode) {
        let dim;
        let imgUrl;
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
            if (res.data.error) {
                this.setState({ loading: false, src: null })
                exit = true
                swal({
                    title: res.data.error,
                    icon: "warning",
                    buttons: true,
                })
            }
            else if (res.data.message) {
                this.setState({ loading: false, src: null })
                exit = true
                swal({
                    title: res.data.message,
                    icon: "warning",
                    buttons: true,
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
                                        loading: false
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
                })
            })
    }

    /**
       **postImage
       * @description this method converts the annotations from the library scale to original dimension 
       *              and respective output formats of the annotations to save in the database by making 
       *              a post request to the backend and to get the image for annotation and set the image
       *              along with its annotations and metadata either in object detection or segmentation 
       *              mode as per the mode selected
       * @param {string} type type of call, it can be "next" or "previous" or "review"
       * @param {object} stateParam state object from mainlayout component
       */
    async postImage(stateParam, type) {
        let updated_regions = []
        let imgUrl
        let dim
        let exit = false
        localStorage.setItem("metadata", JSON.stringify(stateParam.metadata))
        const { imgWidth, imgHeight } = this.state.dimension
        if (stateParam.metadata != null) {
            if ((stateParam.images[0].regions !== null)) {
                if (this.state.annotatemode === "object_detection") {
                    stateParam.images[0].regions.map((annotation) => {
                        if (!annotation.cls) {
                            this.setState({
                                loading: false,
                                regions: stateParam.images[0].regions,
                                metadata: (JSON.parse(localStorage.getItem("metadata"))) ? JSON.parse(localStorage.getItem("metadata")) : null
                            })
                            exit = true
                            swal({
                                title: "Annotations class cannot be empty",
                                icon: "warning",
                                buttons: true,
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
                    stateParam.images[0].regions.map((annotation) => {
                        let points = []
                        if (!annotation.cls) {
                            this.setState({
                                loading: false,
                                regions: stateParam.images[0].regions,
                                metadata: (JSON.parse(localStorage.getItem("metadata"))) ? JSON.parse(localStorage.getItem("metadata")) : null
                            })
                            exit = true
                            swal({
                                title: "Annotations class cannot be empty",
                                icon: "warning",
                                buttons: true,
                            })
                        }
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
                        metadata: stateParam.metadata,
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
                        if (res.data.error) {
                            this.setState({ loading: false, src: null })
                            exit = true
                            swal({
                                title: res.data.error,
                                icon: "warning",
                                buttons: true,
                            })
                        }
                        else if (res.data.message) {
                            this.setState({ loading: false, src: null })
                            exit = true
                            swal({
                                title: res.data.message,
                                text: "come back later",
                                icon: "warning",
                                buttons: true,
                            })
                        }
                        else {
                            this.setState({ prevResponse: res })
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
                                            if (this.state.lockMode === false) {
                                                localStorage.setItem('metadata', JSON.stringify(res.data.metadata));
                                                if (res.data.annotations != null) {
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
                                                        loading: false,
                                                        curr_image_index: (type === "previous") ? (this.state.curr_image_index - 1) : (this.state.curr_image_index + 1),
                                                        src: imgUrl,
                                                        regions: regions,
                                                        metadata: res.data.metadata,
                                                        image_key: res.data.image_key,
                                                        dimension: dimension,
                                                        previewList: (JSON.parse(localStorage.getItem("checkList"))) ? JSON.parse(localStorage.getItem("checkList")) : [],
                                                        projectId: res.data.projectId
                                                    })
                                                }
                                                else {
                                                    this.setState({
                                                        loading: false
                                                    })
                                                    this.setState({
                                                        curr_image_index: (type === "previous") ? (this.state.curr_image_index - 1) : (this.state.curr_image_index + 1),
                                                        src: imgUrl,
                                                        regions: null,
                                                        metadata: res.data.metadata,
                                                        image_key: res.data.image_key,
                                                        dimension: dimension,
                                                        projectId: res.data.projectId
                                                    })
                                                }
                                            }
                                            else {
                                                this.setState({
                                                    loading: false
                                                })
                                                this.setState({
                                                    curr_image_index: (type === "previous") ? (this.state.curr_image_index - 1) : (this.state.curr_image_index + 1),
                                                    src: imgUrl,
                                                    image_key: res.data.image_key,
                                                    metadata: (JSON.parse(localStorage.getItem("metadata"))) ? JSON.parse(localStorage.getItem("metadata")) : null,
                                                    dimension: dimension,
                                                    projectId: res.data.projectId
                                                })
                                            }
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
                            })
                        }
                    })
            }
            else {
                this.setState({ loading: false, metadata: (JSON.parse(localStorage.getItem("metadata"))) ? JSON.parse(localStorage.getItem("metadata")) : null })
                swal({
                    title: "Annotations cannot be empty",
                    icon: "warning",
                    buttons: true,
                })
            }
        }
        else {
            this.setState({
                loading: false,
                regions: stateParam.images[0].regions
            })
            swal({
                title: "metadata cannot be empty",
                icon: "warning",
                buttons: true,
            })
        }
    }

    /**
    **prevImage
    * @description this method calls the "postImage" method to perform a previous api call to get
    *              and set the previous image with its annotations and metadata by passing the "stateParam" 
    *              and type as "previous" as parameter to the postImage method
    * @param {object} stateParam state object from mainlayout component
    */
    prevImage = async (stateParam) => {
        try {
            this.setState({ loading: true, message: 'Fetching previous Image ', regions: stateParam.images[0].regions })
            await this.postImage(stateParam, 'previous')
                .then(res => { })
                .catch(e => {
                    this.setState({
                        loading: false
                    })
                    swal({
                        title: this.titleHandler(e),
                        icon: "warning",
                        buttons: true,
                    })
                })
        } catch (e) {
            this.setState({
                loading: false
            })
            swal({
                title: this.titleHandler(e),
                icon: "warning",
                buttons: true,
            })
        }
    }


    /**
    **nextImage
    * @description this method calls the "postImage" method to perform a previous api call to get
    *              and set the next image with its annotations and metadata by passing the "stateParam" 
    *              and type as "next" as parameter to the postImage method
    * @param {object} stateParam state object from mainlayout component
    */
    nextImage = async (stateParam) => {
        try {
            this.setState({ loading: true, message: 'Fetching Next Image', regions: stateParam.images[0].regions })
            if (this.state.src !== null) {
                await this.postImage(stateParam, 'next')
                    .then(res => { })
                    .catch(e => {
                        this.setState({
                            loading: false
                        })
                        swal({
                            title: this.titleHandler(e),
                            icon: "warning",
                            buttons: true,
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
                })
            }
        } catch (e) {
            this.setState({
                loading: false
            })
            swal({
                title: this.titleHandler(e),
                icon: "warning",
                buttons: true,
            })
        }
    }


    /**
    **checkImage
    * @description this method calls the "postImage" method to perform a next api call to mark the current image 
    *              for review and get and set the next image with its annotations and metadata by passing the 
    *              "stateParam" and type as "next" as parameter to the postImage method
    * @param {object} stateParam state object from mainlayout component
    */
    checkImage = (stateParam) => {
        try {
            this.setState({ loading: true, message: 'Marking the image for Review' })
            this.postImage(stateParam, 'review')
                .then(res => { })
                .catch(e => {
                    this.setState({
                        loading: false
                    })
                    swal({
                        title: this.titleHandler(e),
                        icon: "warning",
                        buttons: true,
                    })
                })
        } catch (e) {
            this.setState({
                loading: false
            })
            swal({
                title: this.titleHandler(e),
                icon: "warning",
                buttons: true,
            })
        }
    }

    /**
    **preview
    * @description this method calls the "main_api" method to perform a api call to get and set
    *              the image with its annotations and metadata that was marked for review by passing
    *              the type as "review",key array that contains the image key and project id and mode 
    *              of annotation and type as "review" as parameter to the "main_api" method
    * @param {Array} key state object from mainlayout component
    */
    preview = (key) => {
        this.setState({ loading: true, message: 'Fething Image for Review' })
        this.main_api('review', key, this.state.annotatemode)
    }

    /**
    **changeAnnotateMode
    * @description this method gets the parameter "mode" from the mainlayout state and sets the mode
    *              to the state parameter "annotatemode" of this component
    * @param {string} mode state object from mainlayout component
    */
    changeAnnotateMode = (mode) => {
        this.setState({ annotatemode: mode })
        if (mode === 'segmentation') {
            console.log(mode)
            this.setState({ class_list: this.state.seg_class, curr_image_index: 0, loading: true, message: "changing into Segmentation mode" })
            this.main_api('first', 'first', mode)
        }
        else {
            this.setState({ class_list: this.state.obj_class })
            if (this.state.call_type !== 'first') {
                this.setState({ loading: true, curr_image_index: 0, message: "changing into Object Detection mode" })
                this.main_api('first', 'first', mode)
            }
        }
    }

    /**
    **changeLock
    * @description this method gets the parameter "mode" from the mainlayout state and sets the mode
    *              to the state parameter "annotatemode" of this component
    * @param {boolean} status describes whether the lock is applied (true) or not (false)
    * @param {object} stateParam state object from mainlayout component
    */
    changeLock = (status, stateParam) => {
        let regions = [];
        localStorage.setItem("metadata", JSON.stringify(stateParam.metadata))
        this.setState({ lockMode: status, regions: stateParam.images[0].regions, metadata: stateParam.metadata })
        if (status === false) {
            if (this.state.prevResponse.data) {
                (this.state.annotatemode === "object_detection") ?
                    (this.state.prevResponse.data.annotations.obj_detect.map((annotation, i) => {
                        regions.push({
                            cls: annotation.Class_Name,
                            highlighted: false,
                            id: this.getRandomId(),
                            x: annotation.Region[0] / this.state.dimension.imgWidth,
                            y: annotation.Region[1] / this.state.dimension.imgHeight,
                            w: annotation.Region[2] / this.state.dimension.imgWidth,
                            h: annotation.Region[3] / this.state.dimension.imgHeight,
                            color: "hsl(82,100%,50%)",
                            type: "box"
                        })
                    })) : (
                        this.state.prevResponse.data.annotations.segmentation.map((annotation, i) => {
                            let points = []
                            annotation.Region.map((seg, i) => {
                                points.push([seg[0] / this.state.dimension.imgWidth, seg[1] / this.state.dimension.imgHeight])
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
                this.setState({
                    regions: regions,
                })
            }
            else {
                return
            }
        }
    }


    /**
    **get_class
    * @description this method performs a getapi call to the backend to get the list of classes for 
    *              annotations and metadata list
    * @param {string} project_val project name for which the classlist has tobe fetched
    */
    get_class = async (project_val) => {
        await axios.get(
            "/get_class",
            {
                params: {
                    project: project_val,
                }
            }
        ).then((res) => {
            console.log(res)
            this.setState({
                obj_class: res.data.classes.obj_class,
                seg_class: res.data.classes.seg_class,
                class_list: res.data.classes.obj_class,
                allowed_metadata: res.data.classes.meta_data
            })
        }).catch((e) => {
            this.setState({
                loading: false
            })
            swal({
                title: this.titleHandler(e),
                icon: "warning",
                buttons: true,
            })
        })
    }


    /**
   **componentDidMount
   * @description this method is a react lifecycle that performs the prior actions before rendering the component
   */
    async componentDidMount() {
        await this.get_class('global')
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

    /**
    **render
    * @description this method is a react lifecycle that renders the component
    * @returns component ImageRender
    */
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
                    lockMode={this.state.lockMode}
                    changeLock={this.changeLock}
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
                    }}
                    taskDescription="Annotate the imaes by selecting the mode for object detection or segmentationl"
                    images={[{
                        src: src,
                        name: "Task:Enter the Metadata First then Annotate",
                        regions: regions
                    }]}
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
