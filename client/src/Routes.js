import React from "react"
import { HashRouter as Router, Switch, Route } from "react-router-dom"
// import Signup from "./components/Authentication/sign-up";
import ForgotPassword from "./components/Authentication/forgot-password"
import ResetPassword from "./components/Authentication/ResetPassword"
import Signup from "./components/Authentication/signup"

const Routes = () => (
  <Router>
    <div>
      <Route exact path="/signup" component={Signup} />
      <Route exact path="/forgot-password" component={ForgotPassword} />
      <Route exact path="/reset/:token" component={ResetPassword} />
    </div>
  </Router>
)

export default Routes
