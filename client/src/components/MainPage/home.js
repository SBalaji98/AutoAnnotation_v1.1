import React, { Component } from "react";
// import ImageRender from "./image-render";
import ImageRender from "./mainpage"
import Navbar from "./navbar";
import swal from "sweetalert";
import {withRouter, Redirect} from "react-router-dom"
import ErrorBoundary from '../ErrorBoundary/ErrorBoundary'
class Home extends Component {


  render() {
    const {loggedIn,user,updateUser} = this.props;
  
    if(loggedIn){
      return (
        <div>
           <ErrorBoundary>
           <Navbar loggedIn={loggedIn} updateUser={updateUser} /> 
           </ErrorBoundary>
         
          <ErrorBoundary>
            <ImageRender user={user} />
          </ErrorBoundary>
          
        </div>
      );
    }
    return <Redirect to='/' />
  
  }
}

export default withRouter(Home);
