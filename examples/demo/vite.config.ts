import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const isDev = mode === 'development';
  
  return {
    root: __dirname,
    build: {
      outDir: path.resolve(__dirname, 'dist'),
      emptyOutDir: true,
    },
    plugins: [react()],
    base: '/wizzard-stepper-react/',
    resolve: {
      alias: {
        // Use local source in development, installed package in production
        ...(isDev
          ? { 'wizzard-stepper-react': path.resolve(__dirname, '../../src/index.ts') }
          : {}),
        'react': path.resolve(__dirname, './node_modules/react'),
        'react-dom': path.resolve(__dirname, './node_modules/react-dom'),
        'yup': path.resolve(__dirname, './node_modules/yup'),
        'zod': path.resolve(__dirname, './node_modules/zod'),
      },
    },
  };
});
