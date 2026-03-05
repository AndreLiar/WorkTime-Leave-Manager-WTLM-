// Global type definitions
declare const process: NodeJS.Process;
declare const console: Console;
declare const require: NodeRequire;
declare const __dirname: string;
declare const __filename: string;

declare namespace NodeJS {
  interface Process {
    env: ProcessEnv;
    argv: string[];
    cwd(): string;
    uptime(): number;
    exit(code?: number): never;
  }

  interface ProcessEnv {
    [key: string]: string | undefined;
    NODE_ENV?: string;
    PORT?: string;
    DATABASE_URL?: string;
    API_PREFIX?: string;
  }

  interface Global {}
}

interface Console {
  log(...data: any[]): void;
  error(...data: any[]): void;
  warn(...data: any[]): void;
  info(...data: any[]): void;
  debug(...data: any[]): void;
}

interface NodeRequire {
  (id: string): any;
}
