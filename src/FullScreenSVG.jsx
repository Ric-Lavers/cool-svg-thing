
import React, { Component, Fragment } from 'react'


class OnBeat {

  innerHtml(val) {
    console.log(String(val))
    this.x.innerText = String(val)
  }

  init(){
    document.getElementsByTagName('body')[0].style.position = "relative"
    this.x = document.createElement('div')
    this.x.style = "border: 1px solid red; width: 20px;height: 30px; background-color: teal; position: absolute; top: 12px; left: 12px"
    this.x.id = 'onBeat'
    document.getElementsByTagName('body')[0].appendChild(this.x)

    this.display__div = x
  }
}
const abc = new OnBeat()
abc.init()
abc.innerHtml()

let token = setInterval(() => {
  if(window['stop'] == true){
    clearInterval(token)
  }
  window['onbeat'] = (
    (
      Math.round(
        (performance.now())/400
      )
    ) % 8
    ) + 1
  
  abc.innerHtml( window['onbeat'])
}, 400);



Array.prototype.sum = function(){ return this.reduce( (a,c) => a+c , 0) }

var x = Symbol.for('x')
window[x] = [0]
var KeyCodeSum = []

function downloadSVG (current_svgDraw) {
  const XMLS = new XMLSerializer(); 
  const svgDraw = XMLS.serializeToString(current_svgDraw)
  // console.debug('svgDraw', svgDraw)
  const el = document.createElement('a')
  el.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(svgDraw) );
  el.setAttribute('download', 'stringart.svg');
  el.click()// this only works once! until a human gives permission to download multiple files
}


var rEL = Symbol.for('rEL')
window[rEL] = []
var held = []
function holdKeyStroke() {

  let keydownCleanUp = (event) => {
    KeyCodeSum.push(event.keyCode)
  }

  let keyupCleanUp = (event) => {
    // console.log('keyup', KeyCodeSum.reduce((a,c) => a+c , 0) )
    KeyCodeSum.sum() !== 0 && console.log(KeyCodeSum.sum())
    held.push(KeyCodeSum.sum())
    
    KeyCodeSum = []
  }

  document.addEventListener('keydown', keydownCleanUp)
  document.addEventListener('keyup', keyupCleanUp)

    return [
      () => document.removeEventListener('keydown', keydownCleanUp),
      () => document.removeEventListener('keyup', keyupCleanUp),
    ]
}

window[Symbol.for('holdKeyStroke')] = holdKeyStroke
holdKeyStroke()

/**
 * Move
 * 
 * @param {*} keyCode 
 * @param {*} clientX 
 * @param {*} clientY 
 * @param {*} grid 
 */
const move = (keyCode, clientX, clientY, grid) => {
  // console.log(window[Symbol.for('x')])
  
  switch(keyCode) {
    case 37:/*left*/                        console.log('<-');
      return {clientX:clientX-grid, clientY}
    case 38:/*up */                         console.log('<-');;
      return {clientX, clientY:clientY-grid}
    case 39:/*right*/                       console.log('->');
      return {clientX:clientX+grid, clientY}
    case 40:/*down*/                        console.log('|\nv');
      return {clientX, clientY:clientY+grid}

//TODO
/* corners */          

    default:
      return {clientX, clientY}
  }
}


class FullScreenSVG extends Component {
  constructor(props){
    super(props)
    this.k = 0
    this.path = React.createRef()
    this.svgDraw = React.createRef()
    this.keyStrokes = KeyCodeSum
    this.held = held
  }
  state = {
    clientX: null,
    clientY: null,
    grid: 100,
    showBox: false,
    innerHeight:0, 
    innerWidth: 0,
    polylinePoints: [],
    polylinePointsString:[],
    intervals:8,
    polyline: true,
    blackWhite: "white",
    fill:false,
    animationName: null,
    lazerMode: 2,
    drawing: false,
    showControls:true,
    animating: false,
  }
  move = move

  toggleControls = (stateKey) => {
    this.setState( prev => {
      prev[stateKey] = !prev[stateKey]
      return prev
    })
  }

