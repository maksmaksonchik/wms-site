#!/bin/bash

generate_key() {
  openssl rand -base64 "$1" | tr -d '\n'
}
API_TOKEN_SALT=$(generate_key 16)
ADMIN_JWT_SECRET=$(generate_key 16)
TRANSFER_TOKEN_SALT=$(generate_key 16)
ENCRYPTION_KEY=$(generate_key 32)

APP_KEYS="$(generate_key 16),$(generate_key 16),$(generate_key 16),$(generate_key 16)"

echo -e "\n --- Strapi Secrets ---"
echo "APP_KEYS=$APP_KEYS"
echo "API_TOKEN_SALT=$API_TOKEN_SALT"
echo "ADMIN_JWT_SECRET=$ADMIN_JWT_SECRET"
echo "TRANSFER_TOKEN_SALT=$TRANSFER_TOKEN_SALT"
echo "ENCRYPTION_KEY=$ENCRYPTION_KEY"

unset APP_KEYS API_TOKEN_SALT ADMIN_JWT_SECRET TRANSFER_TOKEN_SALT ENCRYPTION_KEY
