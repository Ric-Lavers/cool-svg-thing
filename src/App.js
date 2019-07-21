import React, { Component } from 'react';
import './App.css';

import FullScreenSVG from './FullScreenSVG'
import RenderProps from './RenderProps'

class App extends Component {
  render() {
    return (
      <div className="App">
          <FullScreenSVG/>
          {/* <RenderProps 
            render={prop => <h2>_{JSON.stringify(prop)}_</h2> }
          /> */}
      </div>
    );
  }
}

export default App;
