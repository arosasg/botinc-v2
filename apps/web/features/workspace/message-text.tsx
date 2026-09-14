import { Fragment, memo, useMemo, type ReactNode } from "react";
import { parseMessageBlocks } from "./message-markdown";

const INLINE = /\[([^\]]+)]\((https?:\/\/[^\s)]+|mention:\/\/[^\s)]+)\)|\*\*([^*\n]+)\*\*|`([^`\n]+)`|(https?:\/\/[^\s<]+)/gi;

function linkedLine(line: string, key: string): ReactNode[] {
  const nodes: ReactNode[] = [];
  let cursor = 0;
  for (const match of line.matchAll(INLINE)) {
    const start = match.index ?? 0;
    if (start > cursor) nodes.push(line.slice(cursor, start));
    const markdownURL = match[2];
    if (markdownURL) {
      const label = match[1] || markdownURL;
      nodes.push(markdownURL.startsWith("mention://") ? (
        <span className="message-mention" key={`${key}-${start}`}>@{label.replace(/^@/, "")}</span>
      ) : (
        <a key={`${key}-${start}`} href={markdownURL} target="_blank" rel="noreferrer noopener">{label}</a>
      ));
    } else if (match[3]) {
      nodes.push(<strong key={`${key}-${start}`}>{match[3]}</strong>);
    } else if (match[4]) {
      nodes.push(<code key={`${key}-${start}`}>{match[4]}</code>);
    } else {
      let url = match[5] || "";
      const clean = url.replace(/[.,;:!?]+$/, "");
      const suffix = url.slice(clean.length);
      url = clean;
      nodes.push(<a key={`${key}-${start}`} href={url} target="_blank" rel="noreferrer noopener">{url}</a>);
      if (suffix) nodes.push(suffix);
    }
    cursor = start + match[0].length;
  }
  if (cursor < line.length) nodes.push(line.slice(cursor));
  return nodes;
}

function inlineText(text: string, key: string): ReactNode {
  const lines = text.split("\n");
  return lines.map((line, index) => (
    <Fragment key={`${key}-${index}`}>
      {linkedLine(line, `${key}-${index}`)}
      {index < lines.length - 1 ? <br /> : null}
    </Fragment>
  ));
}

function MessageTextView({ text }: { text: string }) {
  const blocks = useMemo(() => parseMessageBlocks(text), [text]);
  return (
    <div className="message-markdown">
      {blocks.map((block, index) => {
        const key = String(index);
        if (block.type === "heading") {
          const Tag = block.level === 1 ? "h2" : "h3";
          return <Tag key={key}>{inlineText(block.text || "", key)}</Tag>;
        }
        if (block.type === "quote") return <blockquote key={key}>{inlineText(block.text || "", key)}</blockquote>;
        if (block.type === "code") return <pre key={key}><code>{block.text}</code></pre>;
        if (block.type === "list") {
          const Tag = block.ordered ? "ol" : "ul";
          return <Tag key={key}>{block.items?.map((item, itemIndex) => <li key={itemIndex}>{inlineText(item, `${key}-${itemIndex}`)}</li>)}</Tag>;
        }
        return <p key={key}>{inlineText(block.text || "", key)}</p>;
      })}
    </div>
  );
}

export const MessageText = memo(MessageTextView);
