import { StackProps } from "aws-cdk-lib";
import { IFunction } from "aws-cdk-lib/aws-lambda";


export interface LambdaStackProps extends StackProps {
    getParameterCommand?: IFunction,
    putItemProfile?: IFunction,
    getItemProfile: IFunction,
    updateItemProfile: IFunction;

}