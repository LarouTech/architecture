import { Stack, StackProps } from "aws-cdk-lib";
import { AuthorizationType, CfnAuthorizer, JsonSchema, JsonSchemaType, JsonSchemaVersion, LambdaIntegration, Method, MethodOptions, Model, PassthroughBehavior, RequestValidator, Resource, RestApi } from "aws-cdk-lib/aws-apigateway";
import { CertificateValidation, DnsValidatedCertificate, ICertificate } from "aws-cdk-lib/aws-certificatemanager";
import { IFunction } from "aws-cdk-lib/aws-lambda";
import { ARecord, IHostedZone, RecordTarget } from "aws-cdk-lib/aws-route53";
import { ApiGateway } from "aws-cdk-lib/aws-route53-targets";
import { Construct } from "constructs";
import { ConfigService, STAGE } from "../../config-service";
import { Route53Props } from "../props/route53-stack-props";

export enum HttpMethod {
    'GET' = 'GET',
    'POST' = 'POST',
    'DELETE' = 'DELETE',
    'HEAD' = 'HEAD',
    'PATCH' = 'PATCH',
    'PUT' = 'PUT'
}

export class ApiGatewayExtendedStack extends Stack {
    config = new ConfigService().getConfig()

    constructor(scope: Construct, id: string, props: StackProps) {
        super(scope, id, props);
    }


    apiConstructor(api: RestApi, name: string, path: string, hostedZone: IHostedZone, lambdaFn: IFunction, schema: { [name: string]: JsonSchema }, authorizer?: CfnAuthorizer) {
        const requestModel = this.defineRequestBodyMappingModel(api, path, schema)
        const ressource = this.addApiRessource(api, path)
        const integrationResponse = this.addIntegrationResponse(lambdaFn)
        const validator = this.requestValidator(api, path)
        const methodOptions = this.addMethodOptions(requestModel, validator, authorizer)
        const apiMethod = this.addApiMethod(api, path, HttpMethod.POST, integrationResponse, methodOptions)
    }

    createApi(name: string, stage: string, hostedZone: IHostedZone): RestApi {
        const api = new RestApi(this, `${this.config.project.name}-${name}-restapi`, {
            deployOptions: {
                stageName: stage,
            },
            restApiName: `${name}-${this.config.project.stage}`,
            defaultCorsPreflightOptions: {
                allowOrigins: ['*'],
                allowHeaders: [
                    'Content-Type',
                    'X-Amz-Date',
                    'Authorization',
                    'X-Api-Key',
                    'X-Amz-Security-Token',
                    'authorization',
                    'authorizer'
                ],
                allowMethods: ['GET', 'POST', 'DELETE', 'UPDATE', 'PATCH', 'OPTIONS'],
                statusCode: 200
            },
            domainName: {
                domainName: `${name}.${this.config.project.domain.name}`,
                certificate: new DnsValidatedCertificate(this, `${name}-certificate`, {
                    domainName: `${this.config.project.name}.${this.config.project.domain.name}`,
                    hostedZone: hostedZone,
                    validation: CertificateValidation.fromDns(),
                    region: process.env.AWS_REGION
                }),
            },

        });

        new ARecord(this, `${this.config.project.name}-${name}-route53Arecord`, {
            zone: hostedZone,
            target: RecordTarget.fromAlias(new ApiGateway(api)),
            recordName: `${this.config.project.name}.${this.config.project.domain.name}`,
        })

        return api

    }


    //DEFINE REQUEST BODY MAPPING MODEL
    private defineRequestBodyMappingModel(api: RestApi, modelName: string, properties: { [name: string]: JsonSchema }): Model {
        return new Model(this, `${this.config.project.name}-${modelName}-model`, {
            restApi: api,
            schema: {
                schema: JsonSchemaVersion.DRAFT7,
                title: modelName,
                type: JsonSchemaType.OBJECT,
                properties: properties,

            },
            contentType: 'application/json',
            modelName: modelName,
        });
    }

    //CREATE REQUEST VALIDATOR
    requestValidator(api: RestApi, name: string): RequestValidator {
        return new RequestValidator(this, `${this.config.project.name}-validator-${name}`, {
            restApi: api,
            requestValidatorName: name,
            validateRequestBody: true,
            validateRequestParameters: true,
        })
    }

    //ADD API RESSOURCE
    addApiRessource(api: RestApi, name: string): Resource {
        const resource = api.root.addResource(name);
        return resource
    }

    //ADD LAMBDA INTEGRATION RESPONSE
    addIntegrationResponse(lambdaFn: IFunction): LambdaIntegration {
        return new LambdaIntegration(lambdaFn, {
            proxy: false,
            integrationResponses: [{
                statusCode: '200',
                responseParameters: {
                    'method.response.header.Access-Control-Allow-Origin': "'*'",
                }
            }],
            passthroughBehavior: PassthroughBehavior.WHEN_NO_MATCH,
        },
        );
    }

    //ADD METHOD OPTIONS
    addMethodOptions(model: Model, validator: RequestValidator, authorizer?: CfnAuthorizer): MethodOptions {
        return {
            authorizationType: authorizer ? AuthorizationType.COGNITO : AuthorizationType.NONE,
            authorizer: authorizer ? { authorizerId: authorizer!.ref } : undefined,
            methodResponses: [
                {
                    statusCode: '200',
                    responseParameters: {
                        'method.response.header.Access-Control-Allow-Origin': true,
                    }
                },
            ],
            requestModels: {
                'application/json': model
            },
            requestValidator: validator,
        };
    }

    //ADD API METHOD
    addApiMethod(api: RestApi, path: string, method: HttpMethod, integrationResponse: LambdaIntegration, options: MethodOptions): Method {
        return api.root
            .resourceForPath(path)
            .addMethod(method, integrationResponse, options)
    }
}