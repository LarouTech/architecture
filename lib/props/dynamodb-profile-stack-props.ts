import { StackProps } from "aws-cdk-lib";
import { Table } from "aws-cdk-lib/aws-dynamodb";

export interface DynamodbProfileStackProps extends StackProps {
    profileTable: Table,
}