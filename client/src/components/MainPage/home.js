import React, { Component } from "react";
// import ImageRender from "./image-render";
import ImageRender from "./mainpage"
// import background from "../carback.jpg";
// import logo from "../logo.png"
// import "./component.css"

class Home extends Component {
  render() {
    const loggedIn = this.props.loggedIn;
    return (
      <div>
        {loggedIn ? (
          <ImageRender />
        ) : (
          <div className="homemain">
            {/* <img src={background}></img> */}
            <h2>Welcome!!!</h2>
            <h3>Please Login to use the Application!</h3>
          </div>
        )}
      </div>
    );
  }
}

export default Home;
