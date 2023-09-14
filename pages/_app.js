import React from "react";
import "@/styles/globals.css";
import "@/styles/app.css";
import "@/styles/simulator.css";
import Head from "next/head";
import { Simulator } from "components/Simulator";

const App = () => {
  return (
    <div className="app">
      <Head>
        <title>MDP Algorithm Simulator</title>
      </Head>
      <Simulator />
    </div>
  );
};

export default App;
