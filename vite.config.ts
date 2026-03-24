import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {fileURLToPath} from 'url';
import {defineConfig, type Plugin} from 'vite';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const escapeRegExp = (value: string) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const inlineAssetsIntoHtml = (): Plugin => ({
  name: 'inline-assets-into-html',
  enforce: 'post',
  generateBundle(_, bundle) {
    const htmlAsset = bundle['index.html'];

    if (!htmlAsset || htmlAsset.type !== 'asset' || typeof htmlAsset.source !== 'string') {
      return;
    }

    let html = htmlAsset.source;

    for (const [fileName, item] of Object.entries(bundle)) {
      if (fileName === 'index.html') continue;

      if (item.type === 'chunk' && fileName.endsWith('.js')) {
        const scriptPattern = new RegExp(
          `<script([^>]*?)src=["'][^"']*${escapeRegExp(fileName)}["']([^>]*)></script>`,
        );

        html = html.replace(scriptPattern, (_, beforeAttrs, afterAttrs) => {
          return `<script${beforeAttrs}${afterAttrs}>${item.code}</script>`;
        });
        delete bundle[fileName];
      }

      if (item.type === 'asset' && fileName.endsWith('.css')) {
        const cssSource = typeof item.source === 'string' ? item.source : item.source.toString();
        const linkPattern = new RegExp(
          `<link([^>]*?)href=["'][^"']*${escapeRegExp(fileName)}["']([^>]*?)>`,
        );

        html = html.replace(linkPattern, (_, beforeAttrs, afterAttrs) => {
          return `<style${beforeAttrs}${afterAttrs}>${cssSource}</style>`;
        });
        delete bundle[fileName];
      }
    }

    htmlAsset.source = html;
  },
});

export default defineConfig({
  plugins: [react(), tailwindcss(), inlineAssetsIntoHtml()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, '.'),
    },
  },
  build: {
    assetsInlineLimit: Number.MAX_SAFE_INTEGER,
    cssCodeSplit: false,
  },
  server: {
    hmr: process.env.DISABLE_HMR !== 'true',
  },
});
