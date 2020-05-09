import React, { Component } from "react";
import { Route } from "react-router-dom";
import axios from "axios";
// components
import Home from "./components/MainPage/home";
import Routes from "./Routes";
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
        {/* <Navbar updateUser={this.updateUser} loggedIn={this.state.loggedIn} /> */}
        {/* greet user if logged in: */}
        {/* {this.state.loggedIn && <p>Join the party, {this.state.username}!</p>} */}
        {/* Routes to different components */}
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
        <Routes />
      </div>
    );
  }
}

export default App;
