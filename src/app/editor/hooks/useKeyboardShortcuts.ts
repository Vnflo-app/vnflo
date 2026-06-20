import { useEffect } from "react";

interface UseKeyboardShortcutsArgs {
  handleUndo: () => void;
  handleRedo: () => void;
  handleCut: () => void;
  handleCopy: () => void;
  handlePaste: () => void;
  handleDuplicate: () => void;
  handleSelectAll: () => void;
  handleChangeOrder: (action: "backward" | "forward" | "back" | "front") => void;
  handleAddComment: () => void;
  handleGroupSelection: () => void;
  handleCreateFigure: () => void;
  activePanel: any;
  setActivePanel: (panel: any) => void;
  rfInstance: any;
  handleReset: () => void;
  handleDeleteSelected: () => void;
  handleAutoLayout: (dir: any) => void;
  spawnNode: (shape: any) => void;
  diagramId: string;
  diagramName: string;
  nodes: any[];
  edges: any[];
  updateDiagram: (d: any) => Promise<void>;
  getDiagram: (id: string) => Promise<any>;
  setIsSaving: (s: boolean) => void;
  setIsDirty: (d: boolean) => void;
  rtc: any;
}

export function useKeyboardShortcuts({
  handleUndo, handleRedo, handleCut, handleCopy, handlePaste,
  handleDuplicate, handleSelectAll, handleChangeOrder,
  handleAddComment, handleGroupSelection, handleCreateFigure,
  activePanel, setActivePanel, rfInstance, handleReset,
  handleDeleteSelected, handleAutoLayout, spawnNode,
  diagramId, diagramName, nodes, edges, updateDiagram, getDiagram,
  setIsSaving, setIsDirty, rtc
}: UseKeyboardShortcutsArgs) {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (
        document.activeElement?.tagName === "INPUT" ||
        document.activeElement?.tagName === "TEXTAREA" ||
        document.activeElement?.hasAttribute("contenteditable") ||
        document.activeElement?.closest('[contenteditable="true"]')
      ) return;

      const isCmd = e.metaKey || e.ctrlKey;
      const keyLower = e.key.toLowerCase();

      if (isCmd && !e.shiftKey && keyLower === "z") { e.preventDefault(); handleUndo(); }
      else if (isCmd && ((e.shiftKey && keyLower === "z") || keyLower === "y")) { e.preventDefault(); handleRedo(); }
      else if (isCmd && keyLower === "x") { e.preventDefault(); handleCut(); }
      else if (isCmd && keyLower === "c") { e.preventDefault(); handleCopy(); }
      else if (isCmd && keyLower === "v") { e.preventDefault(); handlePaste(); }
      else if (isCmd && keyLower === "d") { e.preventDefault(); handleDuplicate(); }
      else if (isCmd && keyLower === "a") { e.preventDefault(); handleSelectAll(); }
      else if (isCmd && keyLower === "l") { e.preventDefault(); handleAutoLayout("TB"); }
      else if (isCmd && keyLower === "s") {
        e.preventDefault();
        if (diagramId) {
          setIsSaving(true);
          getDiagram(diagramId).then(async (d) => {
            if (!d) { setIsSaving(false); return; }
            await updateDiagram({ ...d, name: diagramName, nodes, edges });
            setIsSaving(false);
            setIsDirty(false);
            rtc.sendNodes(nodes, edges);
          });
        }
      }
      else if (isCmd && e.key === "[") { e.preventDefault(); handleChangeOrder("backward"); }
      else if (isCmd && e.key === "]") { e.preventDefault(); handleChangeOrder("forward"); }
      else if (isCmd && e.shiftKey && keyLower === "m") { e.preventDefault(); handleAddComment(); }
      else if (isCmd && keyLower === "g") { e.preventDefault(); handleGroupSelection(); }
      else if (e.key === "Delete" || e.key === "Backspace") { e.preventDefault(); handleDeleteSelected(); }
      else if (!isCmd && !e.altKey && keyLower === "n") { e.preventDefault(); spawnNode("rect"); }
      else if (!isCmd && !e.altKey && keyLower === "c") { e.preventDefault(); spawnNode("circle"); }
      else if (!isCmd && !e.altKey && keyLower === "d") { e.preventDefault(); spawnNode("decision"); }
      else if (!isCmd && e.key === "[") { e.preventDefault(); handleChangeOrder("back"); }
      else if (!isCmd && e.key === "]") { e.preventDefault(); handleChangeOrder("front"); }
      else if (!isCmd && e.shiftKey && keyLower === "f") { e.preventDefault(); handleCreateFigure(); }
      
      const isAlt = e.altKey;
      if (!isCmd && !isAlt && e.key === "1") { e.preventDefault(); setActivePanel(activePanel === "shapes" ? null : "shapes"); }
      else if (!isCmd && !isAlt && e.key === "2") { e.preventDefault(); setActivePanel(activePanel === "framer" ? null : "framer"); }
      else if (!isCmd && !isAlt && e.key === "3") { e.preventDefault(); setActivePanel(activePanel === "colors" ? null : "colors"); }
      else if (!isCmd && !isAlt && e.key === "4") { e.preventDefault(); setActivePanel(activePanel === "icons" ? null : "icons"); }
      else if (!isCmd && !isAlt && e.key === "5") { e.preventDefault(); setActivePanel(activePanel === "templates" ? null : "templates"); }
      else if (!isCmd && !isAlt && e.key === "6") { e.preventDefault(); setActivePanel(activePanel === "dsl" ? null : "dsl"); }
      else if (!isCmd && !isAlt && e.key === "7") { e.preventDefault(); setActivePanel(activePanel === "ai" ? null : "ai"); }
      
      else if (!isCmd && !isAlt && (e.key === "=" || e.key === "+")) { e.preventDefault(); rfInstance?.zoomIn(); }
      else if (!isCmd && !isAlt && e.key === "-") { e.preventDefault(); rfInstance?.zoomOut(); }
      else if (!isCmd && !isAlt && keyLower === "f") { e.preventDefault(); rfInstance?.fitView({ padding: 0.1 }); }
      else if (isAlt && keyLower === "r") { e.preventDefault(); handleReset(); }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [
    handleUndo, handleRedo, handleCut, handleCopy, handlePaste,
    handleDuplicate, handleSelectAll, handleChangeOrder,
    handleAddComment, handleGroupSelection, handleCreateFigure,
    activePanel, setActivePanel, rfInstance, handleReset,
    handleDeleteSelected, handleAutoLayout, spawnNode,
    diagramId, diagramName, nodes, edges, updateDiagram, getDiagram,
    setIsSaving, setIsDirty, rtc
  ]);
}