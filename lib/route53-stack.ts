import { Stack, StackProps } from "aws-cdk-lib";
import { ARecord, HostedZone, IHostedZone, RecordTarget } from "aws-cdk-lib/aws-route53";
import { ApiGateway } from "aws-cdk-lib/aws-route53-targets";
import { Construct } from "constructs";
import { ConfigService } from "../config-service";


export class Route53Stack extends Stack {
    config = new ConfigService().getConfig()
    public readonly hostedZone: IHostedZone;

    constructor(scope: Construct, id: string, props: StackProps) {
        super(scope, id, props);

        this.hostedZone = HostedZone.fromLookup(this, `${this.config.project.name}-HostedZone`, {
            domainName: this.config.project.domain.name,
            privateZone: false
        });
    }

    //CREATE ROUTE 53 DOMAIN
    createRoute53Domain(name: string, target: RecordTarget) {
        new ARecord(this, `${this.config.project.name}-${name}-route53Arecord`, {
            zone: this.hostedZone,
            target: target,
            recordName: `${this.config.project.name.toLowerCase()}.${this.config.project.domain.name}`,
        })
    }



}