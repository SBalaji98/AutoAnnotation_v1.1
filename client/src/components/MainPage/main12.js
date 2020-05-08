import React, { Component } from "react";
import axios from "axios";
import ReactImageAnnotate from "../Annotator/ind";
import objclass from "../../JsonFile/class.json";
import segclass from "../../JsonFile/seg.json";
import metainfo from "../../JsonFile/metadata.json"

// let Sync = require('sync');



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

    getRandomId = () => Math.random().toString().split(".")[1]

    async main_api(type) {
        //main api
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
                    curr_image_index: this.state.curr_image_index
                }
            }
        ).then((res) => {
            console.log(`[${type}]`, res)
            if (res.data.error) {
                alert(res.data.error)
            }
            else {
                this.toArrayBuffer(res.data.image.data)
                    .then((t) => {
                        const imgFile = new Blob([t], {
                            type: "image/jpeg"
                        });
                        const imgUrl = URL.createObjectURL(imgFile);
                        this.getImageSize(imgUrl)
                            .then((dimension) => {
                                let regions = []
                                if (res.data.annotations != null) {
                                    res.data.annotations.obj_detect.map((annotation, i) => {
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
                                    })
                                    console.log("[generarted regions]", regions)
                                    this.setState({
                                        curr_image_index: this.state.curr_image_index,
                                        src: imgUrl,
                                        regions: regions,
                                        metadata: res.data.metadata,
                                        image_key: res.data.image_key,
                                        dimension: dimension

                                    })
                                }
                                else {
                                    alert("noannotation data ")
                                    this.setState({
                                        curr_image_index: this.state.curr_image_index,
                                        src: imgUrl,
                                        regions: null,
                                        metadata: res.data.metadata,
                                        image_key: res.data.image_key,
                                        dimension: dimension

                                    })
                                }
                            })
                            .catch(error => { alert(error) })
                    })
                    .catch(error => { alert(error) })
            }
        })
            .catch(error => { alert(error) })
    }

    async componentDidMount() {
        console.log("did mount")
        // first api
        try {
            if (this.state.call_type === 'first') {
                this.main_api('first')
                this.setState({ call_type: "previous" })
            }
        } catch (e) {
            console.log(e.response);
            alert("could'nt load image")
        }
    }

    postImage = async (t, type) => {
        //next api
        console.log("next")
        let updated_regions = []
        if (t.images[0].regions != null) {
            if (this.state.annotatemode === 'object_detection') {   
                t.images[0].regions.map((annotation) => {
                    updated_regions.push({
                        cls: annotation.cls,
                        highlighted: false,
                        id: annotation.id,
                        x: annotation.x * this.state.dimension.imgWidth,
                        y: annotation.y * this.state.dimension.imgHeight,
                        w: annotation.w * this.state.dimension.imgWidth,
                        h: annotation.h * this.state.dimension.imgHeight,
                        color: "hsl(82,100%,50%)",
                        type: "box",
                        cls_id: `${this.state.class_list.indexOf(annotation.cls)}`
                    })
                })
            }
            else {
                t.images[0].regions.map((annotation) => {
                    updated_regions.push({
                        cls: annotation.cls,
                        highlighted: false,
                        id: annotation.id,
                        x: annotation.x * this.state.dimension.imgWidth,
                        y: annotation.y * this.state.dimension.imgHeight,
                        color: "hsl(82,100%,50%)",
                        type: "polygon",
                        cls_id: `${this.state.class_list.indexOf(annotation.cls)}`
                    })

                })
            }
        
        console.log("[generarted regions]", updated_regions)
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
                    call_type: type,
                    curr_image_index: (type === "previous") ? (this.state.curr_image_index - 1) : (this.state.curr_image_index + 1)
                }
            })
            .then((res) => {
                console.log("[next api]", res)
                if (res.data.error) {
                    alert(res.data.error)
                } else {
                    this.toArrayBuffer(res.data.image.data)
                        .then((t) => {
                            const imgFile = new Blob([t], {
                                type: "image/jpeg"
                            });
                            const imgUrl = URL.createObjectURL(imgFile);
                            this.getImageSize(imgUrl)
                                .then((dimension) => {
                                    let regions = []
                                    if ((type === 'next') && res.data.annotations.obj_detect) {
                                        res.data.annotations.obj_detect.map((annotation, i) => {
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
                                        })
                                    }
                                    else {
                                        res.data.annotations.map((annotation, i) => {
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

                                    }

                                    this.setState({
                                        curr_image_index: (type === "previous") ? (this.state.curr_image_index - 1) : (this.state.curr_image_index + 1),
                                        src: imgUrl,
                                        regions: regions,
                                        metadata: res.data.metadata,
                                        image_key: res.data.image_key,
                                        dimension: dimension

                                    })
                                })
                                .catch(error => { alert(error) })
                        })
                        .catch(error => { alert(error) })
                }
            })
            .catch(error => { alert(error) })
    }
    else{
        alert("Annotations or metadata cannot be empty")
    }
    }
    prevImage = (r) => {
        console.log('previous', r)
        try {
            this.postImage(r, 'previous')
                .then(res => { console.log("[prev call]", res) })
                .catch(e => {
                    console.error(e)
                    this.props.history.push('/')
                })

        } catch (e) {
            alert(e)
        }

    }
    nextImage = (r) => {
        console.log('next', r)
        try {
            this.postImage(r, 'next')
                .then(res => { console.log("[next call]", res) })
                .catch(e => {
                    alert(e)
                    this.props.history.push('/')
                })

        } catch (e) {
            alert(e)
        }
    }

    changeAnnotateMode = (mode) => {
        this.setState({ annotatemode: mode })
        if (mode === 'segmentation') {
            this.setState({ class_list: segclass.class })
        }
        else {
            this.setState({ class_list: objclass.class })
        }
    }
    save = (t) => {
        console.log(t)
    }
    render() {
        return (
            <ReactImageAnnotate
            loading={this.state.loading}
            message={this.state.message}
            metadata={this.state.metadata}
            allowed_metadata={metainfo}
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
            // <ReactImageAnnotate
            //     metadata={this.state.metadata}
            //     allowed_metadata={metainfo}
            //     nextImage={this.nextImage}
            //     prevImage={this.prevImage}
            //     curr_image_index={this.state.curr_image_index}
            //     changeAnnotateMode={this.changeAnnotateMode}
            //     annotatemode={this.state.annotatemode}
            //     allowedArea={{
            //         x: 0,
            //         y: 0,
            //         w: 1,
            //         h: 1
            //     }
            //     }
            //     taskDescription="Annotate the imaes by selecting the mode for object detection or segmentationl"
            //     images={
            //         [
            //             {
            //                 src: this.state.src,
            //                 name: this.state.name,
            //                 regions: this.state.regions
            //             }
            //         ]}
            //     regionClsList={this.state.class_list}
            //     // regionTagList={["Road", "Highway", "LeaseRoad", "MainRoad"]}
            //     onPrevImage={this.prevImage}
            //     onNextImage={this.nextImage}
            // />
        );
    }
}

export default ImageRender;
