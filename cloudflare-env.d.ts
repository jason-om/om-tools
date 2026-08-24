/**
 * Ambient Cloudflare declarations for the Worker entry point and the D1 client.
 *
 * Written as a global script (no top-level import/export) so `declare module`
 * below is a real declaration rather than a module augmentation.
 *
 * `D1Database` is pulled from @cloudflare/workers-types because drizzle-orm/d1
 * expects exactly that type. `Fetcher` is declared against the DOM `Request`
 * and `Response` the app and vinext already use, so the two type worlds do not
 * collide.
 */

type D1Database = import("@cloudflare/workers-types").D1Database;

interface Fetcher {
  fetch(input: Request | string | URL, init?: RequestInit): Promise<Response>;
}

declare module "cloudflare:workers" {
  export const env: {
    DB?: D1Database;
    ASSETS?: Fetcher;
    [key: string]: unknown;
  };
}
