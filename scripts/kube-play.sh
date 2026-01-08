#!/bin/bash

# Play kube file of generated pod yaml

# get environment variable file path from cli arguments
ENV_FILE=${1:-".env"}
# check if environment variable file exists
if [ ! -f "$ENV_FILE" ]; then
    echo "Environment variable file not found"
    echo "Usage: $0 <env-file> <kube-file>"
    exit 1
fi
echo "Loading environment variables from $ENV_FILE"
# load environment variables
export $(cat $ENV_FILE | xargs)
POD=${POD_NAME:-"moba-pod"}
KUBE_FILE=${2:-"$POD.yaml"}

podman pod exists $POD && podman pod rm -f $POD
echo "Playing kube $KUBE_FILE"
podman play kube $KUBE_FILE
podman pod ps
