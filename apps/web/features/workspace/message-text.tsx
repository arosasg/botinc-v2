import type { ReactNode } from "react";

const LINK = /\[([^\]]+)]\((https?:\/\/[^\s)]+)\)|(https?:\/\/[^\s<]+)/gi;

function linkedLine(line: string, key: string): ReactNode[] {
  const nodes: ReactNode[] = [];
  let cursor = 0;
  for (const match of line.matchAll(LINK)) {
    const start = match.index ?? 0;
    if (start > cursor) nodes.push(line.slice(cursor, start));
    const markdownURL = match[2];
    let url = markdownURL || match[3] || "";
    let suffix = "";
    if (!markdownURL) {
      const clean = url.replace(/[.,;:!?]+$/, "");
      suffix = url.slice(clean.length);
      url = clean;
    }
    nodes.push(
      <a key={`${key}-${start}`} href={url} target="_blank" rel="noreferrer noopener">
        {match[1] || url}
      </a>,
    );
    if (suffix) nodes.push(suffix);
    cursor = start + match[0].length;
  }
  if (cursor < line.length) nodes.push(line.slice(cursor));
  return nodes;
}

export function MessageText({ text }: { text: string }) {
  return (
    <p className="message-markdown">
      {text.split("\n").map((line, index) => (
        <span key={index}>
          {linkedLine(line, String(index))}
          {index < text.split("\n").length - 1 ? <br /> : null}
        </span>
      ))}
    </p>
  );
}
