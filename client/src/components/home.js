import React, { Component } from "react";
import ImageRender from "./image-render";

class Home extends Component {
  render() {
    const loggedIn = this.props.loggedIn;
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
