"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import en from "./en.json";
import fr from "./fr.json";
import ar from "./ar.json";
import { type Language, getLanguageDir } from "./index";

export type { Language };

const dictionaries: Record<Language, typeof en> = { en, fr, ar };

type TranslationDict = typeof en;

interface LanguageContextValue {
  language: Language;
  dir: "ltr" | "rtl";
  t: (path: string) => string;
  setLanguage: (lang: Language) => void;
}

const LanguageContext = createContext<LanguageContextValue | null>(null);

function getNestedValue(obj: Record<string, any>, path: string): string {
  const keys = path.split(".");
  let current: any = obj;
  for (const key of keys) {
    if (current == null || typeof current !== "object") return path;
    current = current[key];
  }
  return typeof current === "string" ? current : path;
}

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLangState] = useState<Language>("en");

  useEffect(() => {
    const stored = localStorage.getItem("restoos-language") as Language | null;
    if (stored && ["en", "fr", "ar"].includes(stored)) {
      setLangState(stored);
    }
  }, []);

  useEffect(() => {
    const dir = getLanguageDir(language);
    document.documentElement.setAttribute("dir", dir);
    document.documentElement.setAttribute("lang", language);
  }, [language]);

  const setLanguage = useCallback((lang: Language) => {
    setLangState(lang);
    localStorage.setItem("restoos-language", lang);
    const dir = getLanguageDir(lang);
    document.documentElement.setAttribute("dir", dir);
    document.documentElement.setAttribute("lang", lang);
  }, []);

  const t = useCallback(
    (path: string): string => {
      return getNestedValue(dictionaries[language] as Record<string, any>, path);
    },
    [language]
  );

  const value = useMemo(
    () => ({ language, dir: getLanguageDir(language), t, setLanguage }),
    [language, t, setLanguage]
  );

  return (
    <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>
  );
}

export function useTranslation() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useTranslation must be used within a LanguageProvider");
  }
  return context;
}
