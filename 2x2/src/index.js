import React from "react";
import ReactDOM from "react-dom";

import Test from './test'

console.log('i index')

const App = () => (
   <div>
      <h1>Hello world!!</h1>
   </div>
 )
ReactDOM.render(<App/>, document.getElementById("root"));