  selfDraw = (count, previous = 37) => {
    if( this.state.drawing && count <= 600 )
    setTimeout( async () => {
      count++
      const findArrowKey = () =>  Math.floor(Math.random() * Math.floor(4)) + 37;
      let arrowKey = findArrowKey()
      //dont let the direction go back wards
      while( arrowKey !== previous && ((arrowKey - previous) % 2 === 0) ) {
        // console.log( "arrowKey", arrowKey)
        arrowKey = findArrowKey()
      }
      //dont go off the edges
      const { innerHeight, innerWidth, clientX , clientY, grid } = this.state;
      if ( clientX <= 0 + grid  ) arrowKey = 39; //right
      if ( clientX >= innerWidth - grid ) arrowKey = 37; //left
      if ( clientY <= 0 + grid ) arrowKey = 40; //down
      if ( clientY >= innerHeight - grid ) arrowKey = 38; //up
      try {
        this.handleArrowPress({keyCode: arrowKey});
        this.selfDraw(count, arrowKey)
      } catch (error) {
        console.log("skip")
        this.selfDraw(count, arrowKey)
      }
    } , 15 )
    
  }

  downloadSVG = () => downloadSVG(this.svgDraw.current) 

  componentDidMount(){
    
    this.setHW()
    document.addEventListener('keypress', (event) => {
      this.handleKeyPress(event)
    })
    document.addEventListener('keyup', (event) => {
      this.handleArrowPress(event)
    })
    window.addEventListener("resize", (event) => {
      this.setHW()
    })

    window['drawer'] = this
  }
  componentWillUnmount(){

    document.removeEventListener('keypress', (event) => {
      this.handleKeyPress(event)
    })
    document.removeEventListener('keyup', (event) => {
      this.handleArrowPress(event)
    })
    window.removeEventListener("resize", (event) => {
      this.setHW()
    })
  }
  setHW = () => {
    let { innerHeight, innerWidth } = window
    this.setState({ innerHeight, innerWidth })
  }


  handleArrowPress = (event) => {
console.log( '-> press' )
    
    if( event.key === 32) event.altKey && event.preventDefault();

    if(this.state.polylinePoints.length > 0 
      && event.keyCode >=37 
      && event.keyCode <=40 
      ){
      event.altKey && event.preventDefault()

      let { clientX, clientY, grid } = this.state
      let newEvent = this.move(event.keyCode, clientX, clientY, grid)
      
      const dontRepeat = () => {
        // dont repeat //todo
        let clickIt = 0
        const { polylinePoints } = this.state;
        let left, up, right, down;
        let {clientX: x, clientY: y} = newEvent;

        left = move(37, x, y, grid)
        up = move( 38, x, y, grid )
        right = move( 39, x, y, grid )
        down = move( 40, x, y, grid )

        const checkIt = (newEvent, x, y, foo) => {
          // console.log( newEvent, x, y )
          newEvent.used = (newEvent.clientX === x && newEvent.clientY === y)
            ? true
            : false;
          return newEvent.clientX === x && newEvent.clientY === y
        }

        for( let i = 0; /* (clickIt) && */ (i < polylinePoints.length); i=i+2 ) {
          let xP = polylinePoints[i]
          let yP = polylinePoints[i+1]

          
          if ( checkIt(newEvent, xP, yP ) ) {
            // check for a un touched cordinate to move to
            if (!left.used) checkIt( left, xP, yP );
            if (!up.used) checkIt( up, xP, yP );
            if (!right.used) checkIt( right, xP, yP );
            if (!down.used) checkIt( down, xP, yP );

            clickIt++
          }
        }
        return clickIt
      }
      const clickIt = dontRepeat()
      clickIt <= 4 
        ? this.handleClick(newEvent)
        : this.pushPoints( newEvent.clientX, newEvent.clientY, this.state.polylinePoints )
      
    }
  }

