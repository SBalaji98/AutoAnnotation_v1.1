import React, { Component } from "react";
// import ImageRender from "./image-render";
import ImageRender from "./mainpage"
import Navbar from "./navbar";
import swal from "sweetalert";
import {withRouter, Redirect} from "react-router-dom"
class Home extends Component {

redirect = ()=>{
  const { history } = this.props;
  console.log("[Home]",history.location.pathname)
  setTimeout(() => {
    if(history.location.pathname!='/'){
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
  }, 1000);
 
    

}
  render() {
    const loggedIn = this.props.loggedIn;
    const updateUser = this.props.updateUser
    if(loggedIn){
      return (
        <div>
          <Navbar updateUser={updateUser} loggedIn={loggedIn} /> 
            <ImageRender />
        </div>
      );
    }
    return <Redirect to='/' />
  
  }
}

export default withRouter(Home);
