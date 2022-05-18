import React from "react";
import ReactDom from "react-dom";

import { MircoSimLayout } from "./microSim";

window.addEventListener("load", () => {
  const node = (document as any).getElementById("root");
  ReactDom.render(<MircoSimLayout />, node);
});
