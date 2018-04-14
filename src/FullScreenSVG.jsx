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
    innerHeight:0, 
    innerWidth: 0,
    polylinePoints: [],
    polylinePointsString:[],
    intervals:4,
    polyline: true,
    blackWhite: "white",
    fill:false,
    animationName: null,
  }

  componentDidMount(){
    let { innerHeight, innerWidth } = window
    this.setState({ innerHeight, innerWidth })
    document.addEventListener('keypress', (event) => {
      this.handleKeyPress(event)
    })
  }
  componentWillUnmount(){
    document.removeEventListener('keypress', (event) => {
      this.handleKeyPress(event)
    })

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
      return array
    }

    const intervalX = findIntervals(beforeLast[0], last[0])
    const intervalY = findIntervals(beforeLast[1], last[1])
    const intervalCurrentX = findIntervals(last[0], current[0])
    const intervalCurrentY = findIntervals(last[1], current[1])
    
    let pattern = intervalX.map( (v,i) => [intervalX[i], intervalY[i], clientX, clientY ]  )
    // let pattern = intervalX.map( (v,i) => [intervalX[i], intervalY[i], intervalCurrentX[i], intervalCurrentY[i] ]  )
    
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
    let intervals  = parseInt(event.key)
    event.key === "p" && this.setState({ polyline: !this.state.polyline })
    event.key === "f" && this.setState({ fill: !this.state.fill })
    event.key === "b" && this.setState((prev)=> ({
      blackWhite: prev.blackWhite === "black"
        ?"white"
        :"black"
      }))
    event.key === "a" && this.getPathLength()
    let allow = [1,2,3,4,5,6,7,8,9]
    allow.includes(intervals) && this.setState({ intervals })
  }

  render (){
    let { pathLength, animationName, fill, blackWhite, polyline, innerHeight, innerWidth, polylinePoints ,polylinePointsString } = this.state
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
        style={{backgroundColor:'#222'}} 
        viewBox={`0 0 ${innerWidth} ${innerHeight}`} >
          <polyline points={polylinePoints}
          style={{fill:"none",stroke:blackWhite,strokeWidth:3}} />
          {polyline
            ?<polyline id="drawPolyline" style={drawPath} points={polylinePointsString} ref={this.path} />
            :<polygon points={polylinePointsString}
            style={{fill:fillColor, stroke:blackWhite, strokeWidth:2, fillRule:'evenodd'}} />
        }
        </svg>
      </div>
    )
  }
}

export default FullScreenSVG