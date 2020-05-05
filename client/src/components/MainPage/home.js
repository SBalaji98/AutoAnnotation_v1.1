import React, { Component } from "react";
// import ImageRender from "./image-render";
import ImageRender from "./mainpage"
import Navbar from "./navbar";
import swal from "sweetalert";
import {withRouter} from "react-router-dom"
class Home extends Component {

redirect = ()=>{
  const { history } = this.props;

  swal({
    title: "You are not allowed to access this page",
    text:"try logging in",
    icon: "warning",
    buttons: true,
    dangerMode: true,
  })
  .then(()=>{
    history.push('/')

  })
    
}

  render() {
    const loggedIn = this.props.loggedIn;
    const updateUser = this.props.updateUser
    return (
      <div>
        {loggedIn ? (
          <>
        <Navbar updateUser={updateUser} loggedIn={loggedIn} /> 
          <ImageRender />
          </>
        ) : (
          <>
          <span> {this.redirect()}</span>
         
          </>
        )}
      </div>
    );
  }
}

export default withRouter(Home);
