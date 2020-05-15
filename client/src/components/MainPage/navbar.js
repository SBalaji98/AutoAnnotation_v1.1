import React, { Component } from "react";
import { Link, Redirect } from "react-router-dom";
import logo from "../../images/logo.png";
import "../../App.css";
import ExitIcon from "@material-ui/icons/ExitToApp"
import { withRouter } from "react-router-dom";
import Loader from '../Loader/Loader';
import swal from 'sweetalert'
class Navbar extends Component {

  state = {
    redirectTo: false
  }

  logout = () => {
    console.log("logging out");
    localStorage.removeItem("jwt");
    this.props.updateUser({
      loggedIn: false,
      username: null
    });
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


  componentDidMount(){
    if(!this.props.loggedIn){
      this.setState({redirectTo:true})
    }
  }


  render() {
    const loggedIn = this.props.loggedIn;
    // const { history } = this.props;
    if (this.state.redirectTo) {
      return <Redirect to='/' />
    }

    return (
      <div className="w3-bar w3-black">
        <a className="w3-bar-item">
          {/*   <strong><span className="w3-white">FLUX</span>&nbsp;</strong> */}
          <img src={logo} className="App-logo" alt="logo" />

          <strong><span className="w3-text-red">AUTO</span>&nbsp;</strong>
          <strong><span>ANNOTATION</span></strong></a>
        <button

          className="w3-bar-item w3-button w3-hover-dark-gray  w3-right"
          onClick={this.confirmLogout}
        >
          <ExitIcon />

          <div>
            LogOut
              </div>

        </button>
      </div>
    );
  }
}

export default withRouter(Navbar);
