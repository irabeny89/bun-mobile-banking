#!/bin/bash

# Create pod from environment variables

# get environment variable file path from cli arguments
ENV_FILE=${1:-".env"}
# load environment variables
export $(cat $ENV_FILE | xargs)

# check if environment variable file exists
if [ ! -f "$ENV_FILE" ]; then
    echo "Environment variable file not found"
    echo "Usage: $0 <env-file>"
    exit 1
fi

echo "Loading environment variables from $ENV_FILE"
# load environment variables
export $(cat $ENV_FILE | xargs)

POD=${POD_NAME:-"moba-pod"}
echo "Creating pod $POD"

# database variables
DB_CONTAINER_NAME=${DATABASE_CONTAINER_NAME:-"moba-db"}
# bind mount volume in host working directory
DB_VOLUME="./postgres-data"
DB_IMAGE="postgres:18.1-alpine3.23"
DB_USER=${POSTGRES_USER:-"postgres"}
DB_PASSWORD=${POSTGRES_PASSWORD:-"postgres"}
DB_NAME=${POSTGRES_DB:-"postgres"}
DB_PORT=${POSTGRES_PORT:-"5432"}

# cache variables
CACHE_CONTAINER_NAME=${CACHE_CONTAINER_NAME:-"moba-cache"}
CACHE_IMAGE="valkey/valkey:9.0.0-alpine3.22"
CACHE_PORT=${VALKEY_PORT:-"6379"}

# file storage variables
STORAGE_CONTAINER_NAME=${STORAGE_CONTAINER_NAME:-"moba-storage"}
STORAGE_IMAGE="dxflrs/garage:v2.1.0"
STORAGE_PORT0=${STORAGE_PORT:-"3900"}
STORAGE_PORT1=${STORAGE_PORT:-"3901"}
STORAGE_PORT2=${STORAGE_PORT:-"3902"}
STORAGE_PORT3=${STORAGE_PORT:-"3903"}
STORAGE_CONFIG_VOLUME="./storage/garage.toml"
STORAGE_DATA_VOLUME="./storage/data"
STORAGE_META_VOLUME="./storage/meta"

# create pod
podman pod exists $POD && podman pod rm -f $POD
podman pod create --name $POD -p $DB_PORT:5432 -p $CACHE_PORT:6379 -p $STORAGE_PORT0:3900 -p $STORAGE_PORT1:3901 -p $STORAGE_PORT2:3902 -p $STORAGE_PORT3:3903

# run db in pod
podman run -d --name $DB_CONTAINER_NAME --pod $POD -e POSTGRES_USER=$DB_USER -e POSTGRES_PASSWORD=$DB_PASSWORD -e POSTGRES_DB=$DB_NAME -v $DB_VOLUME:/var/lib/postgresql/18/data $DB_IMAGE

# run cache in pod
podman run -d --name $CACHE_CONTAINER_NAME --pod $POD $CACHE_IMAGE

# run file storage in pod
podman run -d --name $STORAGE_CONTAINER_NAME --pod $POD -v $STORAGE_CONFIG_VOLUME:/etc/garage.toml:Z -v $STORAGE_DATA_VOLUME:/var/lib/garage/data:Z -v $STORAGE_META_VOLUME:/var/lib/garage/meta:Z $STORAGE_IMAGE

# inspect pod
podman ps