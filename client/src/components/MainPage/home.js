import React, { Component } from "react";
import ImageRender from "./mainpage"
import Navbar from "./navbar";
import swal from "sweetalert";
import { withRouter, Redirect } from "react-router-dom"
import ErrorBoundary from '../ErrorBoundary/ErrorBoundary'
import Evaluator from './evaluator'

class Home extends Component {

  child = React.createRef();

  updateImage_key = (image_key) => {
    this.child.current.getAnyImage(image_key,'any');
  }

  render() {
    const { userState, updateUser } = this.props;
    console.log(userState)


    if (userState.loggedIn) {
      return (
        <div>
          <ErrorBoundary>
            <Navbar loggedIn={userState.loggedIn} user={userState.username}
              role={userState.role}
              updateUser={updateUser}
              userId={userState.userId}
              updateImage_key={this.updateImage_key} />
          </ErrorBoundary>

          <ErrorBoundary>
            {userState.role === 'annotator' &&
              <ImageRender user={userState.username} />
            }
            {userState.role === 'evaluator' &&
              <Evaluator ref={this.child}/>
            }

          </ErrorBoundary>
        </div>
      );
    }
    return <Redirect to='/' />

  }
}

export default withRouter(Home);
