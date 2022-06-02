import { Duration, Stack, StackProps } from "aws-cdk-lib";
import { Effect, PolicyDocument, PolicyStatement, Role, ServicePrincipal } from "aws-cdk-lib/aws-iam";
import { Code, ILayerVersion, LayerVersion, Runtime } from "aws-cdk-lib/aws-lambda";
import { NodejsFunction } from "aws-cdk-lib/aws-lambda-nodejs";
import { Construct } from "constructs";
import * as path from 'path'
import { ConfigService } from "../../config-service";

export class LambdaExtendedStack extends Stack {
    config = new ConfigService().getConfig()

    constructor(scope: Construct, id: string, props: StackProps) {
        super(scope, id, props);
    }

    //METHOD THTA CREATE A LAMBDA LAYER
    createLambdaLayer(name: string, layerPath: string) {
        return new LayerVersion(this, name, {
            code: Code.fromAsset(layerPath),
            compatibleRuntimes: [Runtime.NODEJS_14_X],
            description: `${name} for nodejs lambda`,
            layerVersionName: name,
        });
    }

    //METHOD THTA CREATE A LAMBDA FUNCTION
    createLambdaFunction(name: string, filePath: string, layers: ILayerVersion[], role?: any) {
        return new NodejsFunction(this, `${this.config.project.name}-${name}`, {
            runtime: Runtime.NODEJS_14_X,
            handler: 'main',
            layers: layers,
            functionName: `${this.config.project.name}-${name}`,
            role: role,
            timeout: Duration.seconds(5),
            entry: path.join(__dirname, `../../${filePath}`),
        });
    };

}