#!/usr/bin/env node
import 'source-map-support/register';
import { App } from 'aws-cdk-lib';
import { CognitoStack } from '../lib/cognito-stack';
import { SsmClientStack } from '../lib/ssm-client-stack';
import { LambdaStack } from '../lib/lambda-stack';
import { ApiGatewayStack } from '../lib/api-gateway-stack';
import { Route53Stack } from '../lib/route53-stack';
import { DynamodbProfileStack } from '../lib/dynamodb-profile-stack';
import { S3PictureRepoStack } from '../lib/s3-picture-repo-stack';

export interface StackEnvironment {
  env: {
    region: string,
    account: string
  }
}

const environment: StackEnvironment = {
  env: {
    account: process.env.CDK_DEFAULT_ACCOUNT!,
    region: process.env.CDK_DEFAULT_REGION!
  }
};

const app = new App();

const { pictureRepoBucket } = new S3PictureRepoStack(app, 'S3PictureRepoStack', {
  ...environment
})

const { userPool, userPoolClient, identityPool } = new CognitoStack(app, 'CognitoStack', {
  ...environment,
  pictureRepoBucket: pictureRepoBucket
});

const { hostedZone } = new Route53Stack(app, 'Route53Stack', {
  ...environment
})

const { getParameterCommand, putItemProfile, getItemProfile, updateItemProfile } = new LambdaStack(app, 'LambdaStack', {
  ...environment
})

const { profileTable } = new DynamodbProfileStack(app, 'DynamodbProfileStack', {
  ...environment
})

new SsmClientStack(app, 'SsmClientStack', {
  ...environment,
  userPool: userPool,
  userPoolClient: userPoolClient,
  identityPool: identityPool,
  profileTable: profileTable,
  pictureRepoBucket: pictureRepoBucket
})

new ApiGatewayStack(app, 'ApiGatewayStack', {
  ...environment,
  getParameterCommand: getParameterCommand,
  putItemProfile: putItemProfile,
  getItemProfile: getItemProfile,
  updateItemProfile: updateItemProfile,
  hostedZone: hostedZone
})