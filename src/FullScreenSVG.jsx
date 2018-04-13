import React, { Component } from 'react'

class FullScreenSVG extends Component {
  constructor(props){
    super(props)
    this.k = 0
  }
  state = {
    clientX: null,
    clientY: null,
    innerHeight:0, 
    innerWidth: 0,
    polylinePoints: [],
    polylinePointsString:[]
  }

  componentDidMount(){
    let { innerHeight, innerWidth } = window
    this.setState({ innerHeight, innerWidth })
  }

  handleClick = (event) => {
    let { clientX, clientY } = event
    let points = this.state.polylinePoints
    let current = [clientX, clientY]

    if(points.length >5){
    let last = [points[points.length-2], points[points.length-1]] 
    let beforeLast = [points[points.length-4], points[points.length-3]] 

    const findIntervals = (start, end) => {
      let interval = (start -end)/ 4
      const array = new Array(5).fill(0).map( (val, i) => val = start-(i*interval) )
      return array
    }

    const intervalX = findIntervals(beforeLast[0], last[0])
    const intervalY = findIntervals(beforeLast[1], last[1])
    
    let pattern = intervalX.map( (v,i) => [intervalX[i], intervalY[i], clientX, clientY ]  )

    let flat = [].concat.apply([], pattern)
    this.setState({ polylinePointsString:flat })
    console.log(flat)
    }

    points.push(clientX, clientY)
    this.setState({ clientX, clientY, polylinePoints:points })
    console.log(  points)
  }
  stringArt = (x, m, c)=>{
    let y = m * x + c


  }

  render (){
    let { innerHeight, innerWidth, polylinePoints ,polylinePointsString } = this.state
    console.log('polylinePoints', polylinePoints )
    return( 
      <div onClick={this.handleClick}>
      {/* this.state.polylinePoints */}
        <svg key={this.k++} viewBox={`0 0 ${innerWidth} ${innerHeight}`} >
          <polyline points={polylinePoints}
          style={{fill:"none",stroke:"black",strokeWidth:3}} />
          <polyline points={polylinePointsString}
          style={{fill:"none",stroke:"black",strokeWidth:3}} />
        </svg>
      </div>
    )
  }
}

export default FullScreenSVG