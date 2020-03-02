import React, { Component } from "react";
import axios from "axios";
class App extends Component {
  state = {
    src: "",
    imgKey: "",
    imgListObject: [],
    imgCount: 0,
    buttonVal: "Start",
    isAnnotated: null,
    annotatedData: {}
  };

  async componentDidMount() {
    let accessString = localStorage.getItem("jwt");
    let objList = await axios.get(
      "/user/image-data",
      {
        headers: {
          Authorization: `bearer ${accessString}`
        }
      },
      () => {}
    );
    if (objList.data.length > 0) {
      this.setState({
        imgListObject: objList,
        imgKey: objList.data[0].Key
      });
    }
  }

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
    let { imgCount, imgKey, imgListObject } = this.state;
    let objLen = imgListObject.data.length;
    let accessString = localStorage.getItem("jwt");

    await axios
      .get(`/user/image?key=${imgKey}`, {
        responseType: "arraybuffer",

        headers: {
          Authorization: `bearer ${accessString}`
        }
      })
      .then(result => {
        const imgFile = new Blob([result.data], {
          type: "image/jpeg"
        });
        const imgUrl = URL.createObjectURL(imgFile);
        this.setState({ src: imgUrl });
      })
      .catch(e => {
        console.log(e);
      });

    if (imgCount >= objLen) {
      this.setState({
        imgCount: 0
      });
      return;
    }

    this.setState({
      imgCount: imgCount + 1,
      imgKey: imgListObject.data[imgCount].Key,
      buttonVal: "Next",
      isAnnotated: false
    });

    // this.saveImageData();
  };

  render() {
    return (
      <div className="App">
        <div>
          <input
            type="button"
            value={this.state.buttonVal}
            onClick={this.nextImage}
          />
        </div>
        <img src={` ${this.state.src}`} alt="" />
      </div>
    );
  }
}

export default App;
