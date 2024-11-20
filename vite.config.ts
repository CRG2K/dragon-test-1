import { defineConfig } from 'vite';
import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

function getRepoName(): string {
    try {
        // Try to get repo name from git remote URL
        const remoteUrl = execSync('git remote get-url origin').toString().trim();
        const match = remoteUrl.match(/\/([^\/]+?)(\.git)?$/);
        if (match) {
            return match[1];
        }
    } catch (e) {
        console.warn('Could not get repo name from git:', e);
    }

    try {
        // Fallback to package.json repository URL
        const packageJson = JSON.parse(
            fs.readFileSync(path.resolve(process.cwd(), 'package.json'), 'utf-8')
        );
        if (packageJson.repository?.url) {
            const match = packageJson.repository.url.match(/\/([^\/]+?)(\.git)?$/);
            if (match) {
                return match[1];
            }
        }
    } catch (e) {
        console.warn('Could not get repo name from package.json:', e);
    }

    // Default fallback
    return '';
}

// For development, we want to log what base path is being used
const base = process.env.NODE_ENV === 'production' ? `/${getRepoName()}/` : '/';
console.log(`Using base path: ${base}`);

export default defineConfig({
    base,
    server: {
        port: 3000,
    },
    build: {
        outDir: 'dist',
        sourcemap: true,
    }
}); 