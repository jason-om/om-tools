/**
 * Ambient Cloudflare declarations for the Worker entry point.
 *
 * Written as a global script (no top-level import/export) so `declare module`
 * below is a real declaration rather than a module augmentation.
 */

interface Fetcher {
  fetch(input: Request | string | URL, init?: RequestInit): Promise<Response>;
}

declare module "cloudflare:workers" {
  export const env: {
    ASSETS?: Fetcher;
    [key: string]: unknown;
  };
}
