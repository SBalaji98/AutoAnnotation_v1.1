import React, { Component } from "react";
// import ImageRender from "./image-render";
import ImageRender from "./mainpage"
import Navbar from "./navbar";
import swal from "sweetalert";
import {withRouter, Redirect} from "react-router-dom"
import ErrorBoundary from '../ErrorBoundary/ErrorBoundary'
class Home extends Component {


  render() {
    const loggedIn = this.props.loggedIn;
    const updateUser = this.props.updateUser
    if(loggedIn){
      return (
        <div>
           <ErrorBoundary>
           <Navbar updateUser={updateUser} loggedIn={loggedIn} /> 
           </ErrorBoundary>
         
          <ErrorBoundary>
            <ImageRender />
          </ErrorBoundary>
          
        </div>
      );
    }
    return <Redirect to='/' />
  
  }
}

export default withRouter(Home);
