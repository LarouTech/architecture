import { StackProps } from "aws-cdk-lib";
import { CfnIdentityPool, UserPool, UserPoolClient } from "aws-cdk-lib/aws-cognito";

export interface CognitoStackProps extends StackProps {
    userPool: UserPool,
    userPoolClient: UserPoolClient,
    identityPool: CfnIdentityPool;
}