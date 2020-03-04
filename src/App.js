import React, { Component } from "react";
import { Route } from "react-router-dom";
// components
import Signup from "./components/sign-up";
import LoginForm from "./components/login-form";
import Navbar from "./components/navbar";
import Home from "./components/home";
import ForgotPassword from "./components/forgotPassword";
import ResetPassword from "./components/ResetPassword";
import Routes from "./Routes";

class App extends Component {
  constructor() {
    super();
    this.state = {
      loggedIn: false,
      username: null
    };

    this.updateUser = this.updateUser.bind(this);
  }

  updateUser(userObject) {
    this.setState(userObject);
  }

  render() {
    return (
      <div className="App">
        <Navbar updateUser={this.updateUser} loggedIn={this.state.loggedIn} />
        {/* greet user if logged in: */}
        {this.state.loggedIn && <p>Join the party, {this.state.username}!</p>}
        {/* Routes to different components */}
        <Route
          exact
          path="/"
          render={() => <Home loggedIn={this.state.loggedIn} />}
        />
        <Route
          path="/login"
          render={() => <LoginForm updateUser={this.updateUser} />}
        />
        <Routes />
      </div>
    );
  }
}

export default App;
