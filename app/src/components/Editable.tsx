"use client";

import { useRef, useEffect, type CSSProperties, type KeyboardEvent } from "react";
import styles from "./Editable.module.css";

export function Editable({
  value,
  onChange,
  placeholder = "…",
  block = false,
  className,
  style,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  block?: boolean;
  className?: string;
  style?: CSSProperties;
}) {
  const ref = useRef<HTMLSpanElement>(null);

  // Sync external value changes (e.g., translation) without disturbing an active edit
  useEffect(() => {
    const el = ref.current;
    if (!el || document.activeElement === el) return;
    el.textContent = value;
    if (value) {
      delete el.dataset.empty;
    } else {
      el.dataset.empty = "true";
    }
  }, [value]);

  const handleKeyDown = (e: KeyboardEvent<HTMLSpanElement>) => {
    if (!block && e.key === "Enter") {
      e.preventDefault();
      e.currentTarget.blur();
    }
  };

  const handleInput = (e: React.FormEvent<HTMLSpanElement>) => {
    const el = e.currentTarget;
    if (el.textContent?.trim()) {
      delete el.dataset.empty;
    } else {
      el.dataset.empty = "true";
    }
  };

  const handleBlur = (e: React.FocusEvent<HTMLSpanElement>) => {
    const text = block
      ? e.currentTarget.innerText.replace(/\n$/, "")
      : (e.currentTarget.textContent ?? "").trim();
    onChange(text);
  };

  return (
    <span
      ref={ref}
      contentEditable
      suppressContentEditableWarning
      onKeyDown={handleKeyDown}
      onInput={handleInput}
      onBlur={handleBlur}
      data-placeholder={placeholder}
      data-empty={value ? undefined : "true"}
      className={`${styles.editable}${block ? ` ${styles.block}` : ""} ${className ?? ""}`}
      style={style}
    >
      {value}
    </span>
  );
}