  handleClick = (event) => {
    let { clientX, clientY } = event
    let points = this.state.polylinePoints
    let current = [clientX, clientY]
    const findIntervals = (start, end) => {
      let interval = (start -end)/ this.state.intervals
      const array = new Array(this.state.intervals+1).fill(0).map( (val, i) => val = start-(i*interval) )
      
      return ({array, interval})
    }

    if(points.length >5){
      let last = [points[points.length-2], points[points.length-1]] 
      let beforeLast = [points[points.length-4], points[points.length-3]] 

     

      const {array:intervalX} = findIntervals(beforeLast[0], last[0])
      const {array:intervalY} = findIntervals(beforeLast[1], last[1])

      const {interval:intervalLenX,array:intervalCurrentX} = findIntervals(last[0], current[0])
      const {interval:intervalLenY,array:intervalCurrentY} = findIntervals(last[1], current[1])
      
console.log({
  intervalX,
  intervalY,
  intervalLenX,
  intervalCurrentX,
  intervalLenY,
  intervalCurrentY,
})
function thread (...args) {
  let pattern = []
  const max = Math.max(...args.map(i => i.length))
  const min = Math.min(...args.map(i => i.length))

  for ( let intervals in args ) {
    console.log(intervals)
    for(let i = 0;i < args[intervals].length-1; i++) {

      pattern.push(args[intervals][i])
    }
  }
  console.log(pattern)

  return pattern
}

      let pattern ;
      let len = intervalCurrentY.length 
      switch (this.state.lazerMode){
        case 0:
          pattern = intervalX.map( (v,i) => [intervalX[i], intervalY[i], clientX, clientY])
          break;
        case 1:
          pattern = []
          for(let i =0; i<intervalX.length-1; i++){
            pattern.push(
              intervalX[i], intervalY[i], 
              intervalCurrentX[i], intervalCurrentY[i], 
              intervalCurrentX[i]-intervalLenX, intervalCurrentY[i]-intervalLenY )
          }
          break;
      case 2: /* thickness */
          pattern = []/* thread(
            intervalX,
            intervalY,
            intervalCurrentX,
            intervalCurrentY,
          ) */
          for(let i =0; i<intervalX.length-1; i++){
            pattern.push(
              intervalX[i], intervalY[i], 
              // intervalCurrentX[i], intervalCurrentY[i], 
              intervalCurrentX[i]-intervalLenX*window['onbeat'], intervalCurrentY[i]-intervalLenY*window['onbeat'] )
          }
          break;
          
          // for(let i =0; i<intervalX.length-1; i++){
          //   pattern.push(
          //     intervalX[i], intervalY[i],
          //     intervalCurrentX[i], intervalCurrentY[i], 
          //     intervalCurrentX[i]-intervalLenX, intervalCurrentY[i]-intervalLenY
          //   )
          // }
    break;
    case 2: /* thickness */
            pattern = []/* thread(
              intervalX,
              intervalY,
              intervalCurrentX,
              intervalCurrentY,
            ) */
            for(let i =0; i<intervalX.length-1; i++){
              pattern.push(
                intervalX[i], intervalY[i], 
                intervalCurrentX[i], intervalCurrentY[i], 
                intervalCurrentX[i]-intervalLenX*window['onbeat'], intervalCurrentY[i]-intervalLenY*window['onbeat'] )
            }
            break;
            
            // for(let i =0; i<intervalX.length-1; i++){
            //   pattern.push(
            //     intervalX[i], intervalY[i],
            //     intervalCurrentX[i], intervalCurrentY[i], 
            //     intervalCurrentX[i]-intervalLenX, intervalCurrentY[i]-intervalLenY
            //   )
            // }
      break;
      case 2: /* thickness */
            pattern = []
            for(let i =0; i<intervalX.length-1; i++){
              pattern.push(
                intervalX[i], intervalY[i],
                intervalCurrentX[i], intervalCurrentY[i], 
                // intervalCurrentX[i]-intervalLenX, intervalCurrentY[i]-intervalLenY
              )
            }
      break;
      case 2:/* a even more freehand*/
        pattern = []
        for(let i =0; i<intervalX.length-1; i++){
          pattern.push(
            intervalX[len-1-i], intervalY[len-1-i], 
            intervalX[i], intervalY[i], 
            intervalCurrentX[i]+intervalLenX, intervalCurrentY[i]+intervalLenY )
            // intervalCurrentX[i], intervalCurrentY[i], 
        }
      break;
      case 2:/* a little more freehand*/
          pattern = []
          for(let i =0; i<intervalX.length-1; i++){
            pattern.push(
              intervalX[i], intervalY[i], 
              intervalX[len-1-i], intervalY[len-1-i], 
              // intervalCurrentX[i], intervalCurrentY[i], 
              intervalCurrentX[i]+intervalLenX, intervalCurrentY[i]+intervalLenY )
          }
          break;
       case 2:/* a little freehand*/
          pattern = []
          for(let i =0; i<intervalX.length-1; i++){
            pattern.push(
              intervalX[i], intervalY[i], 
              intervalCurrentX[i], intervalCurrentY[i], 
              intervalCurrentX[i]+intervalLenX, intervalCurrentY[i]-intervalLenY )
          }
          break;
        case 2:
          pattern = []
          for(let i = 0; i<intervalX.length-1; i++){
            pattern.push(
              intervalX[len-1-i], intervalY[len-1-i], 
              intervalCurrentX[i], intervalCurrentY[i],
              intervalCurrentX[i+1], intervalCurrentY[i+1]
            )
          }
          break
        case 3:
          pattern = intervalX.map( (v,i) => [
            intervalX[i], intervalY[i], 
            intervalCurrentX[len-1-i], intervalCurrentY[len-1-i] ])
          break;
        case 4:
          pattern = intervalX.map( (v,i) => [ clientX, clientY])
          break;
        default:
          pattern = intervalX.map( (v,i) => [ clientX, clientY])
          this.setState({lazerMode: 0})
          break;
      }
     /*  if(this.state.lazerMode){
        pattern = intervalX.map( (v,i) => [intervalX[i], intervalY[i] ,clientX, clientY ]  )
      }else{
        pattern = []
        for(let i =0; i<intervalX.length-1; i++){
          pattern.push(
            intervalX[i], intervalY[i], 
            intervalCurrentX[i], intervalCurrentY[i], 
            intervalCurrentX[i]-intervalLenX, intervalCurrentY[i]-intervalLenY )
        }
      } */
      let flat = [].concat.apply([], pattern)
      let { polylinePointsString } = this.state
      polylinePointsString.push(flat)
      this.setState({ polylinePointsString })
    }

    this.pushPoints( clientX, clientY, this.state.polylinePoints )
    // points.push(clientX, clientY)
    // this.setState({ clientX, clientY, polylinePoints:points })
  }

