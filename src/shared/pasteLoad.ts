import React from "react";
import { useDetectFace } from "./detectFace";
import { SourceImageData } from "./types";

export function usePasteLoad(
  detectFace: ReturnType<typeof useDetectFace>["detectFace"]
) {
  const [sourceData, setSourceData] = React.useState<SourceImageData>({
    img: null,
    imgData: null,
    faces: [],
  });
  const setPastedImage = React.useCallback(
    (blob: File | Blob) => {
      const img = new Image();
      img.src = URL.createObjectURL(blob);

      img.onload = async () => {
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

          setSourceData({
            img,
            imgData,
            faces: faces || [],
          });
        } else {
          setSourceData({
            img,
            imgData: null,
            faces: faces || [],
          });
        }
      };
    },
    [detectFace]
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
      if (!items) {
        console.log("no items");
        return;
      }

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
  React.useEffect(() => {
    window.addEventListener("paste", handlePaste);
    return () => {
      window.removeEventListener("paste", handlePaste);
    };
  }, [handlePaste]);

  return { doPaste, sourceData };
}
