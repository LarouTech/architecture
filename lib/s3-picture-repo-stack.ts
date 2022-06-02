import { RemovalPolicy, Stack, StackProps } from 'aws-cdk-lib';
import {
  BlockPublicAccess,
  Bucket,
  EventType,
  HttpMethods
} from 'aws-cdk-lib/aws-s3';
import { LambdaDestination } from 'aws-cdk-lib/aws-s3-notifications';
import { Construct } from 'constructs';
import { ConfigService } from '../config-service';

interface CustomProps {}

export class S3PictureRepoStack extends Stack {
  public readonly pictureRepoBucket: Bucket;
  private readonly configService = new ConfigService().getConfig();

  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    // const { createThumbnails } = props!;

    this.pictureRepoBucket = new Bucket(this, 'PictureRepoBucket', {
      autoDeleteObjects: true,
      blockPublicAccess: BlockPublicAccess.BLOCK_ALL,
      bucketName: `${this.configService.project.name}-picture-repo-bucket`,
      cors: [
        {
          allowedHeaders: ['*'],
          allowedMethods: [
            HttpMethods.GET,
            HttpMethods.PUT,
            HttpMethods.DELETE
          ],
          allowedOrigins: ['*']
        }
      ],
      removalPolicy: RemovalPolicy.DESTROY,
      versioned: true
    });

    //S3 EVENT TRIGGER
    // this.fileUploadBucket.addEventNotification(
    //     EventType.OBJECT_CREATED,
    //     new LambdaDestination(createThumbnails!),
    //     {
    //         prefix:
    //             process.env.PROJECT_NAME +
    //             '/original/'
    //     }
    // );
  }
}
