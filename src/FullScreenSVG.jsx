import React, { Component } from 'react'

class FullScreenSVG extends Component {
  constructor(props){
    super(props)
    this.k = 0
    this.path = React.createRef()
  }
  state = {
    clientX: null,
    clientY: null,
    grid: 100,
    showBox: true,
    innerHeight:0, 
    innerWidth: 0,
    polylinePoints: [],
    polylinePointsString:[],
    intervals:8,
    polyline: true,
    blackWhite: "white",
    fill:false,
    animationName: null,
    lazerMode: 0
  }

  componentDidMount(){
    let { innerHeight, innerWidth } = window
    this.setState({ innerHeight, innerWidth })
    document.addEventListener('keypress', (event) => {
      this.handleKeyPress(event)
    })
    document.addEventListener('keydown', (event) => {
      this.handleArrowPress(event)
    })
  }
  componentWillUnmount(){
    document.removeEventListener('keypress', (event) => {
      this.handleKeyPress(event)
    })
    document.removeEventListener('keydown', (event) => {
      this.handleArrowPress(event)
    })

  }
  handleArrowPress = (event) => {
    if( event.key === 32) event.preventDefault();
    if(this.state.polylinePoints.length > 0 
      && event.keyCode >=37 
      && event.keyCode <=40 
      ){
      event.preventDefault()
      let { clientX, clientY, grid } = this.state
      let newEvent = {}
      switch(event.keyCode) {
        case 37://left
          newEvent = {clientX:clientX-grid, clientY}
          break;
        case 38://up
          newEvent = {clientX, clientY:clientY-grid}
          break;
        case 39://right
          newEvent = {clientX:clientX+grid, clientY}
          break;
        case 40://down
          newEvent = {clientX, clientY:clientY+grid}
          break;
        default:
          return
      }
      console.log(newEvent)
      this.handleClick(newEvent)
      /*  {left: 37,
        up: 38,
        right: 39,
        down: 40,} */
    }
  }

  handleClick = (event) => {
    let { clientX, clientY } = event
    let points = this.state.polylinePoints
    let current = [clientX, clientY]
    if(points.length >5){
      let last = [points[points.length-2], points[points.length-1]] 
      let beforeLast = [points[points.length-4], points[points.length-3]] 

      const findIntervals = (start, end) => {
        let interval = (start -end)/ this.state.intervals
        const array = new Array(this.state.intervals+1).fill(0).map( (val, i) => val = start-(i*interval) )
          return ({array, interval})
        }

      const {array:intervalX} = findIntervals(beforeLast[0], last[0])
      const {array:intervalY} = findIntervals(beforeLast[1], last[1])
      const {interval:intervalLenX,array:intervalCurrentX} = findIntervals(last[0], current[0])
      const {interval:intervalLenY,array:intervalCurrentY} = findIntervals(last[1], current[1])
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

    points.push(clientX, clientY)
    this.setState({ clientX, clientY, polylinePoints:points })
  }

  stringArt = (x, m, c)=>{
    let y = m * x + c
  }

  getPathLength = () => {
    const path = document.getElementById('drawPolyline')
    const length = path.getTotalLength()
    
    let styleSheet = document.styleSheets[0];
    let animationName = `draw`;
    let keyframes =
    `@-webkit-keyframes ${animationName} {
       to{
        stroke-dashoffset: ${length};
       }
    }`;
    styleSheet.insertRule(keyframes, styleSheet.cssRules.length);

    this.setState({ animationName, pathLength: length })
    let styleSheet2 = document.styleSheets[0];
    console.log("getPathLength", styleSheet, styleSheet2)
  }

  handleKeyPress = (event) => {
    console.log("event.key ",event.key)
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
    let { pathLength, animationName, fill, blackWhite, polyline, innerHeight, innerWidth, polylinePoints ,polylinePointsString,
    grid, showBox, clientX, clientY } = this.state
    let fillColor = fill ? '#111':'none'
    let drawPath = animationName
      ?{
        strokeDasharray: 1000,
        animation: `${animationName} 2s linear`,
        fill:fillColor, stroke:blackWhite, strokeWidth:2
      }:{fill:fillColor, stroke:blackWhite, strokeWidth:2}

    return( 
      <div onClick={this.handleClick} > 
        <svg key={this.k++} 
        style={{backgroundColor:'#222', width:'100%', height:'100%'}} 
        viewBox={`0 0 ${innerWidth} ${innerHeight}`} >
          <polyline points={polylinePoints}
          style={{fill:"none",stroke:blackWhite,strokeWidth:3}} />
          {polyline
            ?<polyline id="drawPolyline" style={drawPath} points={polylinePointsString} ref={this.path} />
            :<polygon points={polylinePointsString}
            style={{fill:fillColor, stroke:blackWhite, strokeWidth:2, fillRule:'evenodd'}} />
        }
        {clientX && showBox && <rect x={clientX-grid} y={clientY-grid} width={grid*2} height={grid*2} style={{fill:'none',stroke:'#ccc'}}/>}
        </svg>
        <div style={{position: 'fixed', width:50, bottom:0, right:75, color: blackWhite, textAlign:"left", fontSize:'0.6em'}} >
          <table>
            <tbody>
            {Object.keys(this.state).map((key => (
              <tr>
                <td>{key}</td>
                <td>{this.state[key]}</td>
              </tr>
            )))}
            </tbody>  
          </table>

        </div>
      </div>
    )
  }
}

export default FullScreenSVG