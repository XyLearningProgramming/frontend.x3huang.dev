#!/bin/bash

set -euo pipefail

# Script to apply Kubernetes secrets from env file
# Usage: ./apply.sh [env-file-path]
# Defaults to ./frontend.env if no file specified

if [ $# -eq 0 ]; then
    # Get the directory of this script
    SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
    ENV_FILE="$SCRIPT_DIR/frontend.env"
elif [ $# -eq 1 ]; then
    ENV_FILE="$1"
else
    echo "Usage: $0 [env-file-path]"
    echo "Example: $0 ./frontend.prod.env"
    echo "Defaults to ./frontend.env if no file specified"
    exit 1
fi

# Check if env file exists
if [ ! -f "$ENV_FILE" ]; then
    echo "Error: Environment file '$ENV_FILE' not found"
    exit 1
fi

echo "Applying secrets from: $ENV_FILE"

# Ensure namespace exists
kubectl create namespace frontend > /dev/null 2>&1 || true

# Create or update secrets from env file
kubectl create secret generic helmfile-secret-frontend \
    --from-env-file="$ENV_FILE" \
    --namespace=frontend \
    --save-config \
    --dry-run=client -o yaml | kubectl apply -f -

echo "Secret helmfile-secret-frontend updated successfully in namespace frontend"