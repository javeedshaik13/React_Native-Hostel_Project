#!/bin/bash
# Cleanup Script for DigiLocker React Native Project
# Run this to remove unused files

echo "🧹 Starting cleanup..."

# Remove old screens folder
echo "❌ Removing old /screens folder..."
rm -rf ./screens

# Remove old App.js script
echo "❌ Removing old /scripts/App.js..."
rm -f ./scripts/App.js

# Remove unused constants files
echo "❌ Removing unused constants files..."
rm -f ./constants/createPostScreen.jsx
rm -f ./constants/userSettings.jsx

echo "✅ Cleanup complete!"
echo ""
echo "📊 Summary:"
echo "- Removed /screens folder (6 files)"
echo "- Removed /scripts/App.js"
echo "- Removed /constants/createPostScreen.jsx"
echo "- Removed /constants/userSettings.jsx"
echo ""
echo "🎉 Your project is now cleaner!"
echo "Run 'npm start' to test the app."
