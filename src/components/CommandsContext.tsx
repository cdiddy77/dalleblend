import React from "react";
import { SourceImageData } from "../shared/types";
import { FacemeshEditState } from "../shared/faceMeshEdit";

export interface Commands {
  paste: () => Promise<void>;
  generate: () => Promise<void>;
  save: () => Promise<void>;
}

export const CommandsContext = React.createContext<Commands>({
  paste: async () => {},
  generate: async () => {},
  save: async () => {},
});
