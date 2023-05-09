import Head from "next/head";
import React from "react";
import styles from "../index.module.css";
import "@mediapipe/face_detection";
import "@tensorflow/tfjs-core";
// Register WebGL backend.
import "@tensorflow/tfjs-backend-webgl";
import { FaMagic, FaDownload, FaPaste } from "react-icons/fa";
// import * as faceLandmarksDetection from "@tensorflow-models/face-landmarks-detection";

import {
  type FaceLandmarksDetector,
  type FaceLandmarksDetectorInput,
  type Face,
} from "@tensorflow-models/face-landmarks-detection";
import {
  UV_COORDS,
  drawResults,
  createStretchedImage,
} from "@/shared/drawUtil";
import { usePanZoomCanvas } from "@/shared/usePanZoomCanvas";
import { SourceImageData, isExecutingOnClient } from "@/shared/types";
import { useDetectFace } from "@/shared/detectFace";

export default function Paste() {
  const { detectFace, contours } = useDetectFace();
  const [outputCanvas, setOutputCanvas] =
    React.useState<HTMLCanvasElement | null>(null);
  const [drawData, setDrawData] = React.useState<SourceImageData>({
    img: null,
    imgData: null,
    faces: [],
  });

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
  const pasteCanvas = usePanZoomCanvas(drawPasteContent);
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
      if (outputCanvas) {
        ctx.drawImage(outputCanvas, 0, 0);
      }
      drawResults(ctx, [stretchFace], contours || {}, true, true);
    },
    [contours, outputCanvas, stretchFace]
  );
  const stretchCanvas = usePanZoomCanvas(drawStretchContent);
  const setPastedImage = React.useCallback(
    (blob: File | Blob) => {
      const img = new Image();
      img.src = URL.createObjectURL(blob);

      img.onload = async () => {
        if (!pasteCanvas.canvasRef.current) return;
        pasteCanvas.canvasRef.current.width = img.width;
        pasteCanvas.canvasRef.current.height = img.height;
        const faces = await detectFace(img);
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");

        // Set canvas size to match the image dimensions
        canvas.width = img.width;
        canvas.height = img.height;
        if (ctx && faces) {
          // Draw the image onto the canvas
          ctx.drawImage(img, 0, 0);

          // Get the raw image data
          const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);

          setDrawData({
            img,
            imgData,
            faces: faces || [],
          });
          setOutputCanvas(null);
        } else {
          setDrawData({
            img,
            imgData: null,
            faces: faces || [],
          });
          setOutputCanvas(null);
        }
        pasteCanvas.zoomToFit(400, 400);
        stretchCanvas.zoomToFit(400, 400);
      };
    },
    [detectFace, pasteCanvas, stretchCanvas]
  );
  const doPaste = React.useCallback(async () => {
    try {
      // const permission = await navigator.permissions.query({
      //   name: "clipboard-read",
      // });
      // if (permission.state === "denied") {
      //   throw new Error("Not allowed to read clipboard.");
      // }
      const clipboardContents = await navigator.clipboard.read();
      for (const item of clipboardContents) {
        if (!item.types.includes("image/png")) {
          throw new Error("Clipboard contains non-image data.");
        }
        const blob = await item.getType("image/png");
        if (!blob) return;
        setPastedImage(blob);
      }
    } catch (e) {
      const error = e as Error;
      console.error(error.message);
    }
  }, [setPastedImage]);

  const handlePaste = React.useCallback(
    (e: ClipboardEvent) => {
      const items = e.clipboardData?.items;
      if (!items) return;

      for (const item of items) {
        if (item.type.indexOf("image") !== -1) {
          console.log("found an image. Proceeding");
          const blob = item.getAsFile();
          if (!blob) return;

          setPastedImage(blob);
        } else {
          console.log("not an image", item.type);
        }
      }
    },
    [setPastedImage]
  );
  const [generating, setGenerating] = React.useState(false);
  const handleGenerate = React.useCallback(async () => {
    if (!drawData.imgData || !drawData.faces || drawData.faces.length === 0) {
      return;
    }
    setGenerating(true);
    const outputCanvas = createStretchedImage(
      drawData.imgData,
      drawData.faces[0].keypoints,
      stretchFace.keypoints
    );
    setGenerating(false);
    setOutputCanvas(outputCanvas);
  }, [drawData, stretchFace]);

  const [saving, setSaving] = React.useState(false);
  const handleSave = React.useCallback(async () => {
    if (!outputCanvas) return;
    setSaving(true);
    const data = outputCanvas.toDataURL("image/png");
    console.log("canvas dims", outputCanvas.width, outputCanvas.height);
    const link = document.createElement("a");
    link.download = "image.png";
    link.href = data;
    link.click();
    setSaving(false);
  }, [outputCanvas]);

  return (
    <div>
      <Head>
        <title>Face mapper</title>
      </Head>

      <div
        className={styles.main}
        style={{ height: "100vh", overflow: "auto" }}
      >
        <h3>Face Mapper</h3>
        <div className={styles.row}>(Paste image to get started)</div>
        <div className={styles.editor}>
          <div className={styles.canvasContainer}>
            <div className={styles.canvasToolbar}>
              <FaPaste
                onClick={doPaste}
                className={styles.toolbarButton}
                size={25}
              />
              <FaMagic
                onClick={handleGenerate}
                className={styles.toolbarButton}
                size={25}
              />
            </div>
            <canvas
              ref={pasteCanvas.canvasRef}
              className={styles.canvasEditor}
            />
          </div>
          {/* <div
            className={styles.column}
            style={{
              alignSelf: "stretch",
              justifyContent: "space-evenly",
            }}
          >
            <button
              style={{ padding: 3 }}
              disabled={generating}
              onClick={handleGenerate}
            >
              {generating ? "Regenerating" : "Regenerate"}
            </button>
            <button
              style={{ padding: 3 }}
              disabled={saving}
              onClick={handleSave}
            >
              {saving ? "Saving" : "Save"}
            </button>
          </div> */}
          <div className={styles.canvasContainer}>
            <div className={styles.canvasToolbar}>
              <FaDownload
                onClick={handleSave}
                className={styles.toolbarButton}
                size={25}
              />
            </div>
            <canvas
              ref={stretchCanvas.canvasRef}
              className={styles.canvasEditor}
              width={1024}
              height={1024}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
