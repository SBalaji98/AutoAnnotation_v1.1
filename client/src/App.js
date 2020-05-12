import React, { Component } from "react";
// import { Route } from "react-router-dom";
import axios from "axios";
import ForgotPassword from "./components/Authentication/forgot-password"
import ResetPassword from "./components/Authentication/ResetPassword"
import Signup from "./components/Authentication/signup"
// components
import Home from "./components/MainPage/home";
import { HashRouter as Router, Route } from "react-router-dom";

import SignIn from "./components/Authentication/signin"
class App extends Component {
  constructor() {
    super();
    this.state = {
      loggedIn: false,
      username: null
    };

    this.updateUser = this.updateUser.bind(this);
  }
  componentDidMount() {
    const accessString = localStorage.getItem("jwt");

    axios
      .get("/user", {
        headers: {
          Authorization: `bearer ${accessString}`
        }
      })
      .then(response => {
        if (response.data.user) {
          this.setState({ loggedIn: true });
        }
      })
      .catch(e => {
        if (e.response.data.message === "jwt expired") {
          alert("Token has Expired please LogIn again");
          return;
        }
      });
  }

  updateUser(userObject) {
    this.setState(userObject);
  }

  render() {
    return (
      <div className="App">
        <Router>
        <Route
          exact
          path="/user"
          render={() => <Home updateUser={this.updateUser} loggedIn={this.state.loggedIn} />}
        />
        <Route
          exact
          path="/"
          render={() => <SignIn updateUser={this.updateUser} />}
        />
          <Route exact path="/signup" component={Signup} />
          <Route exact path="/forgot-password" component={ForgotPassword} />
          <Route exact path="/reset/:token" component={ResetPassword} />
        </Router>

      </div>
    );
  }
}

export default App;
