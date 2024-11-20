import fs from 'fs';
import { execSync } from 'child_process';
import path from 'path';

function getRepoInfo() {
    try {
        const remoteUrl = execSync('git remote get-url origin').toString().trim();
        const httpsUrl = remoteUrl
            .replace('git@github.com:', 'https://github.com/')
            .replace(/\.git$/, '');
        
        return {
            url: httpsUrl + '.git',
            name: httpsUrl.split('/').pop()
        };
    } catch (e) {
        console.error('Error getting git repo info:', e);
        return null;
    }
}

function updatePackageJson() {
    const packageJsonPath = path.resolve(process.cwd(), 'package.json');
    const repoInfo = getRepoInfo();

    if (!repoInfo) return;

    try {
        const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'));
        
        packageJson.name = repoInfo.name;
        packageJson.repository = {
            type: 'git',
            url: repoInfo.url
        };

        fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));
        console.log('Updated package.json with repository information');
    } catch (e) {
        console.error('Error updating package.json:', e);
    }
}

updatePackageJson(); 