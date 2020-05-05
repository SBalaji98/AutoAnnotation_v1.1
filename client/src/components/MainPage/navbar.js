import React, { Component } from "react";
import { Link } from "react-router-dom";
import logo from "../../images/logo.png";
import "../../App.css";
import ExitIcon from "@material-ui/icons/ExitToApp"
import { withRouter } from "react-router-dom";
import Loader from '../Loader/Loader';
import swal from 'sweetalert'
class Navbar extends Component {


  logout = () => {
    const { history } = this.props;
    console.log("logging out");
    localStorage.removeItem("jwt");
    this.props.updateUser({
      loggedIn: false,
      username: null
    });
    history.push('/')
  };

  confirmLogout = () => {
    swal({
      title: "Are you sure to Logout?",
      icon: "warning",
      buttons: true,
      dangerMode: true,
    })
      .then((willLogout) => {
        if (willLogout) {
          this.logout();
        } else {
          swal("You are loggedIn !");
        }
      });
  }


  render() {
    const loggedIn = this.props.loggedIn;
    // const { history } = this.props;

    return (
      <div>
        {loggedIn ? (
          <div className="w3-bar w3-black">
            <a className="w3-bar-item">
              {/*   <strong><span className="w3-white">FLUX</span>&nbsp;</strong> */}
              <img src={logo} className="App-logo" alt="logo" />

              <strong><span className="w3-text-red">AUTO</span>&nbsp;</strong>
              <strong><span>ANNOTATION</span></strong></a>
            {/* <Link to="/" className="w3-bar-item w3-button w3-hover-dark-gray">
              Home
            </Link> */}
            <Link
              to="#"
              className="w3-bar-item w3-button w3-hover-dark-gray  w3-right"
              onClick={this.confirmLogout}
            >
              <ExitIcon />

              <div>
                LogOut
              </div>

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
              {/* <Link to="/" className="w3-bar-item w3-button w3-hover-dark-gray ">
                Home
              </Link> */}
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

export default withRouter(Navbar);
