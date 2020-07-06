import React from 'react';
import clsx from 'clsx';
import { makeStyles } from '@material-ui/core/styles';
import SwipeableDrawer from '@material-ui/core/SwipeableDrawer';
import Button from '@material-ui/core/Button';
import List from '@material-ui/core/List';
import Divider from '@material-ui/core/Divider';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import InboxIcon from '@material-ui/icons/MoveToInbox';
import MailIcon from '@material-ui/icons/Mail';

const useStyles = makeStyles({
  list: {
    width: 250,
  },
  fullList: {
    width: 'auto',
  },
});

let images = localStorage.getItem("ImageList") ? JSON.parse(localStorage.getItem("ImageList")).map((text) => {
  const image = text.split("/")
  return ({ "image_main": text, "image": image[1] })
}
):null

export default function SwipeableTemporaryDrawer(props) {
  const classes = useStyles();
  const [state, setState] = React.useState({
    top: false,
    left: false,
    bottom: false,
    right: false,
  });


  const toggleDrawer = (anchor, open) => (event) => {
    if (event && event.type === 'keydown' && (event.key === 'Tab' || event.key === 'Shift')) {
      return;
    }

    setState({ ...state, [anchor]: open });
  };
  // const { speed,deviceId,route,timeses,coolant,gaslevel,atp,lat,lon,altitude}= props.details


  const list = (anchor) => (

    <div
      className={clsx(classes.list, {
        [classes.fullList]: anchor === 'top' || anchor === 'bottom',
      })}
      role="presentation"
      onClick={toggleDrawer(anchor, false)}
      onKeyDown={toggleDrawer(anchor, false)}
    >
      <div className="w3-black w3-padding">
        Images List
    </div>
      <List>
        {
          images.length>0 &&
        images.map((text, index) => (
          <ListItem >
            {/* <ListItemIcon>{index % 2 === 0 ? <InboxIcon /> : <MailIcon />}</ListItemIcon> */}
            <a className="w3-button" onClick={() => { props.updateImage_key(text.image_main) }}>{text.image}</a>
          </ListItem>

        ))}

      </List>
      <Divider />
      <List>
        {[].map((text, index) => (
          <ListItem>
            {/* <ListItemIcon>{index % 2 === 0 ? <InboxIcon /> : <MailIcon />}</ListItemIcon> */}
            <ListItemText primary={text} />
          </ListItem>
        ))}
      </List>
    </div>
  );
  const anchor = 'left'
  return (
    <div>

      <React.Fragment key={anchor}>
        <a className="w3-button w3-left  " onMouseOver={toggleDrawer(anchor, true)}>Images</a>
        <SwipeableDrawer
          anchor={anchor}
          open={state[anchor]}
          onClose={toggleDrawer(anchor, false)}
          onOpen={toggleDrawer(anchor, true)}
        >
          {list(anchor)}
        </SwipeableDrawer>
      </React.Fragment>

    </div>
  );
}
