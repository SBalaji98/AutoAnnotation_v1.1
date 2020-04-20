import React, { Component } from "react";
import axios from "axios";
import ReactImageAnnotate from "../Annotator/ind";
import objclass from "../../JsonFile/class.json";
import segclass from "../../JsonFile/seg.json";
// let Sync = require('sync');


let accessString = localStorage.getItem("jwt");

class ImageRender extends Component {


    state = {
        src: "",
        // "https://cache.desktopnexus.com/cropped-wallpapers/822/822595-1366x768-[DesktopNexus.com].jpg?st=ICqNqTaceNCrJl-SEwNMag&e=1585805768",
        image_key: "",
        annotatemode: "Object Detection",
        curr_image_index: 0,
        call_type: 'first',
        regions: [],
        metadata: '',
        class_list: objclass.class,
        // dimension:{imgHeight:0,
        // imgWidth:0
        // }
    };

    async toArrayBuffer(myBuf) {
        var myBuffer = new ArrayBuffer(myBuf.length);
        var res = new Uint8Array(myBuffer);
        for (var i = 0; i < myBuf.length; ++i) {
            res[i] = myBuf[i];
        }
        console.log(myBuffer)
        return myBuffer;
    }

    getImageSize = async (img) => {
        let dimension = {}
        return new Promise((resolve, reject) => {
            let theImage = new Image();
            theImage.src = img
            theImage.onload = () => resolve(dimension = { imgHeight: theImage.height, imgWidth: theImage.width })
        })
    }

    getRandomId = () =>
        Math.random()
            .toString()
            .split(".")[1]

    async main_api(type) {
        await axios.get(
            "annotations/get-image-data-by-user",
            {
                headers: {
                    Authorization: `bearer ${accessString}`
                },
                params: {
                    annotate_mode: 'object_detection',
                    call_type: type,
                    curr_image_index: this.state.curr_image_index
                }
            }
        ).then((res) => {
            console.log(res)
            this.toArrayBuffer(res.data.image.data)
                .then((t) => {
                    const imgFile = new Blob([t], {
                        type: "image/jpeg"
                    });
                    const imgUrl = URL.createObjectURL(imgFile);
                    this.getImageSize(imgUrl).then((dimension) => {
                        console.log(dimension.imgHeight, dimension.imgWidth)
                        let regions = []
                        res.data.annotations.obj_detect.map((annotation, i) => {
                            const x = annotation.Region[0] / dimension.imgWidth
                            const y = annotation.Region[1] / dimension.imgHeight
                            const w = annotation.Region[2] / dimension.imgWidth
                            const h = annotation.Region[3] / dimension.imgHeight
                            regions.push({
                                cls: annotation.Class_Name,
                                highlighted: false,
                                id: this.getRandomId(),
                                x: x,
                                y: y,
                                w: w,
                                h: h,
                                color: "hsl(82,100%,50%)",
                                type: "box"
                            })
                            // console.log(regions)
                        })
                        if (type === 'first') {
                            console.log(regions)
                            this.setState({
                                curr_image_index: this.state.curr_image_index + 1,
                                src: imgUrl,
                                regions: regions,
                                metadata: res.data.metadata,
                                image_key: res.data.image_key
                            })
                        }
                        else {
                            this.setState({
                                curr_image_index: this.state.curr_image_index - 1,
                                src: imgUrl,
                                regions: res.data.annotations,
                                metadata: res.data.metadata,
                                image_key: res.data.image_key
                            })
                        }

                    })

                })
        })
    }

    async componentDidMount() {
        // first api
        ////////////////////////////////////////////////////////////////////////////////////////////////////////        
        try {
            if (this.state.call_type === 'first') {
                this.main_api('first')
                    .then((res) => console.log("[first api response]", res))
                this.setState({ call_type: 'previous' })
            }
            console.log(this.state.regions)
        } catch (e) {
            console.log(e.response);
            alert("could'nt load image")
        }
    }

    nextImage = (t) => {
        console.log(t)
        console.log("next")
        axios.post('/annotations/update-get-image-data-by-user',
            {
                image_key: this.state.image_key,
                metadata: this.state.metadata,
                annotations: this.state.regions
            },
            {
                headers: {
                    Authorization: `bearer ${accessString}`
                },
                params: {
                    annotate_mode: "object_detection",
                    call_type: 'next',
                    curr_image_index: this.state.curr_image_index
                }
            })
            .then((res) => {
                console.log("[next]", res)
                this.toArrayBuffer(res.data.image.data)
                    .then((t) => {
                        const imgFile = new Blob([t], {
                            type: "image/jpeg"
                        });
                        const imgUrl = URL.createObjectURL(imgFile);
                        this.getImageSize(imgUrl)
                            .then((dimension) => {
                                console.log(dimension.imgHeight, dimension.imgWidth)
                                let regions = []
                                res.data.annotations.obj_detect.map((annotation, i) => {
                                    const x = annotation.Region[0] / dimension.imgWidth
                                    const y = annotation.Region[1] / dimension.imgHeight
                                    const w = annotation.Region[2] / dimension.imgWidth
                                    const h = annotation.Region[3] / dimension.imgHeight
                                    regions.push({
                                        cls: annotation.Class_Name,
                                        highlighted: false,
                                        id: i,
                                        x: x,
                                        y: y,
                                        w: w,
                                        h: h,
                                        color: "hsl(82,100%,50%)",
                                        type: "box"
                                    })
                                    // console.log(regions)
                                })
                                this.setState({
                                    curr_image_index: this.state.curr_image_index + 1,
                                    src: imgUrl,
                                    // regions: res.data.annotations,
                                    metadata: res.data.metadata,
                                    image_key: res.data.image_key
                                })
                            })
                    })
            })
    }

    prevImage = (r) => {
        console.log('previous',r)
        try {
            this.main_api('previous').then(res => { console.log("[prev call]", res) })
        } catch (e) {
            console.log(e.response);
            alert("could'nt load image")
        }

    }

    changeAnnotateMode = (mode) => {
        this.setState({ annotatemode: mode })
        if (mode === 'Segmentation') {
            this.setState({ class_list: segclass.class })
        }
        else {
            this.setState({ class_list: objclass.class })
        }
    }
save = (t)=>{
    console.log(t)
}
    render() {
        return (
            <ReactImageAnnotate
                nextImage={this.nextImage}
                prevImage={this.prevImage}
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
                onPrevImage = {this.prevImage}
                onNextImage = {this.nextImage}
            />
        );
    }
}

export default ImageRender;
