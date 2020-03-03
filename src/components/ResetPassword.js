import React, { Component } from "react";
import axios from "axios";

export class ResetPassword extends Component {
  constructor() {
    super();
    this.state = {
      password: "",
      confirmPassword: ""
    };
    this.handleSubmit = this.handleSubmit.bind(this);
    this.handleChange = this.handleChange.bind(this);
  }

  handleChange(event) {
    this.setState({
      [event.target.name]: event.target.value
    });
  }

  handleSubmit(event) {
    event.preventDefault();

    axios
      .post("/user/reset", {
        password: this.state.password
      })
      .then(res => {
        console.log(res);
      });
  }
  render() {
    return (
      <div>
        <h4>Reset Password</h4>

        <div className="form-group">
          <div className="col-1 col-ml-auto">
            <label className="form-label" htmlFor="password">
              Password:{" "}
            </label>
          </div>
          <div className="col-3 col-mr-auto">
            <input
              className="form-input"
              placeholder="password"
              type="password"
              name="password"
              value={this.state.password}
              onChange={this.handleChange}
              required="required"
            />
          </div>
        </div>
        <div className="form-group">
          <div className="col-1 col-ml-auto">
            <label className="form-label" htmlFor="username">
              Confirm Password
            </label>
          </div>
          <div className="col-3 col-mr-auto">
            <input
              className="form-input"
              type="password"
              name="confirmPassword"
              placeholder="Confirm Password"
              value={this.state.confirmPassword}
              onChange={this.handleChange}
              required="required"
            />
          </div>
        </div>
        <div className="form-group ">
          <div className="col-7"></div>
          <button className="btn btn-primary col-1 col-mr-auto" type="submit">
            Submit
          </button>
        </div>
      </div>
    );
  }
}

export default ResetPassword;
