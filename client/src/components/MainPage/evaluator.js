import React, { Component } from "react";
import ReactImageAnnotate from "../Annotator/evaluator";
import swal from "sweetalert";
import ErrorBoundary from '../ErrorBoundary/ErrorBoundary'
import Axios from "axios";
import SideDrawer from "../SideDrawer"

//metadata done
//have to change next ,prev and annotate mode and write backend apis

class Evaluator extends Component {
  state = {
    src: null,
    image_key: "",
    annotatemode: "object_detection",
    curr_image_index: 0,
    regions: [],
    metadata: '',
    dimension: {
      imgHeight: 0,
      imgWidth: 0
    },
    loading: true,
    message: 'Fetching Image for annotation',
    comments: 'hello',
    imageList: [],
    obj_is_accepted: false,
    seg_is_accepted: false,
    //misce
    seg_class: [],
    obj_class: [],
    call_type: 'first',
    allowed_metadata: {},
    previewList: [],
    projectId: null,
    lockMode: false,
    prevResponse: {},

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

  thenFunction = (res, imgUrl, dim, type) => {
    let exit = false;
    if (exit) {
      return
    }
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
                (this.state.annotatemode === "object_detection") ?
                  (res.data.annotations.obj_annotations.map((annotation, i) => {
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
                  })) : (res.data.annotations.seg_annotations.map((annotation, i) => {
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
                  }))
              }
              this.setState({
                src: imgUrl,
                regions: regions,
                metadata: res.data.metadata,
                image_key: res.data.image_key,
                dimension: dimension,


              })
              if (type !== 'any') {
                this.setState({
                  curr_image_index: (type === "previous") ?
                    (this.state.curr_image_index - 1) : (this.state.curr_image_index + 1)
                })
              }
            })
        })
    }
  }

  async getFirstImage() {
    let dim;
    let imgUrl;
    let exit = false;
    if (exit) {
      return
    }
    await Axios.get(
      "/evaluator/get_imagelist",
      {
        headers: {
          Authorization: `bearer ${localStorage.getItem("jwt")}`
        }
      }
    ).then((res) => {
      console.log('[response]', res.data)
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
        this.setState({prevResponse:res.data})
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
                localStorage.setItem('ImageList', JSON.stringify(res.data.image_list));
                if (res.data.annotations != null) {
                  (this.state.annotatemode === "object_detection") ?
                    (res.data.annotations.obj_annotations.map((annotation, i) => {
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
                    })) : (res.data.annotations.seg_annotations.map((annotation, i) => {
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
                    }))
                }
                this.setState({
                  src: imgUrl,
                  regions: regions,
                  metadata: res.data.metadata,
                  image_key: res.data.image_key,
                  dimension: dimension,
                  imageList: res.data.image_list,
                  // curr_image_index: 1
                })
              })
          })
      }
    })
  }

  async getAnyImage(image_key, type) {
    let dim;
    let imgUrl;
    let exit = false;
    if (exit) {
      return
    }
    const { obj_is_accepted, seg_is_accepted, comments } = this.state
    await Axios.post(
      "/evaluator/get_image",
      {
        image_key: image_key,
        obj_is_accepted: obj_is_accepted,
        seg_is_accepted: seg_is_accepted,
        is_evaluated: true,
        comments: comments
      },
      {
        headers: {
          Authorization: `bearer ${localStorage.getItem("jwt")}`
        },
        params: {
          image_key: image_key
        }

      }
    ).then((res) => {
      this.setState({prevResponse:res.data})
      this.thenFunction(res, imgUrl, dim, type)
    })
  }

  /**
     **prevImage
     * @description this method calls the "postImage" method to perform a previous api call to get
     *              and set the previous image with its annotations and metadata by passing the "stateParam" 
     *              and type as "previous" as parameter to the postImage method
     * @param {object} stateParam state object from mainlayout component
     */
  prevImage = async () => {
    try {
      this.setState({ loading: true, message: 'Fetching previous Image ' })
      const { imageList, curr_image_index } = this.state
      this.getAnyImage(imageList[curr_image_index - 1], "previous")
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
  nextImage = async () => {
    try {
      this.setState({ loading: true, message: 'Fetching Next Image' })
      const { imageList, curr_image_index } = this.state
      this.getAnyImage(imageList[curr_image_index + 1], "next")
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
      **changeAnnotateMode
      * @description this method gets the parameter "mode" from the mainlayout state and sets the mode
      *              to the state parameter "annotatemode" of this component
      * @param {string} mode state object from mainlayout component
      */
  changeAnnotateMode = (mode) => {
    this.setState({ annotatemode: mode })
    const {prevResponse,dimension,call_type} = this.state
    let regions = []
    if (call_type !== 'first'){
    if (mode === 'segmentation') {
      console.log(mode)
      if(prevResponse.annotations.seg_annotations){
        prevResponse.annotations.seg_annotations.map((annotation, i) => {
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
    }
  }
    else {
      if(prevResponse.annotations.obj_annotations){
        prevResponse.annotations.obj_annotations.map((annotation, i) => {
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
    }
    this.setState({
      regions: regions
  })
    }
  }

  componentDidMount() {
    try {
      console.log("did mount")
      this.getFirstImage()
      this.setState({ call_type: "next" })

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
          allowedArea={{
            x: 0,
            y: 0,
            w: 1,
            h: 1
          }
          }
          metadata={metadata}
          curr_image_index={curr_image_index}
          annotatemode={annotatemode}
          changeAnnotateMode={this.changeAnnotateMode}
          taskDescription="Annotate the imaes by selecting the mode for object detection or segmentationl"
          onPrevImage={this.prevImage}
          onNextImage={this.nextImage}
          images={[
            {
              src: src,
              name: "Task:Enter the Metadata First then Annotate",
              regions: regions
            }
          ]}
        />
      </ErrorBoundary>
    );
  }
}

export default Evaluator;