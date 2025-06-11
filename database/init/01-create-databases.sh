#!/bin/bash
set -e

# Create databases
psql -v ON_ERROR_STOP=1 --username "warehouse_user" --dbname "warehouse_main" <<-EOSQL
    CREATE DATABASE inventory_db;
    CREATE DATABASE order_db;
    CREATE DATABASE customer_db;
    CREATE DATABASE payment_db;
    CREATE DATABASE notification_db;
    CREATE DATABASE alert_db;
EOSQL

echo "All databases created successfully!"
