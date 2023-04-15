import React, { useRef, useState, MouseEvent, WheelEvent } from "react";

interface ZoomableCanvasProps {
  width: number;
  height: number;
  children: React.ReactNode;
}

const ZoomableSvg: React.FC<ZoomableCanvasProps> = ({
  width,
  height,
  children,
}) => {
  const [viewBox, setViewBox] = useState({ x: 0, y: 0, width, height });
  const [isPanning, setIsPanning] = useState(false);
  const [startPanPoint, setStartPanPoint] = useState({ x: 0, y: 0 });

  const svgRef = useRef<SVGSVGElement>(null);

  const handleMouseDown = (e: MouseEvent) => {
    if (e.button !== 0) return;
    setIsPanning(true);
    setStartPanPoint({ x: e.clientX, y: e.clientY });
  };

  const handleMouseUp = () => {
    setIsPanning(false);
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (!isPanning) return;

    const dx = (e.clientX - startPanPoint.x) / (viewBox.width / width);
    const dy = (e.clientY - startPanPoint.y) / (viewBox.height / height);

    setViewBox((prevViewBox) => ({
      ...prevViewBox,
      x: prevViewBox.x - dx,
      y: prevViewBox.y - dy,
    }));

    setStartPanPoint({ x: e.clientX, y: e.clientY });
  };

  const handleWheel = (e: WheelEvent) => {
    e.stopPropagation();
    const scaleFactor = e.deltaY < 0 ? 1.1 : 0.9;

    const rect = svgRef.current?.getBoundingClientRect();
    if (!rect) return;

    const offsetX = e.clientX - rect.left;
    const offsetY = e.clientY - rect.top;

    const dx = (offsetX / width) * viewBox.width;
    const dy = (offsetY / height) * viewBox.height;

    const newWidth = viewBox.width * scaleFactor;
    const newHeight = viewBox.height * scaleFactor;

    setViewBox({
      x: viewBox.x + dx * (1 - scaleFactor),
      y: viewBox.y + dy * (1 - scaleFactor),
      width: newWidth,
      height: newHeight,
    });
  };

  return (
    <svg
      ref={svgRef}
      width={width}
      height={height}
      viewBox={`${viewBox.x} ${viewBox.y} ${viewBox.width} ${viewBox.height}`}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      onMouseMove={handleMouseMove}
      onWheel={handleWheel}
      style={{ cursor: isPanning ? "grabbing" : "grab" }}
    >
      {children}
    </svg>
  );
};

export default ZoomableSvg;
