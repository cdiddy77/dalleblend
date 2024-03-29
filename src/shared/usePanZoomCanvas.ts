import React from "react";

interface PanZoomState {
  scale: number;
  panX: number;
  panY: number;
  isPanning: boolean;
  startPanPoint: { x: number; y: number };
}
export const usePanZoomCanvas = (
  drawContentFn: (ctx: CanvasRenderingContext2D) => void
) => {
  const canvasRef = React.useRef<HTMLCanvasElement>(null);
  const [state, setState] = React.useState<PanZoomState>({
    scale: 1,
    panX: 0,
    panY: 0,
    isPanning: false,
    startPanPoint: { x: 0, y: 0 },
  });

  React.useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const { scale, panX, panY } = state;
    ctx.save();
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.setTransform(scale, 0, 0, scale, panX, panY);
    // console.log("drawContent", scale, panX, panY);
    drawContentFn(ctx);
    ctx.restore();
  }, [drawContentFn, state]);

  // console.log("usePanZoomCanvas()", state);
  React.useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      const scaleFactor = e.deltaY < 0 ? 1.1 : 0.9;
      const offsetX = e.clientX - canvas.getBoundingClientRect().left;
      const offsetY = e.clientY - canvas.getBoundingClientRect().top;
      setState((prevState) => {
        return {
          ...prevState,
          scale: prevState.scale * scaleFactor,
          panX: prevState.panX - offsetX * (scaleFactor - 1) * prevState.scale,
          panY: prevState.panY - offsetY * (scaleFactor - 1) * prevState.scale,
        };
      });
    };

    const handleMouseDown = (e: MouseEvent) => {
      e.preventDefault();
      setState((prevState) => {
        return {
          ...prevState,
          isPanning: true,
          startPanPoint: { x: e.clientX, y: e.clientY },
        };
      });
    };

    const handleMouseMove = (e: MouseEvent) => {
      e.preventDefault();
      setState((prevState) => {
        if (!prevState.isPanning) return prevState;
        const { scale, panX, panY, startPanPoint } = prevState;
        return {
          ...prevState,
          panX: panX + (e.clientX - startPanPoint.x),
          panY: panY + (e.clientY - startPanPoint.y),
          startPanPoint: { x: e.clientX, y: e.clientY },
        };
      });
    };

    const handleMouseUp = (e: MouseEvent) => {
      e.preventDefault();
      setState((prevState) => {
        return {
          ...prevState,
          isPanning: false,
        };
      });
    };

    const handleDblClick = (e: MouseEvent) => {
      e.preventDefault();
      setState({
        scale: 1,
        panX: 0,
        panY: 0,
        isPanning: false,
        startPanPoint: { x: 0, y: 0 },
      });
    };

    canvas.addEventListener("wheel", handleWheel);
    canvas.addEventListener("mousedown", handleMouseDown);
    canvas.addEventListener("mousemove", handleMouseMove);
    canvas.addEventListener("mouseup", handleMouseUp);
    canvas.addEventListener("dblclick", handleDblClick);

    return () => {
      canvas.removeEventListener("wheel", handleWheel);
      canvas.removeEventListener("mousedown", handleMouseDown);
      canvas.removeEventListener("mousemove", handleMouseMove);
      canvas.removeEventListener("mouseup", handleMouseUp);
      canvas.removeEventListener("dblclick", handleDblClick);
    };
  }, []);

  const zoomToFit = React.useCallback((width: number, height: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    setState((prevState) => {
      const { scale, panX, panY } = prevState;
      const canvasWidth = canvas.width;
      const canvasHeight = canvas.height;
      const scaleWidth = width / canvasWidth;
      const scaleHeight = height / canvasHeight;
      const newScale = Math.min(scaleWidth, scaleHeight);
      const newPanX = 0; //(canvasWidth - width * newScale) / 2;
      const newPanY = 0; // (canvasHeight - height * newScale) / 2;
      return {
        ...prevState,
        scale: newScale,
        panX: newPanX,
        panY: newPanY,
      };
    });
  }, []);
  return React.useMemo(() => ({ canvasRef, zoomToFit }), [zoomToFit]);
};
