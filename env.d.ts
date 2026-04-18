/// <reference types="vite/client" />

// vuex@4.0.2 package.json `exports` omits a `types` condition, so
// moduleResolution: "bundler" can't auto-find its types. Redirect to the
// typings file shipped in the package.
declare module 'vuex' {
  export * from 'vuex/types/index.js';
}
