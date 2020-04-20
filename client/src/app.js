// import React, { useState } from "react";
// import ReactImageAnnotate from "./Annotator/index";
// import axios from 'axios'
// import bike from './bike-pic.png'
// import frame from './frame9686.jpg'


// const exitfunction = (data) => {
//   console.log(data.images[0].regions)
//   axios.post('http://localhost:5000/data', data)
//     .then((res) => console.log(res))
//     .catch(function (error) {
//       console.log(error);
//     });
// }

// var json = {
//   x: 0,
//   y: 0,
//   w: 1,
//   h: 1
// }
// class App extends React.Component{

//   state = {
//     src:frame,
//     region:  [{
//       cls: "Car",
//       color: "hsl(264,100%,50%)",
//       type: "box",
//       id: "885140028730734",
//       tags: ["Moving"],
//       w: 0.2627711048576583,
//       x: 0.20751775748638238,
//       y: 0.5566583219431673,
//       h: 0.268717618171478,
//       highlighted: false,
//       editingLabels: false
//     },
//     {
//       cls: "Car",
//       color: "hsl(127,100%,50%)",
//       w: 0.033016094117647055,
//       x: 0.5051247779336334,
//       y: 0.5396378545840628,
//       h: 0.03423999999999994,
//       type: "box",
//       id: "5952553512262024",
//       tags: ["Stopped"],
//       highlighted: false,
//       editingLabels: false
//     }],
//   }
 
//   clickHandler=()=>{
//     this.setState({src : bike})
//     this.setState({region:[
//       {
//         cls: "Car",
//         color: "hsl(82,100%,50%)",
//         h: 0.45921666772960146,
//         w: 0.3932156342484836,
//         x: 0.6302148980776354,
//         y: 0.5559504689545722,
//         type: "box",
//         id: "8776160642957009",
//         tags: ["Stopped"],
//         highlighted: false,
//         editingLabels: false
//       },
   
//       {
//         type: "box",
//         x: 0.7847296794208894,
//         y: 0.3635007199404308,
//         w: 0.04871147880041349,
//         h: 0.10995961095800888,
//         highlighted: true,
//         editingLabels: false,
//         color: "hsl(268,100%,50%)",
//         id: "5647593040225252",
//         cls: "Sign"
//       }
//     ]})
//   }
//   render()
//   {
//     return (
//       <div className="App">
//         <ReactImageAnnotate
//           allowedArea={json}
//           selectedImage={this.state.src}
//           //"https://homepages.cae.wisc.edu/~ece533/images/barbara.png"
//           taskDescription="# Draw region around each face\n\nInclude chin and hair."
//           images={[
//             {
//               src: this.state.src,
//               name: "Image 1",
//               regions: this.state.region
//             }
//           ]}
//           regionClsList={["Person", "Bicycle", "Car", " Motor cycle",
//             "Bus", "Train", "Truck", "Traffic light","Fire hydrant", "Street sign", "Stop sign",
//             "Parking meter", "Cat", "Dog", "Cow", "None","Bird", "Bottle", "Petrolpump", "Manhole",
//             "Tree", "Road divider", "toll stop", "Traffic cone", "Bricks",
//             "Speed Breakers", "Barricades", "Pot holes", "Speed limit boards",
//             "Street light", "Grass","Rock", "Direction boards", "Road",
//             "Road lanes", "Pavement", "Sky","Milestone", "Board", "Auto rikshaw",
//             "JCB", "Main lane area", "Alternate lane area"
//           ]}
//           onExit={exitfunction}
//         />
//         <button onClick={this.clickHandler}>next</button>
//       </div>
      
//     )
//         }
  
// }

// export default App;
import React, { useState } from "react";
import ReactImageAnnotate from "./Annotator/index";
import ImageAnnotate from "./Annotator/ind" 
import axios from 'axios'
import bike from './bike-pic.png'
import frame from './frame9686.jpg'


const exitfunction = (data) => {
  console.log(data.images[0].regions)
  axios.post('http://localhost:5000/data', data)
    .then((res) => console.log(res))
    .catch(function (error) {
      console.log(error);
    });
}

