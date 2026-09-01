#!/bin/bash
# Launch Standalone Social Intelligence & Outlier Studio
DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null 2>&1 && pwd )"
cd "$DIR"

echo "🚀 Starting Social Intelligence & Outlier Studio..."
echo "📁 Syncing with Obsidian Vault at /Users/felipeyanez/Desktop/NEWeunacom/os"

# Auto-open browser on macOS
(sleep 1 && open "http://localhost:4321") &

# Start Node Server
node server.js
