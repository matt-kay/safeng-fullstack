#!/bin/bash

# Configuration
DB_NAME="safeng_db"
REDIS_NAME="safe_redis"

# Resource Limits
DB_CPU="1"
DB_MEM="256m"
REDIS_CPU="1"
REDIS_MEM="64m"

# Credentials (matching .env)
POSTGRES_USER="postgres"
POSTGRES_PASSWORD="postgres_password"
POSTGRES_DB="safeng"

function up() {
    echo "Starting SafeMe Infrastructure with Apple Container..."

    # Ensure system service is running (optional but recommended)
    # container system start

    # Start PostgreSQL
    if ! container ls -a | grep -q "$DB_NAME"; then
        echo "Creating $DB_NAME container..."
        container run -d \
            --name "$DB_NAME" \
            --cpus "$DB_CPU" \
            --memory "$DB_MEM" \
            -e POSTGRES_USER="$POSTGRES_USER" \
            -e POSTGRES_PASSWORD="$POSTGRES_PASSWORD" \
            -e POSTGRES_DB="$POSTGRES_DB" \
            -p 5432:5432 \
            kartoza/postgis:16-3.4
    else
        echo "Starting existing $DB_NAME container..."
        container start "$DB_NAME"
    fi

    # Start Redis
    if ! container ls -a | grep -q "$REDIS_NAME"; then
        echo "Creating $REDIS_NAME container..."
        container run -d \
            --name "$REDIS_NAME" \
            --cpus "$REDIS_CPU" \
            --memory "$REDIS_MEM" \
            -p 6379:6379 \
            redis:7-alpine
    else
        echo "Starting existing $REDIS_NAME container..."
        container start "$REDIS_NAME"
    fi
}

function down() {
    echo "Stopping SafeMe Infrastructure..."
    container stop "$DB_NAME" &> /dev/null
    container stop "$REDIS_NAME" &> /dev/null
}

function status() {
    echo "Infrastructure Status:"
    container ls | grep -E "$DB_NAME|$REDIS_NAME"
}

function clean() {
    echo "Removing SafeMe Infrastructure containers..."
    container rm -f "$DB_NAME" &> /dev/null
    container rm -f "$REDIS_NAME" &> /dev/null
}

case "$1" in
    up) up ;;
    down) down ;;
    status) status ;;
    clean) clean ;;
    *) echo "Usage: $0 {up|down|status|clean}" ;;
esac
