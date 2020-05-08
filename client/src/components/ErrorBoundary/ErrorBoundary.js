import React from "react";
import swal from "sweetalert";


class ErrorBoundary extends React.Component {
    constructor(props) {
      super(props);
      this.state = { hasError: false };
    }
  
    static getDerivedStateFromError(error) {
      // Update state so the next render will show the fallback UI.
      return { hasError: true };
    }

      
    componentDidCatch(error, errorInfo) {
        alert (error)
        // You can also log the error to an error reporting service
        // swal({
        //     title: "Are you sure?",
        //     text: "Are you sure that you want to leave this page?",
        //     icon: "warning",
        //     dangerMode: true,
        //   })
        //   .then(willDelete => {
        //     if (willDelete) {
        //       swal("Deleted!", "Your imaginary file has been deleted!", "success");
        //     }
        //   });
      }
  
    render() {
      if (this.state.hasError) {
        // You can render any custom fallback UI
        return  <h1>Something went wrong.</h1>//this.indicateError()
      }
  
      return this.props.children; 
    }
  }


  export default ErrorBoundary