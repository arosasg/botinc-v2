"use client";

import { useState, type ChangeEvent, type FocusEvent, type KeyboardEvent, type TextareaHTMLAttributes } from "react";
import { useDCLogicInstance } from "@/lib/dc/logic";

type Props = Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, "value"> & { value?: unknown };

const RENDER_QUIET_MS = 250;

/* The design binds its composers as controlled textareas on the logic's draft,
   so every keystroke re-derived the whole workspace view-model and reconciled
   every view - hundreds of milliseconds on a workspace with thousands of
   issues. This keeps the keystroke local: the bound onChange still runs at
   once (the logic's state, the saved draft and the send path all see the new
   text immediately), but the tree refreshes only after a short pause in
   typing, on Enter, or on blur. Changes made to the draft elsewhere (a sent
   message clearing it, a restored draft on a chat switch) still flow in
   through `value`. */
export function ComposerTextarea({ value, onChange, onKeyDown, onBlur, ...rest }: Props) {
  const logic = useDCLogicInstance();
  const bound = typeof value === "string" ? value : value == null ? "" : String(value);
  const [text, setText] = useState(bound);
  const [seen, setSeen] = useState(bound);
  if (seen !== bound) {
    setSeen(bound);
    if (text !== bound) setText(bound);
  }
  const change = (event: ChangeEvent<HTMLTextAreaElement>) => {
    setText(event.target.value);
    if (!onChange) return;
    if (logic) logic.deferRender(() => onChange(event), RENDER_QUIET_MS);
    else onChange(event);
  };
  const key = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === "Enter" && !event.shiftKey) logic?.flushRender();
    onKeyDown?.(event);
  };
  const blur = (event: FocusEvent<HTMLTextAreaElement>) => {
    logic?.flushRender();
    onBlur?.(event);
  };
  return <textarea {...rest} value={text} onChange={change} onKeyDown={key} onBlur={blur} />;
}
