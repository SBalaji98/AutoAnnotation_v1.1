import React, { Component } from "react";
import { Redirect } from "react-router-dom";
import "../../App.css";
import ExitIcon from "@material-ui/icons/ExitToApp"
import { withRouter } from "react-router-dom";
import swal from 'sweetalert'
import Axios from "axios";
class Navbar extends Component {

  state = {
    redirectTo: false
  }

  logout = () => {
    console.log("logging out");
    Axios.post('/user/logout', {
      headers: {
        Authorization: `bearer ${localStorage.getItem("jwt")}`
      }
    }).then(() => {
      localStorage.removeItem("jwt");
      this.props.updateUser({
        loggedIn: false,
        username: null,
        role:null
      });
    })
    .catch(()=>{
      alert("cannot logout")
    })

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

  componentDidMount() {
    if (!this.props.loggedIn) {
      this.setState({ redirectTo: true })
    }
  }

  render() {
    const {loggedIn,role,user} = this.props;
    // const { history } = this.props;
    if (this.state.redirectTo) {
      return <Redirect to='/' />
    }

    return (
      <div className="w3-bar w3-black">
        <a className="w3-bar-item">
          {/* <img src={logo} className="App-logo" alt="logo" /> */}
          <strong><span className="w3-text-red ">AUTO</span>&nbsp;</strong>
          <strong><span >ANNOTATION</span></strong></a>
        <button
          className="w3-bar-item w3-button w3-hover-dark-gray  w3-right"
          onClick={this.confirmLogout}
        >
          <ExitIcon />
        </button>
        {/* <button class="w3-button "><AccountCircleIcon /></button> */}

        <strong><span className="w3-bar-item w3-right">
        {user}({role})</span></strong>
      </div>
    );
  }
}

export default withRouter(Navbar);
