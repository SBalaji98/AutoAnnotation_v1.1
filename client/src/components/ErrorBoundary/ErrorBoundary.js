import React from "react";
import swal from "sweetalert";


class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }


  componentDidCatch(error, errorInfo) {
    console.log("[error from boundary]")
  }

  render() {
    if (this.state.hasError) {
        return (
        <div>
          <h1>Something went wrong.</h1>
          <h2>try reloading</h2>
        </div>
      )
    }

    return this.props.children;
  }
}


export default ErrorBoundary