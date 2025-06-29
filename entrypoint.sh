#!/bin/sh
# entrypoint.sh

# This script replaces postgres url at runtime.

# Exit immediately if a command exits with a non-zero status.
set -e

# Define the placeholder from your nuxt.config.ts
PLACEHOLDER='"postgres_url_default"'

# Check if the real URL is provided, otherwise exit to prevent starting with a bad config
if [ -z "$POSTGRES_URL" ]; then
  echo "FATAL: POSTGRES_URL environment variable is not set."
  exit 1
fi

# Important: Quote the variable to handle special characters in the URL
REAL_URL="\"$POSTGRES_URL\""

echo "Entrypoint: Script started. Checking for configuration placeholder..."

# Find the file(s) containing the placeholder. The `find` command is robust.
# Using a loop to handle cases where the placeholder might appear in multiple chunks.
find /app/server/chunks -type f -name "*.mjs" -print0 | while IFS= read -r -d '' file; do
    # Use grep's quiet mode (-q) to check if the file contains the placeholder
    if grep -q "$PLACEHOLDER" "$file"; then
        echo "Entrypoint: Found placeholder in $file. Performing substitution..."
        # Use sed to replace the placeholder in-place.
        # The use of | as a delimiter avoids issues with slashes in the URL.
        sed -i "s|$PLACEHOLDER|$REAL_URL|g" "$file"
        echo "Entrypoint: Substitution complete for $file."
    fi
done

echo "Entrypoint: Configuration complete. Starting application..."

# This is the crucial part:
# `exec "$@"` replaces the shell process with the command provided
# to the container (the CMD from the Dockerfile). This ensures Node.js
# becomes the main process (PID 1) and receives shutdown signals correctly
# from Kubernetes.
exec "$@"