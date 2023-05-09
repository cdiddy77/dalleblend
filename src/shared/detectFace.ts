import React from "react";
import {
  type FaceLandmarksDetector,
  type FaceLandmarksDetectorInput,
  type Face,
} from "@tensorflow-models/face-landmarks-detection";
import { Contours, isExecutingOnClient } from "./types";

export function useDetectFace() {
  const detector = React.useRef<FaceLandmarksDetector>();

  const [contours, setContours] = React.useState<Contours | null>(null);
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
  return { detectFace, contours };
}
