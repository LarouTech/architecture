import { StackProps } from "aws-cdk-lib";
import { Bucket } from "aws-cdk-lib/aws-s3";

export interface S3PictureRepoStackProps extends StackProps {
    pictureRepoBucket: Bucket
}