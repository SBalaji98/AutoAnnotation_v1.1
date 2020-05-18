
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
import { HashRouter as Router,  Link as ReactLink} from 'react-router-dom'




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
  const [confirmPassword, setConfirmPassword] = useState('')
  const [redirectTo, setRed] = useState(null)
  const [firstName, setFname] = useState('')
  const [lastName, setLname] = useState('')
  const [mobile, setMobile] = useState('')
  const [email, setEmail] = useState(null)
  const handleUser = (event) => {
    setusername(event.target.value);
  }
  const handleFname = (event) => {
    setFname(event.target.value);
  }
  const handleLname = (event) => {
    setLname(event.target.value);
  }
  const handleEmail = (event) => {
    setEmail(event.target.value);
  }
  const handleMobile = (event) => {
    setMobile(event.target.value);
  }
  const handleCpass = (event) => {
    setConfirmPassword(event.target.value);
  }
  const handlePass = (event) => {
    setpassword(event.target.value);
  }
  const handleSubmit=(event)=> {
    

    console.log("sign-up handleSubmit, username: ");
    console.log(username);
    event.preventDefault();
    if(username && password && confirmPassword && mobile && email && firstName && lastName !== null){

    if (password !== confirmPassword) {
      alert("Passwords did not match");
    } else {
      setLoading(true);
      //request to server to add a new username/password
      axios
        .post("/user/", {
          username: username,
          password: password,
          confirmPassword: confirmPassword,
          firstName: firstName,
          lastName: lastName,
          email: email,
          mobile:mobile
        })
        .then(response => {
          if (!response.data.error) {
            setLoading(false)
            console.log("successful signup");
            setRed('/')
          } else {
            setLoading(false)
            swal({
              title: "username already exists",
              icon: "warning",
              buttons: true,
              // dangerMode: true,
          })
                     }
        })
        .catch(error => {
          setLoading(false)
          let errors = error.response.data.errors;
          swal({
            title: errors[0].msg,
            icon: "warning",
            buttons: true,
            // dangerMode: true,
        })
       
        });
    }
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

  if (redirectTo) {
    return <Redirect to={{ pathname: redirectTo }} />;
  }
  if (loading) {
    return <Loader message="signing up please wait" />
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
            Sign up
          </Typography>
          <form className={classes.form} >
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  autoComplete="fname"
                  name="firstName"
                  variant="outlined"
                  required
                  fullWidth
                  id="firstName"
                  onChange={handleFname}

                  label="First Name"
                  autoFocus
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  variant="outlined"
                  required
                  fullWidth
                  id="lastName"
                  label="Last Name"
                  name="lastName"
                  onChange={handleLname}

                  autoComplete="lname"
                />
              </Grid>
            </Grid>
       
            <TextField
              autoComplete="uname"
              margin="normal"
              onChange={handleUser}
              name="username"
              variant="outlined"
              required
              fullWidth
              id="username"
              label="User Name"
              autoFocus
            />
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
            <TextField
              variant="outlined"
              margin="normal"
              fullWidth
              id="mobile"
              label="Phone"
              name="mobile"
              autoComplete="mobile"
              onChange={handleMobile}
              autoFocus
              required
            />
                        <Grid container spacing={2}>
                        <Grid item xs={12} sm={6}>

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
            </Grid>
            <Grid item xs={12} sm={6}>

            <TextField
              variant="outlined"
              margin="normal"
              fullWidth
              name="confirmPassword"
              label="Confirm Password"
              type="password"
              id="password"
              onChange={handleCpass}
              autoComplete="current-password"
              required
            />
</Grid>
</Grid>
            <Button
              type="submit"
              fullWidth
              onClick={handleSubmit}
              variant="contained"
              color="primary"
              className={classes.submit}
            >
              Sign Up
                                </Button>
            <Grid container>
              <Grid item>
                <Link href="/" variant="body2">
                  {"Have an account? Sign In"}
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
