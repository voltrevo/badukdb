import { React, ReactDOM } from "./deps.ts";

window.addEventListener("load", () => {
  const App = () => <h1>Hello world!</h1>;
  ReactDOM.render(<App />, (globalThis as any).document.body);
});
