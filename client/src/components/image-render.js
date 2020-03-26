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
    try {
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
    } catch (e) {
      console.log(e.response);
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
    try {
      let { imgCount, imgKey, imgListObject } = this.state;
      let objLen;
      if (imgListObject.data !== undefined) {
        objLen = imgListObject.data.length;
      } else {
        alert("No data for this user");
        return;
      }
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
          console.log(e.response.data);
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
    } catch (e) {
      console.log(e.response);
    }
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
