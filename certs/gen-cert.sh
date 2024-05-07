#!/bin/sh

# Resources: https://github.com/bitnami/containers/blob/main/bitnami/mongodb/README.md#enabling-ssltls

# Generate a new private key 
openssl genrsa -out mongoCA.key 2048

# Generate the public certificate for your CA
openssl req -x509 -new \
    -subj "/C=US/ST=NY/L=New York/O=Example Corp/OU=IT Department/CN=mongoCA" \
    -key mongoCA.key -out mongoCA.crt
# Generate a self-signed certificate for the server
# openssl req -x509 -newkey rsa:4096 -keyout key.pem -out cert.pem -days 365 -nodes
