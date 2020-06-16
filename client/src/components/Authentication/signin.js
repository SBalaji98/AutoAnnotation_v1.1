

import React, { useState, useEffect } from 'react';
import Button from '@material-ui/core/Button';
import CssBaseline from '@material-ui/core/CssBaseline';
import TextField from '@material-ui/core/TextField';
import Link from '@material-ui/core/Link';
import Paper from '@material-ui/core/Paper';
import Box from '@material-ui/core/Box';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';
import { makeStyles } from '@material-ui/core/styles';
import logo from '../../images/logo.png'
import car from '../../images/carback.jpg'
import axios from "axios";
import { withRouter, Redirect } from "react-router-dom";
import Loader from '../Loader/Loader';
import swal from 'sweetalert';
import { HashRouter as Router, Link as ReactLink } from 'react-router-dom'
import jwt from 'jwt-decode'
import JwtDecode from 'jwt-decode';


function Copyright() {
    return (
        <Typography variant="body2" color="textSecondary" align="center">
            {'Copyright © '}
            <Link color="inherit" href="https://fluxauto.xyz/">
                www.fluxauto.xyz
      </Link>{'  '}
            {new Date().getFullYear()}
            {'.'}
        </Typography>
    );
}




const useStyles = makeStyles((theme) => ({
    root: {
        height: '100vh',
    },
    image: {
        backgroundImage: `url(${logo})`,
        backgroundRepeat: 'no-repeat',
        backgroundColor: 'black',
        backgroundSize: '500px 500px',
        backgroundPosition: 'center',
    },
    paper: {
        margin: theme.spacing(8, 4),
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
    },
    avatar: {
        margin: theme.spacing(1),
        backgroundColor: theme.palette.secondary.main,
    },
    form: {
        width: '100%', // Fix IE 11 issue.
        marginTop: theme.spacing(1),
    },
    submit: {
        margin: theme.spacing(3, 0, 2),
    },
    maindiv: {
        backgroundImage: `url(${car})`
    }

}));

function SignIn(props) {

    const classes = useStyles();
    const [loading, setLoading] = useState(false)
    const [username, setusername] = useState(null)
    const [password, setpassword] = useState(null)
    const [redirectTo, setRed] = useState(null)


    const handleUser = (event) => {
        setusername(event.target.value);
    }

    const titleHandler = (error) => {
        switch (error.message) {
            case "Request failed with status code 401":
                return "Incorect Username or Password"

            default:
                return error.message
        }

    }
    const handlePass = (event) => {
        setpassword(event.target.value);
    }
    const handleSubmit = (event) => {
        event.preventDefault();
        const { history } = props;
        if (username && password !== null) {
            setLoading(true);
            axios
                .post("/user/login", {
                    username: username,
                    password: password
                })
                .then(response => {
                    console.log("[login]",response)
                    if (response.status === 200) {
                        // update App.js state
                        setLoading(false)
                        const userInfo= jwt(response.data.token)
                        console.log("[userInfo]",userInfo)
                        props.updateUser({
                            loggedIn: true,
                            username: response.data.username,
                            role:userInfo.role
                        });
                        //update local storage
                        localStorage.setItem("jwt", response.data.token);
                        // update the state to redirect to home
                        setRed("/user");
                    }
                })
                .catch(error => {
                    setLoading(false)
                    swal({
                        title: titleHandler(error),
                        icon: "warning",
                        buttons: true,
                    })
                    history.push('/')
                });
        }
        else {
            swal({
                title: "All fields are Mandatory",
                icon: "warning",
                buttons: true,
            })
        }
    }

    const loadUser = () => {
        if (localStorage.getItem("jwt")) {

            axios.get('/user',
                {
                    headers: {
                        Authorization: `bearer ${localStorage.getItem("jwt")}`
                    }
                }
            )
                .then(response => {
                    if (response.data.error === "jwt expired") {
                        localStorage.removeItem("jwt");
                        swal({
                            title: "Session Expired",
                            text: "login again",
                            icon: "danger",
                            buttons: true,
                        })
                        setRed("/");
                    }
                    if (response.status === 200) {
                        // update App.js state
                        const userInfo=jwt(localStorage.getItem("jwt"))
                        props.updateUser({
                            loggedIn: true,
                            username: response.data.user.userName,
                            role:userInfo.role
                        });
                        setRed("/user");
                    }
                })
                .catch(error => {
                    setLoading(false)
                    alert(error);
                });
        }
    }
    useEffect(() => {
        loadUser()
    }, []);



    if (redirectTo) {
        return <Redirect to={{ pathname: redirectTo }} />;
    }
    if (loading) {
        return <Loader message="logging in please wait" />
    }
    return (

        <Grid container component="main" className={classes.root}>
            <CssBaseline />
            <Grid item xs={false} sm={4} md={7} className={classes.image} />
            <Grid item xs={12} sm={8} md={5} component={Paper} elevation={6} square>
                <div className={classes.paper}>
                    <div>
                        <h2 className="w3-text-red">AUTO</h2>
                        <h2>ANNOTATION</h2>
                    </div>
                    <Typography component="h1" variant="h5">
                        Sign in
          </Typography>
                    <form className={classes.form} >
                        <TextField
                            variant="outlined"
                            margin="normal"
                            fullWidth
                            id="email"
                            label="User Name"
                            name="email"
                            autoComplete="email"
                            onChange={handleUser}
                            autoFocus
                            required
                        />
                        <TextField
                            variant="outlined"
                            margin="normal"
                            fullWidth
                            name="password"
                            label="Password"
                            type="password"
                            id="password"
                            onChange={handlePass}
                            autoComplete="current-password"
                            required
                        />
                        <Button
                            type="submit"
                            fullWidth
                            onClick={handleSubmit}
                            variant="contained"
                            color="primary"
                            className={classes.submit}
                        >
                            Sign In
                                </Button>
                        <Grid container>
                            <Grid item xs>
                                <ReactLink to="/forgot-password" variant="body2">
                                    Forgot password?
                                    </ReactLink>
                            </Grid>
                            <Grid item>
                                <ReactLink to="/signup" variant="body2">
                                    {"Don't have an account? Sign Up"}
                                </ReactLink>
                            </Grid>
                        </Grid>
                        <Box mt={5}>
                            <Copyright />
                        </Box>
                    </form>
                </div>
            </Grid>
        </Grid>

    );
}
export default withRouter(SignIn)