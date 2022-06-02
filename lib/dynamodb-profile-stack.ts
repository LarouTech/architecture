import { RemovalPolicy, Stack, StackProps } from 'aws-cdk-lib';
import {
  AttributeType,
  BillingMode,
  Table,
  TableEncryption
} from 'aws-cdk-lib/aws-dynamodb';
import { Construct } from 'constructs';
import { ConfigService } from '../config-service';

export class DynamodbProfileStack extends Stack {
  public readonly profileTable: Table;
  public readonly fotoTable: Table;
  private config = new ConfigService().getConfig();

  constructor(scope: Construct, id: string, props: StackProps) {
    super(scope, id, props);

    this.profileTable = new Table(this, `${this.config.project.name}-profile`, {
      partitionKey: {
        name: 'id',
        type: AttributeType.STRING
      },
      tableName: `${this.config.project.name}-profile`,
      removalPolicy: RemovalPolicy.DESTROY
    });
  }
}
