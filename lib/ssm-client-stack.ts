import { Stack, StackProps } from "aws-cdk-lib";
import { UserPool } from "aws-cdk-lib/aws-cognito";
import { ParameterDataType, ParameterType, StringListParameter, StringParameter } from "aws-cdk-lib/aws-ssm";
import { Construct } from "constructs";
import { AwsRegions, ConfigService } from "../config-service";
import { CognitoStackProps } from "./props/cognito-stack-props";
import { DynamodbProfileStackProps } from "./props/dynamodb-profile-stack-props";
import { S3PictureRepoStackProps } from "./props/s3-picture-repo-stack-props";

interface AppParameter {
    project: {
        name: string,
        domainName: string
    },
    region: string
    cognito: {
        userPoolId: string,
        userPoolClientId: string,
        identityPoolId: string
    },
    dynamodb: {
        profileTablename: string,
    },
    s3: {
        pictureRepoBucketName: string
    }
}

interface CustomProps extends CognitoStackProps, DynamodbProfileStackProps, S3PictureRepoStackProps { }

export class SsmClientStack extends Stack {
    config = new ConfigService().getConfig()

    constructor(scope: Construct, id: string, props?: CustomProps) {
        super(scope, id, props);

        const { userPool, userPoolClient, identityPool, profileTable, pictureRepoBucket } = props!

        //CREATE PARAMS IN AWS PARAMETER STORE
        const parameter: AppParameter = {
            cognito: {
                userPoolId: userPool.userPoolId,
                userPoolClientId: userPoolClient.userPoolClientId,
                identityPoolId: identityPool!.ref,
            },
            region: this.config.aws.region,
            project: {
                name: this.config.project.name,
                domainName: this.config.project.domain.name
            },
            dynamodb: {
                profileTablename: profileTable.tableName
            },
            s3: {
                pictureRepoBucketName: pictureRepoBucket.bucketName
            }
        }
        this.createStringParameter('config', parameter)

    }

    //METHOD THAT CREATE A STRING PARAMETER FOR AWS PARAMETER STORE
    private createStringParameter(paramName: string, value: AppParameter) {
        const test = new StringParameter(this, `${this.config.project.name}-${paramName}`, {
            stringValue: JSON.stringify(value),
            dataType: ParameterDataType.TEXT,
            type: ParameterType.STRING,
            parameterName: `/${this.config.project.name}/${this.config.project.stage}/${paramName}`,
        })
    }
}