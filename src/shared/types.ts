import {
  type Face,
  type Keypoint,
} from "@tensorflow-models/face-landmarks-detection";

export type Meshpoint = DOMPointInit; // we don't need the z axis
export type Meshrect = DOMRect;
export type MeshpointIndex = number;
export interface Contours {
  [label: string]: number[];
}

export type FacemeshEditTools = {
  anchoredNet: {
    anchorPoint: MeshpointIndex;
  };
  pointMove: {
    selected: MeshpointIndex[];
    selectionDragRect?: Meshrect;
  };
};

export interface SourceImageData {
  img: HTMLImageElement | null;
  imgData: ImageData | null;
  faces: Face[];
}

export function isExecutingOnClient() {
  return typeof window !== "undefined";
}
