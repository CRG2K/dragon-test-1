#!/bin/bash

# Get the current repository name and username from git
REPO_NAME=$(basename -s .git $(git config --get remote.origin.url))
REPO_URL=$(git config --get remote.origin.url)

# Extract username from the repository URL
if [[ $REPO_URL == *"github.com"* ]]; then
    if [[ $REPO_URL == *"git@"* ]]; then
        # SSH URL format
        USERNAME=$(echo $REPO_URL | sed -n 's/.*:\/\?\([^/]*\)\/.*/\1/p' | cut -d ":" -f2)
    else
        # HTTPS URL format
        USERNAME=$(echo $REPO_URL | sed -n 's/.*github.com\/\([^/]*\)\/.*/\1/p')
    fi
else
    echo "Could not detect GitHub username"
    USERNAME="[yourusername]"
fi

echo "Repository name detected: $REPO_NAME"
echo "GitHub username detected: $USERNAME"

# Update README.md with the correct username and repository name
sed -i.bak "s/\[yourusername\]/$USERNAME/g" README.md
sed -i.bak "s/\[repository-name\]/$REPO_NAME/g" README.md
rm README.md.bak

# Install dependencies
npm install

# Initial build
npm run build

# Setup git hooks (optional)
if [ -d .git ]; then
    npx husky install
fi

echo "Setup complete! You can now run 'npm run dev' to start the development server."
echo "Your game will be available at: https://$USERNAME.github.io/$REPO_NAME/" 