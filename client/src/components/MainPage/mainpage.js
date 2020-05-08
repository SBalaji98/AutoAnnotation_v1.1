import React, { Component } from "react";
import axios from "axios";
import ReactImageAnnotate from "../Annotator/ind";
import objclass from "../../JsonFile/class.json";
import segclass from "../../JsonFile/seg.json";
import metainfo from "../../JsonFile/metadata.json"
import Loader from '../Loader/Loader';
import swal from "sweetalert";



class ImageRender extends Component {


    state = {
        src: "",
        //"https://cache.desktopnexus.com/cropped-wallpapers/822/822595-1366x768-[DesktopNexus.com].jpg?st=ICqNqTaceNCrJl-SEwNMag&e=1585805768",
        image_key: "",
        annotatemode: "object_detection",
        curr_image_index: 0,
        call_type: 'first',
        regions: [],
        metadata: null
        // climate:'',
        // road:'',
        // time_of_day:'',
        // area:'',
        // no_of_classes:'',
        // no_of_lanes:''
        ,
        class_list: objclass.class,
        dimension: {
            imgHeight: 0,
            imgWidth: 0
        },
        previewList: [],
        loading: true,
        message: 'Fetching Image for annotation'
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
            default:
                return error.message
        }

    }

    getRandomId = () => Math.random().toString().split(".")[1]


    async main_api(type, key) {
        //main api
        let dim;
        let imgUrl;
        let response;
        console.log("Mainapi")
        await axios.get(
            "annotations/get-image-data-by-user",
            {
                headers: {
                    Authorization: `bearer ${localStorage.getItem("jwt")}`
                },
                params: {
                    annotate_mode: this.state.annotatemode,
                    call_type: type,
                    curr_image_index: this.state.curr_image_index,
                    image_key: key
                }
            }
        ).then((res) => {
            console.log(`[${type}]`, res)
            response = res
            if (res.data.error) {
                this.setState({ loading: false })
                swal({
                    title: res.data.error,
                    text: "come back later",
                    icon: "warning",
                    buttons: true,
                    // dangerMode: true,
                })
            }
            else {
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
                                    console.log("[generarted regions]", regions)
                                    this.setState({
                                        curr_image_index: this.state.curr_image_index,
                                        src: imgUrl,
                                        regions: regions,
                                        metadata: res.data.metadata,
                                        image_key: res.data.image_key,
                                        dimension: dimension,
                                        loading: false
                                    })
                                }
                                else {
                                    alert("no annotation data ")
                                    this.setState({
                                        curr_image_index: this.state.curr_image_index,
                                        src: imgUrl,
                                        regions: null,
                                        metadata: res.data.metadata,
                                        image_key: res.data.image_key,
                                        dimension: dimension,
                                        loading: false

                                    })
                                }
                            })
                            .catch(error => {
                                this.setState({
                                    curr_image_index: this.state.curr_image_index,
                                    src: imgUrl,
                                    regions: null,
                                    metadata: res.data.metadata,
                                    image_key: res.data.image_key,
                                    dimension: dim,
                                    loading: false

                                })
                                if(error.message!=="Cannot read property 'map' of undefined"){
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
                            curr_image_index: this.state.curr_image_index,
                            src: imgUrl,
                            regions: null,
                            metadata: res.data.metadata,
                            image_key: res.data.image_key,
                            dimension: dim,
                            loading: false

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
                    curr_image_index: this.state.curr_image_index,
                    src: imgUrl,
                    regions: null,
                    metadata: response.data.metadata,
                    image_key: response.data.image_key,
                    dimension: dim,
                    loading: false

                })
                swal({
                    title: this.titleHandler(error),
                    buttons: true,
                    // dangerMode: true,
                })
            })
    }


    postImage = async (t, type) => {
        console.log("next",t)
        let updated_regions = []
        let imgUrl
        let response
        let dim
        const { imgWidth, imgHeight } = this.state.dimension
    if(t.metadata != null){
        if ((t.images[0].regions !== null)) {
            if (this.state.annotatemode === "object_detection") {
                t.images[0].regions.map((annotation) => {
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
                    const newCheckList = [...checkList, this.state.image_key]
                    localStorage.setItem('checkList', JSON.stringify(newCheckList));
                }
                else {
                    localStorage.setItem('checkList', JSON.stringify([this.state.image_key]))
                }
            }

            axios.post('/annotations/update-get-image-data-by-user',
                {
                    image_key: this.state.image_key,
                    metadata: t.metadata,
                    annotations: updated_regions
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
                    response = res
                    console.log("[next api]", res)
                    if (res.data.error) {
                        this.setState({ loading: false })
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
                                            loading: false
                                        })
                                    })
                                    .catch(error => {
                                        this.setState({
                                            curr_image_index: (type === "previous") ? (this.state.curr_image_index - 1) : (this.state.curr_image_index + 1),
                                            src: imgUrl,
                                            metadata: res.data.metadata,
                                            image_key: res.data.image_key,
                                            dimension: dim,
                                            regions: null,
                                            previewList: (JSON.parse(localStorage.getItem("checkList"))) ? JSON.parse(localStorage.getItem("checkList")) : [],
                                            loading: false
                                        })
                                        if(error.message!=="Cannot read property 'map' of undefined"){

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
                                    curr_image_index: (type === "previous") ? (this.state.curr_image_index - 1) : (this.state.curr_image_index + 1),
                                    src: imgUrl,
                                    metadata: res.data.metadata,
                                    image_key: res.data.image_key,
                                    dimension: dim,
                                    regions: null,

                                    previewList: (JSON.parse(localStorage.getItem("checkList"))) ? JSON.parse(localStorage.getItem("checkList")) : [],
                                    loading: false
                                })
                                if(error.message!=="Cannot read property 'map' of undefined"){
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
                        curr_image_index: (type === "previous") ? (this.state.curr_image_index - 1) : (this.state.curr_image_index + 1),
                        src: imgUrl,
                        metadata: response.data.metadata,
                        image_key: response.data.image_key,
                        dimension: dim,
                        regions: null,
                        previewList: (JSON.parse(localStorage.getItem("checkList"))) ? JSON.parse(localStorage.getItem("checkList")) : [],
                        loading: false
                    })
                    if(error.message!=="Cannot read property 'map' of undefined"){
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
            this.setState({ loading: false })

            swal({
                title: "Annotations  cannot be empty",
                icon: "warning",
                buttons: true,
                // dangerMode: true,
            })
        }
    }
    else{
        console.log("[image]",t.images[0].regions,"[state]",this.state.regions)
        this.setState({
            // region:null,
        loading: false})

    swal({
        title: "metadata cannot be empty",
        icon: "warning",
        buttons: true,
        // dangerMode: true,
    })
}
    }


    prevImage = (r) => {
        console.log('previous', r)
        try {
            this.setState({ loading: true, message: 'Fetching previous Image ', metadata: null, regions:r.images[0].regions })
            this.postImage(r, 'previous')
                .then(res => { console.log("[prev call]", res) })
                .catch(e => {

                })

        } catch (e) {
            alert(e)
        }
    }
/////update region function

    nextImage = (r) => {
        console.log('next', r)
        try {
            this.setState({ loading: true, message: 'Fetching Next Image', metadata: null })
            this.postImage(r, 'next')
                .then(res => { console.log("[next call]", res) })
                .catch(e => {
                    alert(e)
                })

        } catch (e) {
            alert(e)
        }
    }


    checkImage = (r) => {
        try {
            this.setState({ loading: true, message: 'Marking the image for Review' })
            this.postImage(r, 'review')
                .then(res => { console.log("[review]", res) })
                .catch(e => {
                    alert(e)
                    this.props.history.push('/')
                })

        } catch (e) {
            alert(e)
        }
    }


    preview = (r) => {
        console.log("[preview image]", r)
        this.setState({ loading: true, message: 'Fething Image for Review' })
        this.main_api('review', r)

    }


    changeAnnotateMode = (mode) => {
        this.setState({ annotatemode: mode })
        if (mode === 'segmentation') {
            this.setState({ class_list: segclass.class, loading: true, message: "changing into Segmentation mode" })
            this.main_api('first')
        }
        else {
            this.setState({ class_list: objclass.class })
            if (this.state.call_type != 'first') {
                this.setState({ loading: true, message: "changing into Object Detection mode" })
                this.main_api('first')
            }
        }
    }

    // updateRegion=(region)=>{
    //     this.setState({regions:region})
    // }


    async componentDidMount() {
        console.log("did mount")
        // first api
        try {
            if (this.state.call_type === 'first') {
                this.setState({ loading: true, message: 'Fetching Image for annotation' })
                localStorage.removeItem('checkList')
                this.main_api('first', 'first')
                this.setState({ call_type: "previous" })
            }
        } catch (e) {
            console.log(e.response);
            alert("could'nt load image")
        }
    }


    render() {
        // if (this.state.loading) {
        //     return <Loader message={this.state.message} />
        // }
        return (
            <ReactImageAnnotate
                loading={this.state.loading}
                message={this.state.message}
                metadata={this.state.metadata}
                allowed_metadata={metainfo}
                // updateRegion={this.updateRegion}
                // nextImage={this.nextImage}
                // prevImage={this.prevImage}
                preview={this.preview}
                previewList={this.state.previewList}
                curr_image_index={this.state.curr_image_index}
                changeAnnotateMode={this.changeAnnotateMode}
                annotatemode={this.state.annotatemode}
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
                            src: this.state.src,
                            name: this.state.name,
                            regions: this.state.regions
                        }
                    ]}
                regionClsList={this.state.class_list}
                // regionTagList={["Road", "Highway", "LeaseRoad", "MainRoad"]}
                onPrevImage={this.prevImage}
                onNextImage={this.nextImage}
                onExit={this.checkImage}
            />
        );
    }
}

export default ImageRender;
