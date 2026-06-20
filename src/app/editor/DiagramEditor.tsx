"use client";

import { ReactFlowProvider } from "@xyflow/react";
import { EditorThemeProvider } from "./context/EditorThemeContext";
import { EditorContent } from "./EditorContent";

export function DiagramEditor() {
  return (
    <EditorThemeProvider>
      <ReactFlowProvider>
        <EditorContent />
      </ReactFlowProvider>
    </EditorThemeProvider>
  );
}