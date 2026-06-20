import { Undo2, Redo2, Square, Circle, Maximize2, Layout, Save, Trash2 } from "lucide-react";
import { useEditorTheme } from "../context/EditorThemeContext";

interface TouchDockProps {
  canUndo: boolean;
  canRedo: boolean;
  onUndo: () => void;
  onRedo: () => void;
  spawnNode: (shape: any) => void;
  rfInstance: any;
  handleAutoLayout: (dir: any) => void;
  selectedNodes: any[];
  handleDeleteSelected: () => void;
  handleSave: () => void;
}

export function TouchDock({
  canUndo, canRedo, onUndo, onRedo, spawnNode, rfInstance, 
  handleAutoLayout, selectedNodes, handleDeleteSelected, handleSave
}: TouchDockProps) {
  const { theme } = useEditorTheme();

  return (
    <div
      className="flex items-center gap-1.5 p-2 rounded-2xl border shadow-2xl animate-in fade-in slide-in-from-bottom-5 duration-300"
      style={{
        background: theme.panel,
        borderColor: theme.border,
        boxShadow: "0 20px 25px -5px rgba(0,0,0,0.5), 0 8px 10px -6px rgba(0,0,0,0.5)",
        backdropFilter: "blur(20px)",
      }}
    >
      <div className="px-2.5 py-1 flex flex-col items-center border-r" style={{ borderColor: theme.border }}>
        <span className="text-[9px] uppercase tracking-wider font-bold" style={{ color: theme.accent }}>Touch</span>
        <span className="text-[8px]" style={{ color: theme.textMuted }}>Dock</span>
      </div>

      <button onClick={onUndo} disabled={!canUndo} className="p-2.5 rounded-xl hover:bg-white/5 active:scale-95 transition-all disabled:opacity-30" style={{ color: theme.textPrimary }} title="Undo">
        <Undo2 className="w-4 h-4" />
      </button>
      <button onClick={onRedo} disabled={!canRedo} className="p-2.5 rounded-xl hover:bg-white/5 active:scale-95 transition-all disabled:opacity-30" style={{ color: theme.textPrimary }} title="Redo">
        <Redo2 className="w-4 h-4" />
      </button>

      <div className="w-[1px] h-6" style={{ background: theme.border }} />

      <button onClick={() => spawnNode("rect")} className="p-2.5 rounded-xl hover:bg-white/5 active:scale-95 transition-all" style={{ color: theme.textPrimary }} title="Add Rectangle Node">
        <Square className="w-4 h-4" />
      </button>
      <button onClick={() => spawnNode("circle")} className="p-2.5 rounded-xl hover:bg-white/5 active:scale-95 transition-all" style={{ color: theme.textPrimary }} title="Add Circle Node">
        <Circle className="w-4 h-4" />
      </button>

      <div className="w-[1px] h-6" style={{ background: theme.border }} />

      <button onClick={() => rfInstance?.fitView({ padding: 0.1 })} className="p-2.5 rounded-xl hover:bg-white/5 active:scale-95 transition-all" style={{ color: theme.textPrimary }} title="Fit View">
        <Maximize2 className="w-4 h-4" />
      </button>
      <button onClick={() => handleAutoLayout("TB")} className="p-2.5 rounded-xl hover:bg-white/5 active:scale-95 transition-all" style={{ color: theme.textPrimary }} title="Auto Layout">
        <Layout className="w-4 h-4" />
      </button>
      <button onClick={handleSave} className="p-2.5 rounded-xl hover:bg-white/5 active:scale-95 transition-all" style={{ color: theme.textPrimary }} title="Save Diagram">
        <Save className="w-4 h-4" />
      </button>

      {selectedNodes.length > 0 && (
        <>
          <div className="w-[1px] h-6" style={{ background: theme.border }} />
          <button onClick={handleDeleteSelected} className="p-2.5 rounded-xl bg-red-500/10 hover:bg-red-500/20 active:scale-95 transition-all text-red-400" title="Delete Selected">
            <Trash2 className="w-4 h-4" />
          </button>
        </>
      )}
    </div>
  );
}