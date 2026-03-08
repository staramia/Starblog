/// <reference types="astro/client" />

interface ImportMetaEnv {
  readonly PUBLIC_SITE_URL?: string;
  readonly PUBLIC_KEYSTATIC_GITHUB_APP_SLUG?: string;
  readonly PUBLIC_KEYSTATIC_GITHUB_REPO?: string;
  readonly PUBLIC_KEYSTATIC_STORAGE?: 'local' | 'github';
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
