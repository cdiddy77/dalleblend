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
import { FacemeshEditor } from "@/components/FacemeshEditor";
import { StretchCanvas } from "@/components/StretchCanvas";
import { useDetectFace } from "@/shared/detectFace";
import { Commands, CommandsContext, CommandsProvider } from "@/components/CommandsContext";
import { usePasteLoad } from "@/shared/pasteLoad";
import { useFaceMeshEdit } from "@/shared/faceMeshEdit";
import { useGenerateTextureImage } from "@/shared/generate";

/**
 * state:
 *  drawData:
 *    img -- the image we create when user pastes (use to render)
 *    imgData -- the data we use, in combination with the mesh, to create
 *            the stretched image
 *    faces -- recognized faces
 *    outputCanvas -- the rendered stretched image
 * when the user pastes, then we have img, and a bit later we have faces
 * because we got new faces, we replace the editmesh
 *
 * user does some editing of the mesh. They can optionally reset
 * to the recognized mesh.
 */

export default function Index() {
  const { detectFace, contours } = useDetectFace();
  const { doPaste, sourceData } = usePasteLoad(detectFace);
const {canvasRef,editPoints} = useFaceMeshEdit(sourceData,contours);
const {handleGenerate,outputCanvas} = useGenerateTextureImage(sourceData.imgData,editPoints)
const commandImpls:Commands = {
  paste:doPaste,
  generate:handleGenerate,
  save:
}

  return (
    <CommandsContext.Provider>
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
            <FacemeshEditor canvasRef={canvasRef}/>
            <StretchCanvas outputCanvas={null} contours={contours} />
          </div>
        </div>
      </div>
    </CommandsContext.Provider>
  );
}
