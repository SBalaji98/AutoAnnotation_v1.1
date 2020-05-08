

import React, { useState } from 'react';
import Avatar from '@material-ui/core/Avatar';
import Button from '@material-ui/core/Button';
import CssBaseline from '@material-ui/core/CssBaseline';
import TextField from '@material-ui/core/TextField';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Checkbox from '@material-ui/core/Checkbox';
import Link from '@material-ui/core/Link';
import Paper from '@material-ui/core/Paper';
import Box from '@material-ui/core/Box';
import Grid from '@material-ui/core/Grid';
import LockOutlinedIcon from '@material-ui/icons/LockOutlined';
import Typography from '@material-ui/core/Typography';
import { makeStyles } from '@material-ui/core/styles';
import logo from '../../images/logo.png'
import car from '../../images/carback.jpg'
import axios from "axios";
import { Redirect } from "react-router-dom";
import Loader from '../Loader/Loader';




function Copyright() {
    return (
        <Typography variant="body2" color="textSecondary" align="center">
            {'Copyright © '}
            <Link color="inherit" href="https://fluxauto.xyz/">
                www.fluxauto.xyz
      </Link>{' '}
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
        //   theme.palette.type === 'light' ? theme.palette.grey[50] : theme.palette.grey[900],
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

export default function SignInSide(props) {

    const classes = useStyles();
    const [loading, setLoading] = useState(false)
    const [username, setusername] = useState('')
    const [password, setpassword] = useState('')
    const [redirectTo, setRed] = useState(null)


    const handleUser = (event) => {
        setusername(event.target.value);
    }


    const handlePass = (event) => {
        setpassword(event.target.value);
    }
    const handleSubmit = (event) => {
        event.preventDefault();
        setLoading(true);
        axios
            .post("/user/login", {
                username: username,
                password: password
            })
            .then(response => {
                if (response.status === 200) {
                    // update App.js state
                    setLoading(false)
                    props.updateUser({
                        loggedIn: true,
                        username: response.data.username
                    });

                    //update local storage
                    localStorage.setItem("jwt", response.data.token);

                    // update the state to redirect to home
                    setRed("/user");
                }
            })
            .catch(error => {
                setLoading(false)
                console.log("login error: ");
                console.log(error);
            });
    }
if(localStorage.getItem("jwt")){
    axios.get('/user',
    {
        headers: {
          Authorization: `bearer ${localStorage.getItem("jwt")}`
        }
      }
    )
    .then(response => {
        if (response.status === 200) {
            // update App.js state
            props.updateUser({
                loggedIn: true,
                username: response.data.username
            });
            setRed("/user");
        }
    })
    .catch(error => {
        console.log("login in again session expired");
        console.log(error);
    });
}

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

                    {/* <img src={logo} height='100px' width='100px'></img> */}

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
                        {/* <FormControlLabel
                                control={<Checkbox value="remember" color="primary" />}
                                label="Remember me"
                            /> */}
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
                                <Link href="/forgot-password" variant="body2">
                                    Forgot password?
                                    </Link>
                            </Grid>
                            <Grid item>
                                <Link href="/signup" variant="body2">
                                    {"Don't have an account? Sign Up"}
                                </Link>
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
