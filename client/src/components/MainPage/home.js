import React, { Component } from "react";
import ImageRender from "./mainpage"
import Navbar from "./navbar";
import swal from "sweetalert";
import { withRouter, Redirect } from "react-router-dom"
import ErrorBoundary from '../ErrorBoundary/ErrorBoundary'
import Evaluator from './evaluator'

class Home extends Component {


  render() {
    const { userState, updateUser } = this.props;
    console.log(userState)

    if (userState.loggedIn) {
      return (
        <div>
          <ErrorBoundary>
            <Navbar loggedIn={userState.loggedIn} user={userState.username} role={userState.role} updateUser={updateUser} />
          </ErrorBoundary>

          <ErrorBoundary>
            {userState.role === 'annotator' &&
              <ImageRender user={userState.username} />
            }
            {userState.role === 'evaluator' &&
              <Evaluator/>
            }
            
          </ErrorBoundary>
        </div>
      );
    }
    return <Redirect to='/' />

  }
}

export default withRouter(Home);
