#!/bin/bash

# Git Automation Script
# Automates the workflow: git add → git commit → git push

# Check if we're in a git repository
top_level=$(git rev-parse --show-toplevel 2>/dev/null)
if [ -z "$top_level" ]; then
    echo "Error: Not in a git repository."
    exit 1
fi

# Get current branch name
current_branch=$(git symbolic-ref --short HEAD 2>/dev/null)
if [ -z "$current_branch" ]; then
    echo "Error: Could not determine current branch."
    exit 1
fi

echo "Current branch: $current_branch"
echo ""

# Check for changes
git status --short
if [ $? -ne 0 ]; then
    echo "Error: Could not check git status."
    exit 1
fi

# Ask for confirmation before proceeding
read -p "Do you want to add, commit, and push these changes? (y/n): " confirm
if [[ ! "$confirm" =~ ^[Yy]$ ]]; then
    echo "Operation cancelled."
    exit 0
fi

# Add all changes
echo "Adding changes..."
git add .
if [ $? -ne 0 ]; then
    echo "Error: Failed to add changes."
    exit 1
fi

# Prompt for commit message
read -p "Enter commit message: " commit_message
if [ -z "$commit_message" ]; then
    echo "Error: Commit message cannot be empty."
    exit 1
fi

# Commit changes
echo "Committing changes..."
git commit -m "$commit_message"
if [ $? -ne 0 ]; then
    echo "Error: Failed to commit changes."
    exit 1
fi

# Push changes
echo "Pushing changes to $current_branch..."
git push origin "$current_branch"
if [ $? -ne 0 ]; then
    echo "Error: Failed to push changes."
    exit 1
fi

echo ""
echo "✓ Successfully added, committed, and pushed changes to $current_branch"
echo "Commit message: $commit_message"