import React from "react";

interface Props {
  url: string;
}
const CanvasWithImage: React.FC<Props> = ({ url }) => {
  const canvasRef = React.useRef<HTMLCanvasElement>(null);
  console.log("url", url);
  React.useEffect(() => {
    console.log("rendering canvas");
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) {
      return;
    }

    if (url) {
      const img = new Image();
      img.onload = () => {
        ctx.drawImage(img, 0, 0, 400, 400);
      };
      img.src = url;
    }
  }, [url]);

  return (
    <div>
      <canvas ref={canvasRef} width="400" height="400"></canvas>
    </div>
  );
};
export default CanvasWithImage;