var json = {
  x: 0,
  y: 0,
  w: 1,
  h: 1
}
const App =()=>{

    const [state, setState] = useState({
      src:frame,
      name: "Image1",
        region:  [{
          cls: "Car",
          color: "hsl(264,100%,50%)",
          type: "box",
          id: "885140028730734",
          tags: ["Moving"],
          w: 0.2627711048576583,
          x: 0.20751775748638238,
          y: 0.5566583219431673,
          h: 0.268717618171478,
          highlighted: false,
          editingLabels: false
        },
        {
          cls: "Car",
          color: "hsl(127,100%,50%)",
          w: 0.033016094117647055,
          x: 0.5051247779336334,
          y: 0.5396378545840628,
          h: 0.03423999999999994,
          type: "box",
          id: "5952553512262024",
          tags: ["Stopped"],
          highlighted: false,
          editingLabels: false
        }]})  

 
 
  const nextSetHandler=()=>{
    setState({...state,src : bike,
      name:"Image2",
        region:[
        {
          cls: "Car",
          color: "hsl(82,100%,50%)",
          h: 0.45921666772960146,
          w: 0.3932156342484836,
          x: 0.6302148980776354,
          y: 0.5559504689545722,  
          type: "box",
          id: "8776160642957009",
          tags: ["Stopped"],
          highlighted: false,
          editingLabels: false
        },
     
        {
          type: "box",
          x: 0.7847296794208894,
          y: 0.3635007199404308,
          w: 0.04871147880041349,
          h: 0.10995961095800888,
          highlighted: true,
          editingLabels: false,
          color: "hsl(268,100%,50%)",
          id: "5647593040225252",
          cls: "Sign"
        }
      ]})
 
  }
    return (
      <div className="App">

        {/* <ReactImageAnnotate
          allowedArea={json}
         // selectedImage={state.src}
          //"https://homepages.cae.wisc.edu/~ece533/images/barbara.png"
          taskDescription="# Draw region around each face\n\nInclude chin and hair."
          images={[
            {
              src: state.src,
              name: "Image 1",
              regions:state.region
            }
          ]}
          regionClsList={["Person", "Bicycle", "Car", " Motor cycle",
            "Bus", "Train", "Truck", "Traffic light","Fire hydrant", "Street sign", "Stop sign",
            "Parking meter", "Cat", "Dog", "Cow", "None","Bird", "Bottle", "Petrolpump", "Manhole",
            "Tree", "Road divider", "toll stop", "Traffic cone", "Bricks",
            "Speed Breakers", "Barricades", "Pot holes", "Speed limit boards",
            "Street light", "Grass","Rock", "Direction boards", "Road",
            "Road lanes", "Pavement", "Sky","Milestone", "Board", "Auto rikshaw",
            "JCB", "Main lane area", "Alternate lane area"
          ]}
          onExit={exitfunction}
        /> */}
          <ImageAnnotate

          changeImageSet={nextSetHandler}
          allowedArea={json}
         // selectedImage={state.src}
          //"https://homepages.cae.wisc.edu/~ece533/images/barbara.png"
          taskDescription="# Draw region around each face\n\nInclude chin and hair."
          images={[
            {
              src: state.src,
              name: state.name,
             regions:state.region
            }
          ]}
          regionClsList={["Person", "Bicycle", "Car", " Motor cycle",
            "Bus", "Train", "Truck", "Traffic light","Fire hydrant", "Street sign", "Stop sign",
            "Parking meter", "Cat", "Dog", "Cow", "None","Bird", "Bottle", "Petrolpump", "Manhole",
            "Tree", "Road divider", "toll stop", "Traffic cone", "Bricks",
            "Speed Breakers", "Barricades", "Pot holes", "Speed limit boards",
            "Street light", "Grass","Rock", "Direction boards", "Road",
            "Road lanes", "Pavement", "Sky","Milestone", "Board", "Auto rikshaw",
            "JCB", "Main lane area", "Alternate lane area"
          ]}
          regionTagList={["Road","Highway","LeaseRoad","MainRoad"]}
          onExit={exitfunction}
        />
       {/*   <button onClick={clickHandler}>next</button> */}
      </div>
      
    )
        }
  


export default App;
