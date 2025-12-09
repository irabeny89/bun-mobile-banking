#!/bin/bash

# get environment variable file path from cli arguments
ENV_FILE=${1:-".env"}
# check if environment variable file exists
if [ ! -f "$ENV_FILE" ]; then
    echo "Environment variable file not found"
    echo "Usage: $0 <env-file>"
    exit 1
fi
echo "Loading environment variables from $ENV_FILE"
# load environment variables
export $(cat $ENV_FILE | xargs)

POD=${POD_NAME:-"fmb-pod"}
echo "Generating kube $POD.yaml"
podman generate kube $POD > $POD.yaml
echo "Pod $POD.yaml generated successfully"
