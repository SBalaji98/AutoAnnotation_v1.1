import React, { Component } from "react";
import axios from "axios";
import ReactImageAnnotate from "../Annotator/ind";
import data  from "../../JsonFile/class.json";
class ImageRender extends Component {
  state = {
    src:
      "https://cache.desktopnexus.com/cropped-wallpapers/822/822595-1366x768-[DesktopNexus.com].jpg?st=ICqNqTaceNCrJl-SEwNMag&e=1585805768",
    imgKey: "",
    imgListObject: [],
    imgCount: 1,
    annotatemode: "Object Detection",
    isAnnotated: null,
    annotatedData: {}
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
  async componentDidMount() {
    try {
      let accessString = localStorage.getItem("jwt");
      let objList = await axios.get(
        "/user/image-data",
        {
          headers: {
            Authorization: `bearer ${accessString}`
          }
        },
        () => { }
      );
      if (objList.data.length > 0) {
        this.setState({
          imgListObject: objList,
          imgKey: objList.data[this.state.imgCount].Key
        });
      }
    } catch (e) {
      console.log(e.response);
    }
  }
  // 13.233.125.241
  saveImageData = async () => {
    console.log("annotations");
    let accessString = localStorage.getItem("jwt");
    await axios
      .put(
        "/annotations",
        {
          fileName: this.state.imgKey,
          annotatedData: this.state.annotatedData,
          isAnnotated: this.state.isAnnotated
        },
        {
          headers: {
            Authorization: `bearer ${accessString}`
          }
        }
      )
      .then(resp => {
        console.log(resp);
      })
      .catch(e => {
        console.log(e);
      });
  };

  nextImage = async () => {
    try {
      let { imgCount, imgKey, imgListObject } = this.state;
      let objLen;
      console.log(this.state.imgListObject)
      if (imgListObject.data !== undefined) {
        objLen = imgListObject.data.length;
      } else {
        alert("No data for this user");
        return;
      }
      let accessString = localStorage.getItem("jwt");
      console.log("this is called ")
      await axios
        .get(`/user/image?key=${imgKey}`, {
          // responseType: "arraybuffer",
          headers: {
            Authorization: `bearer ${accessString}`
          }
        }).then((res)=>{
          console.log("[response]",res)
          this.toArrayBuffer(res.data.image.data)
                        .then((t) => {
                            const imgFile = new Blob([t], {
                                type: "image/jpeg"
                            });
                            const imgUrl = URL.createObjectURL(imgFile);
                            this.setState({
                                // call_type: 'next',
                                // curr_image_index: this.state.curr_image_index + 1,
                                src: imgUrl,
                                regions: res.data.annotations.obj_dect,
                                // metadata: res.data.metadata,
                                // image_key: res.data.image_key
                            })
                        })
          // const imgFile = new Blob([res.data], {
          //   type: "image/jpeg"
          // });
          // const imgUrl = URL.createObjectURL(imgFile);
          // this.setState({ src: imgUrl })
        }
        )
        .catch(e => {
          console.log(e);
          console.log(e.response.data);
        });

      if (imgCount >= objLen) {
        this.setState({
          imgCount: 1
        });
        return;
      }

      this.setState({
        imgCount: imgCount + 1,
        imgKey: imgListObject.data[imgCount].Key,
        isAnnotated: false
      });
    } catch (e) {
      console.log(e.response);
    }
  };

  onExitData = data => {
    console.log(this.state.src);
    console.log(data);
  };

 changeAnnotateMode=(mode)=>{
   this.setState({annotatemode:mode})
 }




  render() {
    return (
        <ReactImageAnnotate
          changeImageSet={this.nextImage}
          changeAnnotateMode = {this.changeAnnotateMode}
          annotatemode = {this.state.annotatemode}
          allowedArea={{
            x:0,
            y:0,
            w:1,
            h:1
          }
          }
          taskDescription="Annotate the imaes by selecting the mode for object detection or segmentationl"
          images={[
            {
              src: this.state.src,
              name: this.state.name,
              regions: this.state.region
            }
          ]}
          regionClsList={data.class}
          regionTagList={["Road", "Highway", "LeaseRoad", "MainRoad"]}
          onExit={(data)=>{console.log(data)}}
        />
    );
  }
}

export default ImageRender;
