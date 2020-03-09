import React, { Component } from "react";
import { Redirect } from "react-router-dom";
import axios from "axios";
import PhoneInput from "react-phone-input-2";

class Signup extends Component {
  constructor() {
    super();
    this.state = {
      username: "",
      password: "",
      confirmPassword: "",
      firsName: "",
      lastName: "",
      email: "",
      mobile: "",
      redirectTo: null
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
    console.log("sign-up handleSubmit, username: ");
    console.log(this.state.username);
    event.preventDefault();
    if (this.state.password !== this.state.confirmPassword) {
      alert("Passwords did not match");
    } else {
      //request to server to add a new username/password
      axios
        .post("/user/", {
          username: this.state.username,
          password: this.state.password,
          confirmPassword: this.state.confirmPassword,
          firstName: this.state.firstName,
          lastName: this.state.lastName,
          email: this.state.email,
          mobile: this.state.mobile
        })
        .then(response => {
          if (!response.data.error) {
            console.log("successful signup");
            this.setState({
              //redirect to login page
              redirectTo: "/login"
            });
          } else {
            alert("username already taken");
          }
        })
        .catch(error => {
          let errors = error.response.data.errors;
          alert(errors[0].msg);
        });
    }
  }

  render() {
    if (this.state.redirectTo) {
      return <Redirect to={{ pathname: this.state.redirectTo }} />;
    } else {
      return (
        <div className="SignupForm">
          <h4>Sign up</h4>
          <form className="form-horizontal" onSubmit={this.handleSubmit}>
            <div className="form-group">
              <div className="col-1 col-ml-auto">
                <label className="form-label" htmlFor="username">
                  First Name
                </label>
              </div>
              <div className="col-3 col-mr-auto">
                <input
                  className="form-input"
                  type="text"
                  id="firstName"
                  name="firstName"
                  required="required"
                  placeholder="First Name"
                  value={this.state.firstName}
                  onChange={this.handleChange}
                />
              </div>
            </div>
            <div className="form-group">
              <div className="col-1 col-ml-auto">
                <label className="form-label" htmlFor="username">
                  Last Name
                </label>
              </div>
              <div className="col-3 col-mr-auto">
                <input
                  className="form-input"
                  type="text"
                  id="lastName"
                  name="lastName"
                  required="required"
                  placeholder="Last Name"
                  value={this.state.lastName}
                  onChange={this.handleChange}
                />
              </div>
            </div>
            <div className="form-group">
              <div className="col-1 col-ml-auto">
                <label className="form-label" htmlFor="username">
                  Username
                </label>
              </div>
              <div className="col-3 col-mr-auto">
                <input
                  className="form-input"
                  type="text"
                  id="username"
                  name="username"
                  required="required"
                  placeholder="Username"
                  value={this.state.username}
                  onChange={this.handleChange}
                />
              </div>
            </div>
            <div className="form-group">
              <div className="col-1 col-ml-auto">
                <label className="form-label" htmlFor="username">
                  Email
                </label>
              </div>
              <div className="col-3 col-mr-auto">
                <input
                  className="form-input"
                  type="email"
                  id="email"
                  name="email"
                  placeholder="Email"
                  value={this.state.email}
                  onChange={this.handleChange}
                  required="required"
                />
              </div>
            </div>

            <div className="form-group">
              <div className="col-1 col-ml-auto">
                <label className="form-label" htmlFor="username">
                  Mobile No.
                </label>
              </div>
              <div className="col-3 col-mr-auto">
                <PhoneInput
                  inputClass="form-input"
                  placeholder="Mobile Number"
                  country={"in"}
                  inputProps={{
                    type: "tel",
                    id: "mobile",
                    name: "mobile",
                    renderStringAsFlag: "india",
                    required: "required"
                  }}
                  value={this.state.mobile}
                  onChange={mobile => this.setState({ mobile })}
                />
              </div>
            </div>

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
              <button
                className="btn btn-primary col-1 col-mr-auto"
                type="submit"
              >
                Sign up
              </button>
            </div>
          </form>
        </div>
      );
    }
  }
}

export default Signup;
