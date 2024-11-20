# Get the current repository name and username from git
$REPO_URL = git config --get remote.origin.url
$REPO_NAME = Split-Path -Leaf $REPO_URL -Resolve
$REPO_NAME = $REPO_NAME -replace '\.git$',''

# Extract username from the repository URL
if ($REPO_URL -match "github.com") {
    if ($REPO_URL -match "git@") {
        # SSH URL format
        $USERNAME = $REPO_URL -replace ".*:(.*)/$REPO_NAME.*",'$1'
    } else {
        # HTTPS URL format
        $USERNAME = $REPO_URL -replace ".*github.com/(.*)/$REPO_NAME.*",'$1'
    }
} else {
    Write-Host "Could not detect GitHub username"
    $USERNAME = "[yourusername]"
}

Write-Host "Repository name detected: $REPO_NAME"
Write-Host "GitHub username detected: $USERNAME"

# Update README.md with the correct username and repository name
$content = Get-Content README.md -Raw
$content = $content -replace '\[yourusername\]',$USERNAME
$content = $content -replace '\[repository-name\]',$REPO_NAME
Set-Content README.md $content

# Install dependencies
npm install

# Initial build
npm run build

Write-Host "Setup complete! You can now run 'npm run dev' to start the development server."
Write-Host "Your game will be available at: https://$USERNAME.github.io/$REPO_NAME/" 