import React, { useState } from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./App";
import StarComponent from "./StarComponent";

// function Test() {
//   const [testRaiting, setTestRaiting] = useState(0);
//   return (
//     <>
//       <StarComponent starsNum={7} onSetTestRaiting={setTestRaiting} />
//       <span>{testRaiting}</span>
//     </>
//   );
// }
const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// // If you want to start measuring performance in your app, pass a function
// // to log results (for example: reportWebVitals(console.log))
// // or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
// reportWebVitals();
