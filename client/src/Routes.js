import React from "react";
import { Switch, Route } from "react-router-dom";
// import Signup from "./components/Authentication/sign-up";
import ForgotPassword from "./components/Authentication/forgot-password";
import ResetPassword from "./components/Authentication/ResetPassword";
import Signup from "./components/Authentication/signup"

const Routes = () => (
  <div>
    <Switch>
      <Route exact path="/signup" component={Signup} />
      <Route exact path="/forgot-password" component={ForgotPassword} />
      <Route exact path="/reset/:token" component={ResetPassword} />
    </Switch>
  </div>
);

export default Routes;
