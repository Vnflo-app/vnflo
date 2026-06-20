import { createContext, useContext, ReactNode } from "react";
import { useTheme, ThemeId, ThemeColors, SITE_THEMES } from "../../context/ThemeContext";

export type CanvasThemeId = ThemeId;
export type CanvasTheme = ThemeColors;
export const CANVAS_THEMES = SITE_THEMES;

interface EditorThemeContextValue {
  theme: CanvasTheme;
  themeId: CanvasThemeId;
  setThemeId: (id: CanvasThemeId) => void;
}

const EditorThemeContext = createContext<EditorThemeContextValue>({
  theme: SITE_THEMES.dark,
  themeId: "dark",
  setThemeId: () => {},
});

export function EditorThemeProvider({ children }: { children: ReactNode }) {
  const { theme, themeId, setThemeId } = useTheme();

  return (
    <EditorThemeContext.Provider value={{ theme, themeId, setThemeId }}>
      {children}
    </EditorThemeContext.Provider>
  );
}

export const useEditorTheme = () => useContext(EditorThemeContext);
