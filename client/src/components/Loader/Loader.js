import React from 'react';
import './Loader.css';
// import loader from '../../assets/images/loader.png'

const Loader = (props) => {
    return (
        <div className="loader-container">
            <div className="loader">
                <div className="ellipse"></div>
                <div className="ellipse"></div>
                <div className="ellipse"></div>
                <div className="ellipse"></div>
                <div className="ellipse"></div>
            </div>
            <p style={{color : "white", fontSize : "2rem", marginTop : "4rem"}}> {props.message} </p>
        </div>
    );
}

export default Loader;