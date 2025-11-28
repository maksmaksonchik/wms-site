#!/bin/bash

openssl req -x509 -nodes -days 365 -newkey rsa:2048 -keyout ./site.key -out ./site.crt -config ./ssl_query.conf