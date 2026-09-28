import { useEffect, useState } from "react";
import { api } from "./lib/api";
import "./App.css";

function App() {
  const [apiStatus, setApiStatus] = useState<"checking" | "ok" | "error">(
    "checking",
  );

  useEffect(() => {
    api
      .get("/health")
      .then(() => setApiStatus("ok"))
      .catch(() => setApiStatus("error"));
  }, []);

  return (
    <section id="center">
      <h1>Okie Pet</h1>
      <p>Pet supplies, coming soon.</p>
      <p>
        Backend API:{" "}
        {apiStatus === "checking" && "checking..."}
        {apiStatus === "ok" && "✅ connected"}
        {apiStatus === "error" && "❌ not reachable (is uvicorn running?)"}
      </p>
    </section>
  );
}

export default App;
