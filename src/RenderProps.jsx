import React, { Component, Fragment } from 'react'

export default class RenderProps extends Component {
  state = {
    one: 1, 
    two: 2,
  }
  render() {
    return (
      <Fragment>
        <h1>RenderProps</h1>
        {this.props.render(this.state)}
      </Fragment>
    )
  }
}
