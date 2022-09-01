#!/bin/bash

# temp account and credentials
export AWS_ACCOUNT=TBD
export AWS_REGION=us-east-1
export AWS_ACCESS_KEY_ID="TBD"
export AWS_SECRET_ACCESS_KEY="TBD"
export AWS_SESSION_TOKEN="TBD"

# vars
export ENV_NAME=dev


cdk bootstrap aws://$AWS_ACCOUNT/$AWS_REGION

npm run build

cdk deploy apollo-lambda-backend-cdk-$ENV_NAME \
 --context envName=$ENV_NAME

