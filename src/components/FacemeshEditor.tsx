import React from "react";
import styles from "../index.module.css";
import { FaMagic, FaPaste } from "react-icons/fa";
import { CommandsContext } from "./CommandsContext";
interface Props {
  canvasRef: React.RefObject<HTMLCanvasElement>;
}
export const FacemeshEditor: React.FC<Props> = ({ canvasRef }) => {
  const commands = React.useContext(CommandsContext);
  return (
    <div className={styles.canvasContainer}>
      <div className={styles.canvasToolbar}>
        <FaPaste
          onClick={commands.paste}
          className={styles.toolbarButton}
          size={25}
        />
        <FaMagic
          onClick={commands.generate}
          className={styles.toolbarButton}
          size={25}
        />
      </div>
      <canvas ref={canvasRef} className={styles.canvasEditor} />
    </div>
  );
};
