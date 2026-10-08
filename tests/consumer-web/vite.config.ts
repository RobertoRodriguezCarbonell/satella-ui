import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

// Sin configuración especial: una app consumidora no necesita nada más (CLAUDE.md §2).
export default defineConfig({ plugins: [react()] });
