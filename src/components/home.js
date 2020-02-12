import React, { Component } from "react";
import ImageRender from "./image-render";

class Home extends Component {
  constructor() {
    super();
  }

  render() {
    const loggedIn = this.props.loggedIn;
    console.log(this.props);
    console.log(loggedIn);
    const imageStyle = {
      margin: 200,
      width: 400
    };
    return (
      <div>
        {loggedIn ? (
          <ImageRender />
        ) : (
          <div>
            <h2>Welcome!!!</h2>
            <h3>Please Login to use the Application!</h3>
          </div>
        )}
      </div>
    );
  }
}

export default Home;
