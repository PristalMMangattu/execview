import * as esbuild from "esbuild";
import { htmlPlugin } from "@craftamap/esbuild-plugin-html";

const production = process.argv.includes('--production');
const watch = process.argv.includes('--watch');

/**
 * @type {import('esbuild').Plugin}
 */
const esbuildProblemMatcherPlugin = {
  name: 'esbuild-problem-matcher',

  setup(build) {
    build.onStart(() => {
      console.log('[watch] build started');
    });
    build.onEnd((result) => {
      result.errors.forEach(({ text, location }) => {
        console.error(`✘ [ERROR] ${text}`);
        console.error(`    ${location.file}:${location.line}:${location.column}:`);
      });
      console.log('[watch] build finished');
    });
  },
};

async function main() {
  const ctx = await esbuild.context({
    entryPoints: [
      'src/app.tsx'
    ],
    bundle: true,
    format: 'cjs',
    minify: production,
    sourcemap: !production,
    define: {
      'process.env.NODE_ENV': production ? '"production"' : '"development"',
    },
    sourcesContent: false,
    platform: 'node',
    //outfile: 'dist/app.js',
    outdir: 'dist',
    metafile: true, // This is requied for esbuild-plugin-html
    plugins: [
      htmlPlugin({
        files: [
          {
            title: "Elf File Visualizer",
            entryPoints: ['src/app.tsx'],
            filename: 'index.html',
            htmlTemplate: './src/index.html',
            scriptLoading: 'module',
          },
        ],
      }),
      esbuildProblemMatcherPlugin,
    ],
    logLevel: 'silent',
  });
  if (watch) {
    await ctx.watch();
  } else {
    await ctx.rebuild();
    await ctx.dispose();
  }
}

main().catch(e => {
  console.error(e);
  process.exit(1);
});
