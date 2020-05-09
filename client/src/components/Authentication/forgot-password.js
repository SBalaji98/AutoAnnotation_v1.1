

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
import swal from 'sweetalert';




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

export default function ForgotPassword(props) {

    const classes = useStyles();
    const [loading, setLoading] = useState(false)
    const [email, setEmail] = useState(null)
 

    const handleEmail = (event) => {
        setEmail(event.target.value);
    }

    const handleSubmit = (event) => {
        event.preventDefault();
        if(email!=null){
        setLoading(true);
        axios
        .post("/user/forgot-password", {
          email: email
        })
        .then(res => {
          if ((res.data.message = "recovery mail sent")) {
              setLoading(false)
            swal({
                title: "Recovery mail sent check yor mail",
                icon: "success",
                buttons: true,
                // dangerMode: true,
            })
          }
        })
        .catch(e => {
            setLoading(false)
            swal({
                title: e.message,
                icon: "warning",
                buttons: true,
                // dangerMode: true,
            })
        });
    }
    else{
        swal({
            title: "All fields are Mandatory",
            icon: "warning",
            buttons: true,
            // dangerMode: true,
        })
    }
    }

    if (loading) {
        return <Loader message="sending reset link to the email address" />
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
                        FORGOT PASSWORD
          </Typography>
                    <form className={classes.form} >
                        <TextField
                            variant="outlined"
                            margin="normal"
                            fullWidth
                            id="email"
                            label="Email Address"
                            name="email"
                            autoComplete="email"
                            onChange={handleEmail}
                            autoFocus
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
                            submit
                                </Button>
                        
                        <Box mt={5}>
                            <Copyright />
                        </Box>
                    </form>
                </div>
            </Grid>
        </Grid>

    );
}
