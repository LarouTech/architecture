import { Stack, StackProps } from "aws-cdk-lib";
import { Effect, ManagedPolicy, PolicyDocument, PolicyStatement, Role, ServicePrincipal } from "aws-cdk-lib/aws-iam";
import { IFunction } from "aws-cdk-lib/aws-lambda";
import { Construct } from "constructs";
import { ConfigService } from "../config-service";
import { LambdaExtendedStack } from "./class/lambda-extended-stack";

export class LambdaStack extends LambdaExtendedStack {
    config = new ConfigService().getConfig()
    public readonly getParameterCommand: IFunction;
    public readonly putItemProfile: IFunction;
    public readonly getItemProfile: IFunction;
    public readonly updateItemProfile: IFunction;

    constructor(scope: Construct, id: string, props: StackProps) {
        super(scope, id, props);

        const lambdaPath = 'src/lambda/lib'

        //CREATE POLICY DOCUMENT
        const ssmClientPolicy = new PolicyDocument({
            statements: [
                new PolicyStatement({
                    effect: Effect.ALLOW,
                    actions: ['ssm:getParameter'],
                    resources: ['*']
                })
            ]
        })

        const dynamodbClientPolicy = new PolicyDocument({
            statements: [
                new PolicyStatement({
                    effect: Effect.ALLOW,
                    actions: ['dynamodb:PutItem', 'dynamodb:GetItem', 'dynamodb:PutItem', 'dynamodb:UpdateItem'],
                    resources: ['*']
                })
            ]
        })

        //CREATE IAM ROLE
        const ssmClientRole = new Role(this, `${this.config.project.name}-ssmClient-role`, {
            roleName: `${this.config.project.name}SsmClientRole`,
            assumedBy: new ServicePrincipal('lambda.amazonaws.com'),
            inlinePolicies: {
                ssmClientPolicy: ssmClientPolicy
            }
        })

        const dynamodbClientRole = new Role(this, `${this.config.project.name}-dynamodb-role`, {
            roleName: `${this.config.project.name}DynamodbtRole`,
            assumedBy: new ServicePrincipal('lambda.amazonaws.com'),
            inlinePolicies: {
                ssmClientPolicy: dynamodbClientPolicy
            }
        })

        //LAMBDA MANAGE POLICY
        const lambdaManagedPolicy = ManagedPolicy.fromAwsManagedPolicyName(
            'service-role/AWSLambdaBasicExecutionRole'
        );

        ssmClientRole.addManagedPolicy(lambdaManagedPolicy)
        dynamodbClientRole.addManagedPolicy(lambdaManagedPolicy)

        //DEFINE LAMBDA LAYERS
        const ssmClientLayer = this.createLambdaLayer('ssmClientLayer', 'src/layers/ssm-client')
        const credentialProviderLayer = this.createLambdaLayer('credentialProviderLayer', 'src/layers/credential-provider-env');
        const rxjsLayer = this.createLambdaLayer('rxjs', 'src/layers/rxjs')
        const dynamodbLayer = this.createLambdaLayer('dynamodb', 'src/layers/dynamodb')


        //DEFINE LAMBDA
        this.getParameterCommand = this.createLambdaFunction(
            'getParamter',
            `${lambdaPath}/getParameterCommand.ts`,
            [credentialProviderLayer, ssmClientLayer],
            ssmClientRole
        );

        this.putItemProfile = this.createLambdaFunction(
            'putItemProfile',
            `${lambdaPath}/putItemProfile.ts`,
            [credentialProviderLayer, rxjsLayer, dynamodbLayer],
            dynamodbClientRole
        );

        this.getItemProfile = this.createLambdaFunction(
            'getItemProfile',
            `${lambdaPath}/getItemProfile.ts`,
            [credentialProviderLayer, rxjsLayer, dynamodbLayer],
            dynamodbClientRole
        );

        this.updateItemProfile = this.createLambdaFunction(
            'updateItemProfile',
            `${lambdaPath}/updateItemProfile.ts`,
            [credentialProviderLayer, rxjsLayer, dynamodbLayer],
            dynamodbClientRole)

    }

}