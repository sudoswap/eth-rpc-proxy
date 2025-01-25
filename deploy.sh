#!/usr/bin/env bash

# Load .env into environment
export $(cat .env | xargs)

# Create a temporary app.yaml
cp app.yaml app.yaml.secret

# Insert environment variables
cat <<EOF >> app.yaml.secret
env_variables:
  LOCAL_NODE: "$LOCAL_NODE"
  MEV_NODE: "$MEV_NODE"
EOF

# Deploy
gcloud app deploy --appyaml=app.yaml.secret

# Clean up
#rm app.yaml.secret
