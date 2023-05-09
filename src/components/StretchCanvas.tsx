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
import React from "react";
import { Contours } from "@/shared/types";
import { FaDownload } from "react-icons/fa";
import { usePanZoomCanvas } from "@/shared/usePanZoomCanvas";
import styles from "../index.module.css";
import { CommandsContext } from "./CommandsContext";

interface Props {
  outputCanvas: HTMLCanvasElement | null;
  contours: Contours | null;
}

export const StretchCanvas: React.FC<Props> = ({ outputCanvas, contours }) => {
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
  const commands = React.useContext(CommandsContext);
  return (
    <div className={styles.canvasContainer}>
      <div className={styles.canvasToolbar}>
        <FaDownload
          onClick={commands.save}
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
  );
};
