import React, { Component } from "react";
import axios from "axios";
import {withRouter} from "react-router-dom"
import PropTypes from "prop-types";

const loading = {
  margin: "1em",
  fontSize: "24px"
};
class ResetPassword extends Component {
  constructor() {
    super();

    this.state = {
      username: "",
      password: "",
      confirmPassword: "",
      updated: false,
      isLoading: true,
      error: false
    };
    this.handleSubmit = this.handleSubmit.bind(this);
    this.handleChange = this.handleChange.bind(this);
  }

  async componentDidMount() {
    const {
      match: {
        params: { token }
      }
    } = this.props;
    try {
      const response = await axios.get("/user/reset", {
        params: {
          resetPasswordToken: token
        }
      });
      // console.log(response);
      if (response.data.message === "password reset link a-ok") {
        console.log(response.data.username);
        this.setState({
          username: response.data.username,
          updated: false,
          isLoading: false,
          error: false
        });
      }
    } catch (error) {
      console.log(error.response.data);
      this.setState({
        updated: false,
        isLoading: false,
        error: true
      });
    }
  }

  handleChange(event) {
    console.log(event.target.name);
    this.setState({
      [event.target.name]: event.target.value
    });
  }

  async handleSubmit(event) {
    event.preventDefault();

    const { username, password } = this.state;
    const {
      match: {
        params: { token }
      }
    } = this.props;
    try {
      const response = await axios.put("/user/forgot-password-update", {
        username,
        password,
        resetPasswordToken: token
      });
      console.log(response.data);
      if (response.data.message === "password reset successfully") {
        this.setState({

          updated: true,
          error: false
        });
        const {history}=this.props
        history.push('/')
      } else {
        this.setState({
          updated: false,
          error: true
        });
      }
    } catch (error) {
      console.log(error.response.data);
    }
  }
  render() {
    const { password, error, isLoading, updated, confirmPassword } = this.state;
    if (error) {
      return (
        <div>
          <div style={loading}>
            <h4>Problem resetting password. Please send another reset link.</h4>
          </div>
        </div>
      );
    }
    if (isLoading) {
      return (
        <div>
          <div style={loading}>Loading User Data...</div>
        </div>
      );
    }
    return (
      <div>
        <h4>Reset Password</h4>
        <form className="form-horizontal" onSubmit={this.handleSubmit}>
          <div className="form-group">
            <div className="col-1 col-ml-auto">
              <label className="form-label" htmlFor="password">
                New Password
              </label>
            </div>
            <div className="col-3 col-mr-auto">
              <input
                className="form-input"
                placeholder="password"
                type="password"
                name="password"
                value={password}
                onChange={this.handleChange}
                required="required"
              />
            </div>
          </div>
          <div className="form-group">
            <div className="col-1 col-ml-auto">
              <label className="form-label" htmlFor="username">
                Confirm New Password
              </label>
            </div>
            <div className="col-3 col-mr-auto">
              <input
                className="form-input"
                type="password"
                name="confirmPassword"
                placeholder="Confirm Password"
                value={confirmPassword}
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
        </form>
        {updated && (
          <div>
            <p>
              Your password has been successfully reset, please try logging in
              again.
            </p>
          </div>
        )}
      </div>
    );
  }
}

ResetPassword.propTypes = {
  // eslint-disable-next-line react/require-default-props
  match: PropTypes.shape({
    params: PropTypes.shape({
      token: PropTypes.string.isRequired
    })
  })
};
export default withRouter(ResetPassword);
