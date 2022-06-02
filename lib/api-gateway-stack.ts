import { Construct } from 'constructs';
import { ConfigService } from '../config-service';
import { ApiGatewayExtendedStack } from './class/api-gateway-extented-stack';
import { LambdaStackProps } from './props/lambda-stack-props';
import { Route53Props } from './props/route53-stack-props';
import {
  getItemProfileSchema,
  getParameterCommandSchema,
  putItemProfileSchema,
  updateItemProfileSchema
} from './schema/schema-properties';

interface CustomProps extends Route53Props, LambdaStackProps {}

export class ApiGatewayStack extends ApiGatewayExtendedStack {
  config = new ConfigService().getConfig();

  constructor(scope: Construct, id: string, props: CustomProps) {
    super(scope, id, props);

    const {
      hostedZone,
      getParameterCommand,
      putItemProfile,
      getItemProfile,
      updateItemProfile
    } = props!;

    //CREATE PROJECT API, CERTIFICATE AND ROUTE 53
    const fotoApi = this.createApi(
      'poolers',
      this.config.project.stage,
      hostedZone
    );

    //API GATEWAY API CONSTRUCTOR
    this.apiConstructor(
      fotoApi,
      this.config.project.name,
      'config',
      hostedZone,
      getParameterCommand!,
      getParameterCommandSchema
    );
    this.apiConstructor(
      fotoApi,
      this.config.project.name,
      'createProfile',
      hostedZone,
      putItemProfile!,
      putItemProfileSchema
    );
    this.apiConstructor(
      fotoApi,
      this.config.project.name,
      'getProfile',
      hostedZone,
      getItemProfile!,
      getItemProfileSchema
    );
    this.apiConstructor(
      fotoApi,
      this.config.project.name,
      'updateProfile',
      hostedZone,
      updateItemProfile!,
      updateItemProfileSchema
    );
  }
}
