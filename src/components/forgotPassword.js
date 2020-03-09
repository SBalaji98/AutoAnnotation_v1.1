import React, { Component } from "react";
import axios from "axios";

export class forgotPassword extends Component {
  constructor() {
    super();

    this.state = {
      email: "",
      emailSent: false
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
      .post("/user/forgot-password", {
        email: this.state.email
      })
      .then(res => {
        if ((res.data.message = "recovery mail sent")) {
          this.setState({
            emailSent: true
          });
        }
      })
      .catch(e => {
        alert(e);
      });
  }

  render() {
    if (this.state.emailSent === true) {
      return (
        <div>
          {" "}
          <h4>A reset link has been sent to your email</h4>
        </div>
      );
    }

    return (
      <div>
        <h4>Forgot Password</h4>
        <h5>Please provide your register email address</h5>

        <form className="form-horizontal">
          <div className="form-group">
            <div className="col-1 col-ml-auto">
              <label className="form-label" htmlFor="username">
                Email
              </label>
            </div>
            <div className="col-3 col-mr-auto">
              <input
                className="form-input"
                type="text"
                id="email"
                name="email"
                placeholder="email"
                onChange={this.handleChange}
              />
            </div>
          </div>

          <div className="form-group ">
            <div className="col-7"></div>
            <button
              className="btn btn-primary col-1 col-mr-auto"
              onClick={this.handleSubmit}
              type="submit"
            >
              Send
            </button>
          </div>
        </form>
      </div>
    );
  }
}

export default forgotPassword;