  pushPoints = (clientX, clientY, points) => {
    points.push(clientX, clientY)
    this.setState({ clientX, clientY, polylinePoints:points })
  }

  stringArt = (x, m, c)=>{
    let y = m * x + c
  }

  getPathLength = () => {
    let { animating } = this.state;
    this.setState({ animating: !animating }, () =>{ 
      if (!animating) {
        return
      }
    })
    
    let length = this.path.current.getTotalLength()
    
    let styleSheet = document.styleSheets[0];
    let animationName = `draw`;
    let keyframes =
    `@-webkit-keyframes ${animationName} {
       from{
        stroke-dashoffset: ${0/* length */};
       }
       to {
        stroke-dashoffset: ${length};
       }
    }`;
    styleSheet.insertRule(keyframes, styleSheet.cssRules.length);

    this.setState({ animationName, pathLength: length })
    let styleSheet2 = document.styleSheets[0];
    // console.log("getPathLength", styleSheet, styleSheet2)
  }

  handleKeyPress = (event) => {
    // console.log("event.key ",event.key)
    let intervals  = parseInt(event.key)
    event.key === "p" && this.setState({ polyline: !this.state.polyline })
    event.key === "f" && this.setState({ fill: !this.state.fill })
    event.key === "b" && this.setState((prev)=> ({
      blackWhite: prev.blackWhite === "black"
        ?"white"
        :"black"
      }))
    event.key === "a" && this.getPathLength()
    event.key === "m" && this.setState((prev) => (
      prev.lazerMode === 4
        ? {lazerMode: 0}
        : {lazerMode: prev.lazerMode+1}
    ))
    event.key === "-" && this.setState({ grid: this.state.grid-50 })
    event.key === "=" && this.setState({ grid: this.state.grid+50 }) 
    event.key === "g" && this.setState({ showBox: !this.state.showBox })
    let allow = [1,2,3,4,5,6,7,8,9]
    allow.includes(intervals) && this.setState({ intervals })
  }

