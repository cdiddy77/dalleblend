import React from "react";
import { Meshpoint, SourceImageData } from "./types";
import { UV_COORDS, createStretchedImage } from "./drawUtil";

const stretchFace: Meshpoint[] = UV_COORDS.map(([x, y]) => ({
  x: x * 1024,
  y: y * 1024,
}));

export function useGenerateTextureImage(
  imgData: ImageData | null,
  sourceKeypoints: Meshpoint[] | undefined
) {
  const [outputCanvas, setOutputCanvas] =
    React.useState<HTMLCanvasElement | null>(null);
  const [generating, setGenerating] = React.useState(false);
  const handleGenerate = React.useCallback(async () => {
    if (!imgData || !sourceKeypoints) {
      return;
    }
    setGenerating(true);
    const outputCanvas = createStretchedImage(
      imgData,
      sourceKeypoints,
      stretchFace
    );
    setGenerating(false);
    setOutputCanvas(outputCanvas);
  }, [imgData, sourceKeypoints]);

  return { handleGenerate, outputCanvas };
}
