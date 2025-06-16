declare namespace NodeJS {
  // we need interface instead of type here
  // eslint-disable-next-line @typescript-eslint/consistent-type-definitions
  interface ProcessEnv {
    NODE_ENV: string;
    VUE_ROUTER_MODE: 'hash' | 'history' | 'abstract' | undefined;
    VUE_ROUTER_BASE: string | undefined;
  }
}
