import ReactDOM from "react-dom/client";

import App from "./App.tsx";

import "./index.css";

const root = document.getElementById("root");

if (!root) throw new Error("Missing #root element");

ReactDOM.createRoot(root).render(<App />);
