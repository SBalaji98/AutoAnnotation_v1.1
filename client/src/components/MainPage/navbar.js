import React, { Component } from "react";
import { Link } from "react-router-dom";
import logo from "../../images/logo.png";
import "../../App.css";

class Navbar extends Component {
  constructor() {
    super();
    this.logout = this.logout.bind(this);
  }

  logout = event => {
    console.log("logging out");
    event.preventDefault();
    localStorage.removeItem("jwt");
    this.props.updateUser({
      loggedIn: false,
      username: null
    });
  };

  render() {
    const loggedIn = this.props.loggedIn;

    return (
      <div>
        {loggedIn ? (
          <div className="w3-bar w3-black">
            <a className="w3-bar-item">
              {/*   <strong><span className="w3-white">FLUX</span>&nbsp;</strong> */}
              <strong><span className="w3-text-red">AUTO</span>&nbsp;</strong>
              <strong><span>ANNOTATION</span></strong></a>
            {/* <img src={logo} className="App-logo" alt="logo" /> */}
            <Link to="/" className="w3-bar-item w3-button w3-hover-dark-gray">
              Home
            </Link>
            <Link
              to="#"
              className="w3-bar-item w3-button w3-hover-dark-gray  w3-right"
              onClick={this.logout}
            >
              LogOut
            </Link>
          </div>
        ) : (
            <div className="w3-bar w3-black">

              {/* <img src={logo} className="App-logo" alt="logo" /> */}
              {/* <h1 className="App-title">Annotation App</h1> */}
              <a className="w3-bar-item">
                {/*   <strong><span className="w3-white">FLUX</span>&nbsp;</strong> */}
                <strong><span className="w3-text-red">AUTO</span>&nbsp;</strong>
                <strong><span>ANNOTATION</span></strong></a>
              <Link to="/" className="w3-bar-item w3-button w3-hover-dark-gray ">
                Home
              </Link>
              <Link to="/login" className="w3-bar-item w3-button w3-hover-dark-gray w3-right">
                Login
              </Link>
              <Link to="/signup" className="w3-bar-item w3-button w3-hover-dark-gray w3-right">
                SignUp
              </Link>
            </div>)}
      </div>
    );
  }
}

export default Navbar;
