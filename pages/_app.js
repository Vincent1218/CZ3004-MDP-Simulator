import "@/styles/globals.css";
import "@/styles/app.css";
import Head from "next/head";
import { Simulator } from "components/Simulator";

export default function App({ Component, pageProps }) {
  return (
    <div className="Background">
      <Head>
        <title>MDP Algorithm Simulator</title>
      </Head>
      <Simulator />
    </div>
  );
}
