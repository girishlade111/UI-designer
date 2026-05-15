declare module "react-syntax-highlighter" {
  import { ComponentType, CSSProperties, ReactNode } from "react";

  export interface SyntaxHighlighterProps {
    language?: string;
    style?: Record<string, CSSProperties>;
    children: string;
    showLineNumbers?: boolean;
    wrapLines?: boolean;
    lineNumberStyle?: CSSProperties | ((lineNumber: number) => CSSProperties);
    customStyle?: CSSProperties;
    className?: string;
    PreTag?: string | ComponentType<{ children?: ReactNode; style?: CSSProperties }>;
    [key: string]: unknown;
  }

  export const Prism: ComponentType<SyntaxHighlighterProps>;
  export const Light: ComponentType<SyntaxHighlighterProps>;
  export default ComponentType<SyntaxHighlighterProps>;
}

declare module "react-syntax-highlighter/dist/esm/styles/prism" {
  import { CSSProperties } from "react";
  export const vscDarkPlus: Record<string, CSSProperties>;
}

declare module "prettier/standalone" {
  export function format(source: string, options: Record<string, unknown>): Promise<string>;
}

declare module "prettier/plugins/babel" {
  const plugin: Record<string, unknown>;
  export default plugin;
}

declare module "prettier/plugins/estree" {
  const plugin: Record<string, unknown>;
  export default plugin;
}
