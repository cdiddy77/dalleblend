import Head from "next/head";
import React from "react";
import styles from "../index.module.css";
import "@mediapipe/face_detection";
import "@tensorflow/tfjs-core";
// Register WebGL backend.
import "@tensorflow/tfjs-backend-webgl";
// import * as faceLandmarksDetection from "@tensorflow-models/face-landmarks-detection";

import {
  type FaceLandmarksDetector,
  type FaceLandmarksDetectorInput,
  type Face,
} from "@tensorflow-models/face-landmarks-detection";
import { UV_COORDS, drawResults } from "@/shared/util";
import { usePanZoomCanvas } from "@/shared/usePanZoomCanvas";

function isExecutingOnClient() {
  return typeof window !== "undefined";
}

export default function Paste() {
  const detector = React.useRef<FaceLandmarksDetector>();
  const [contours, setContours] = React.useState<{
    [label: string]: number[];
  } | null>(null);
  React.useEffect(() => {
    if (!isExecutingOnClient()) return;
    (async () => {
      console.log("import faceMesh");
      const faceMesh = await import("@mediapipe/face_mesh");
      console.log("import faceLandmarksDetection");
      const faceLandmarksDetection = await import(
        "@tensorflow-models/face-landmarks-detection"
      );
      setContours(
        faceLandmarksDetection.util.getKeypointIndexByContour(
          faceLandmarksDetection.SupportedModels.MediaPipeFaceMesh
        )
      );

      console.log("createDetector");
      detector.current = await faceLandmarksDetection.createDetector(
        faceLandmarksDetection.SupportedModels.MediaPipeFaceMesh,
        {
          runtime: "tfjs",
          refineLandmarks: true,
          maxFaces: 1,
          // solutionPath: `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh@${faceMesh.VERSION}`,
        }
      );
      console.log("done all createDetector");
    })();
  }, []);

  const detectFace = React.useCallback(
    async (input: FaceLandmarksDetectorInput) => {
      if (detector.current) {
        const result = await detector.current.estimateFaces(input);
        console.log("result", result.length);
        return result;
      }
    },
    []
  );
  const [drawData, setDrawData] = React.useState<{
    img: HTMLImageElement | null;
    faces: Face[];
  }>({ img: null, faces: [] });

  const drawPasteContent = React.useCallback(
    (ctx: CanvasRenderingContext2D) => {
      const { img, faces } = drawData;
      if (!img) return;
      ctx.drawImage(img, 0, 0);
      if (faces && faces.length > 0) {
        console.log("drawPasteContent sample", faces[0].keypoints.slice(0, 4));
        drawResults(ctx, faces, contours || {}, true, true);
      } else {
        ctx.fillStyle = "red";
        ctx.font = "30px Arial";
        ctx.fillText("No face detected", 50, 50);
      }
    },
    [contours, drawData]
  );
  const stretchFace: Face = React.useMemo(
    () => ({
      keypoints: UV_COORDS.map(([x, y]) => ({ x: x * 1024, y: y * 1024 })),
      box: {
        xMin: 0,
        xMax: 1024,
        yMin: 0,
        yMax: 1024,
        width: 1024,
        height: 1024,
      },
    }),
    []
  );
  const drawStretchContent = React.useCallback(
    (ctx: CanvasRenderingContext2D) => {
      ctx.fillStyle = "black";
      ctx.fillRect(0, 0, 1024, 1024);
      drawResults(ctx, [stretchFace], contours || {}, true, true);
    },
    [contours, stretchFace]
  );
  const pasteCanvas = usePanZoomCanvas(drawPasteContent);
  const stretchCanvas = usePanZoomCanvas(drawStretchContent);

  const handlePaste = React.useCallback(
    (e: ClipboardEvent) => {
      const items = e.clipboardData?.items;
      if (!items) return;

      for (const item of items) {
        if (item.type.indexOf("image") !== -1) {
          console.log("found an image. Proceeding");
          const blob = item.getAsFile();
          if (!blob || !pasteCanvas.canvasRef.current) return;

          const img = new Image();
          img.src = URL.createObjectURL(blob);

          img.onload = async () => {
            if (!pasteCanvas.canvasRef.current) return;
            pasteCanvas.canvasRef.current.width = img.width;
            pasteCanvas.canvasRef.current.height = img.height;
            const faces = await detectFace(img);
            setDrawData({ img, faces: faces || [] });
            pasteCanvas.zoomToFit(400, 400);
            stretchCanvas.zoomToFit(400, 400);
          };
        }
      }
    },
    [detectFace, pasteCanvas, stretchCanvas]
  );

  React.useEffect(() => {
    window.addEventListener("paste", handlePaste);
    return () => {
      window.removeEventListener("paste", handlePaste);
    };
  }, [handlePaste]);
  return (
    <div>
      <Head>
        <title>Face mapper</title>
      </Head>

      <main className={styles.main} style={{ height: "100vh", width: "100vw" }}>
        <h3>Generate Image</h3>
        <div className={styles.row}>Paste image</div>
        <div
          className={styles.row}
          style={{
            // flex: 1,
            padding: 20,
            margin: 20,
            justifyContent: "space-evenly",
            alignSelf: "stretch",
            border: "1px solid grey",
          }}
        >
          <div
            style={{
              width: 400,
              height: 400,
              overflow: "hidden",
              background: "#151515",
            }}
          >
            <canvas ref={pasteCanvas.canvasRef} width={400} height={400} />
          </div>
          <div
            style={{
              width: 400,
              height: 400,
              overflow: "hidden",
              background: "#151515",
            }}
          >
            <canvas ref={stretchCanvas.canvasRef} width={1024} height={1024} />
          </div>
        </div>
      </main>
    </div>
  );
}
