import type { CacheStorage as CloudflareCacheStorage, ExecutionContext, ExportedHandlerFetchHandler } from '@cloudflare/workers-types';
import type { SSRManifest } from 'astro';
import type { App } from 'astro/app';
type Env = {
    [key: string]: unknown;
    ASSETS: {
        fetch: (req: Request | string) => Promise<Response>;
    };
};
export interface Runtime<T extends object = object> {
    runtime: {
        env: Env & T;
        cf: Parameters<ExportedHandlerFetchHandler>[0]['cf'];
        caches: CloudflareCacheStorage;
        ctx: ExecutionContext;
    };
}
declare global {
    var __ASTRO_SESSION_BINDING_NAME: string;
    var __env__: Partial<Env>;
}
export declare function handle(manifest: SSRManifest, app: App, request: Parameters<ExportedHandlerFetchHandler>[0], env: Env, context: ExecutionContext): Promise<Response>;
export {};
