#!/bin/bash
set -e

echo "Removing package-lock.json..."
rm -f package-lock.json

echo "Removing node_modules..."
rm -rf node_modules

echo "Clearing npm cache..."
npm cache clean --force

echo "Running npm install..."
npm install

echo "Clean install complete!"
