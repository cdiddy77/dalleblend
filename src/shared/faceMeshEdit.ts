import React from "react";
import { useDetectFace } from "./detectFace";
import { Contours, SourceImageData } from "./types";
import { usePanZoomCanvas } from "./usePanZoomCanvas";
import { drawResults } from "./drawUtil";

export interface FacemeshEditState {}

export function useFaceMeshEdit(
  sourceData: SourceImageData,
  contours: Contours | null
) {
  const drawImageAndMesh = React.useCallback(
    (ctx: CanvasRenderingContext2D) => {
      const { img, faces } = sourceData;
      if (!img) return;
      ctx.drawImage(img, 0, 0);
      if (faces && faces.length > 0) {
        drawResults(ctx, faces, contours || {}, true, true);
      } else {
        ctx.fillStyle = "red";
        ctx.font = "30px Arial";
        ctx.fillText("No face detected", 50, 50);
      }
    },
    [contours, sourceData]
  );
  const { canvasRef, zoomToFit } = usePanZoomCanvas(drawImageAndMesh);

  React.useEffect(() => {
    if (sourceData.img !== null && canvasRef.current) {
      canvasRef.current.width = sourceData.img.width;
      canvasRef.current.height = sourceData.img.height;
      //
      // and zoomtofit
      zoomToFit(400, 400);
    }
  }, [canvasRef, sourceData.img, zoomToFit]);

  return {
    canvasRef,
    // TODO : this will be for realz
    editPoints: sourceData.faces[0]?.keypoints || [],
  };
}
