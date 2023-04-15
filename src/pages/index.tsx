import Head from "next/head";
import { useState } from "react";
import styles from "../index.module.css";
import CanvasWithImage from "@/components/CanvasWithImage";
import { ImagesResponse } from "openai";

export default function Home() {
  const [result, setResult] = useState<ImagesResponse>();
  const [prompt, setPrompt] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);

  const onSubmit: React.FormEventHandler<HTMLFormElement> = async (event) => {
    event.preventDefault();
    try {
      console.log("prompt", prompt);
      setLoading(true);
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ prompt }),
      });

      const data = await response.json();
      setLoading(false);
      if (response.status !== 200) {
        throw (
          data.error ||
          new Error(`Request failed with status ${response.status}`)
        );
      }
      console.log(JSON.stringify(data));

      setResult(data.result);
      setPrompt("");
    } catch (e) {
      const error = e as Error;
      // Consider implementing your own error handling logic here
      console.error(error);
      alert(error.message);
    }
  };

  return (
    <div>
      <Head>
        <title>Dalleblend</title>
      </Head>

      <main className={styles.main}>
        <h3>Generate Image</h3>
        <form onSubmit={onSubmit}>
          <div className={styles.row}>
            <input
              type="text"
              name="animal"
              placeholder="enter an image prompt"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
            />
            <input
              type="submit"
              value={loading ? "..." : "GO"}
              disabled={loading}
            />
          </div>
        </form>
        {result?.data[0]?.url && <CanvasWithImage url={result.data[0].url} />}
      </main>
    </div>
  );
}