  render (){
    let { pathLength, animationName, fill, blackWhite, polyline, innerHeight, innerWidth, polylinePoints ,polylinePointsString, animating, 
    grid, showBox, clientX, clientY 
    } = this.state
    // let pathLength = this.findPathLength()
    let fillColor = fill ? '#111':'none'
    let drawPath = animating
      ?{
        strokeDasharray: pathLength,
        strokeDashoffset: pathLength,
        animation: `${animationName} 4s ease-out alternate infinite`,
        fill:fillColor, stroke:blackWhite, strokeWidth:2
      }:{fill:fillColor, stroke:blackWhite, strokeWidth:2}


    return( 
      <div style={{ position: 'relative' }}> 
        <div onClick={this.handleClick} >
          <svg key={this.k++} ref={this.svgDraw}
          style={{backgroundColor:'#222', width:'100%', height:'100%'}} 
          viewBox={`0 0 ${innerWidth} ${innerHeight-30}`} >
            {/* <polyline points={polylinePoints}
            style={{fill:"none",stroke:blackWhite,strokeWidth:3}} /> */}
            {polyline
              ?<polyline id="drawPolyline" style={drawPath} points={polylinePointsString} ref={this.path} />
              :<polygon points={polylinePointsString}
              style={{fill:fillColor, stroke:blackWhite, strokeWidth:2, fillRule:'evenodd'}} />
          }
          {clientX && showBox && <rect x={clientX-grid} y={clientY-grid} width={grid*2} height={grid*2} style={{fill:'none',stroke:'#ccc'}}/>}
          </svg>
          <div style={{position: 'fixed', width:92, bottom:0, right:75, color: blackWhite, textAlign:"left", fontSize:'0.9em'}} >
            <table>
              <thead>
               
              </thead>
              <tbody>
              {Object.keys(this.state).map(((key, i) => {
                let value = key.includes('polylinePoint') ? this.state[key].length : this.state[key]
                return (
                  <tr key={`${key}_${i}`} >
                    <td>{key}</td>
                    <td>{value}</td>
                  </tr>
                )}
              ))}
              </tbody>  
            </table>

          </div>
          <ControlTable 
            toggleControls={this.toggleControls}
            showControls={this.state.showControls}
          />
        </div>
        <div style={{ position: 'absolute' }} >
          <button 
            onClick={() =>{
            this.setState({drawing: !this.state.drawing}
            , () => this.selfDraw(0)
            )}}
          >
            {this.state.drawing ? "stop drawing" : "draw"} something random
          </button>
          <button onClick={this.downloadSVG}>
            Download SVG
          </button>
        </div>
      </div>
    )
  }
}
const controls = {
  mode:"m",
  direction:"arrows",
  click:"left click",
  intervals:"1-9",
  smaller_grid:"-",
  larger_grid:"=",
  show_grid:"g",
  black_white:"b",
  fill:"f",
  polygon_polyline:"p",
  spaz_out:"a",
}

const ControlTable = ({toggleControls, showControls}, hide=true) => {
  return(
    <div style={{display: hide? 'none' : 'block', position: 'fixed', width:50, bottom:10, left:75, textAlign:"left", fontSize:'0.9em'}}>
      <table  >
        <thead onClick={()=>toggleControls("showControls")} >
          <tr><th>Control</th><th>Key</th></tr>
        </thead>
        <tbody>
          {
            showControls && Object.keys(controls).map( control =>
              <tr key={control} ><td>{control}</td><td>{controls[control]}</td></tr>
            )
          }
        </tbody>
      </table>
     {/*  
      <div style={{
        position:"absolute",left:-24,top:'50%',bottom:'50%', 
        width:0, height:0,
        borderTop: '10px solid transparent', 
        borderBottom: '10px solid transparent',
        borderRight: '20px solid blue',
      }}>
      </div> 
    */}
    </div>
  )
}

export default FullScreenSVG