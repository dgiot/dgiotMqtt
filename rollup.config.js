import json from '@rollup/plugin-json';
import babel from 'rollup-plugin-babel';
import { terser } from 'rollup-plugin-terser';
import commonjs from '@rollup/plugin-commonjs';
import resolve from '@rollup/plugin-node-resolve';

import pkg from './package.json';
function formatTime(time = new Date()) {
  const date = new Date(time);
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();
  const hour = date.getHours();
  const minutes = date.getMinutes();
  const seconds = date.getSeconds();
  return (
    year + '/' + month + '/' + day + '  ' + hour + ':' + minutes + ':' + seconds
  );
}

const banner =
  '/*!\n' +
  ` * dgiot-mqtt.js v${pkg.version}\n` +
  ` * (c) ${formatTime()} h7ml(h7ml@qq.com)\n` +
  ' * Released under the MIT License.\n' +
  ' */';

export default [
  // browser-friendly UMD build
  {
    input: 'index.js',
    output: {
      name: 'dgiot-mqtt',
      file: pkg.browser,
      format: 'umd',
      sourcemap: true,
      banner,
    },
    plugins: [
      json({
        compact: true,
      }),
      resolve(),
      commonjs(),
      babel({
        exclude: 'node_modules/**',
        runtimeHelpers: true,
        presets: ['@babel/preset-env'],
        plugins: [
          [
            '@babel/plugin-transform-runtime',
            { useESModules: true /**, corejs: 3  */ },
          ],
        ],
      }),
    ],
  },
  {
    input: 'index.js',
    output: [
      { file: pkg.main, format: 'cjs', banner, sourcemap: true },
      { file: pkg.module, format: 'esm', banner, sourcemap: true },
      {
        name: 'dgiot-mqtt',
        file: 'dist/dgiot-mqtt.amd.js',
        format: 'amd',
        extend: true,
        sourcemap: true,
        banner,
      },
      {
        name: 'dgiot-mqtt',
        file: 'dist/dgiot-mqtt.js',
        format: 'iife',
        extend: true,
        sourcemap: true,
        banner,
      },
      {
        name: 'dgiot-mqtt',
        file: 'dist/dgiot-mqtt.min.js',
        format: 'iife',
        extend: true,
        banner,
        sourcemap: true,
        plugins: [terser()],
      },
    ],
    plugins: [
      json({
        compact: true,
      }),
      resolve(),
      commonjs(),
      babel({
        // https://github.com/rollup/rollup-plugin-babel#configuring-babel
        exclude: 'node_modules/**',
        runtimeHelpers: true,
        presets: ['@babel/preset-env'],
        plugins: [
          [
            '@babel/plugin-transform-runtime',
            { useESModules: true /**, corejs: 3  */ },
          ],
        ],
      }),
    ],
  },
];
