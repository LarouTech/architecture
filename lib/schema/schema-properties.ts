import { JsonSchemaType } from 'aws-cdk-lib/aws-apigateway';

export const getParameterCommandSchema = {
  region: {
    type: JsonSchemaType.STRING,
    description: 'aws region'
  },
  parameterName: {
    type: JsonSchemaType.STRING,
    description: 'aws ssm client parameter store param'
  }
};

export const putItemProfileSchema = {
  region: {
    type: JsonSchemaType.STRING,
    description: 'The aws region'
  },
  tableName: {
    type: JsonSchemaType.STRING,
    description: 'The dynamodb table name'
  }
};

export const updateItemProfileSchema = {
  region: {
    type: JsonSchemaType.STRING,
    description: 'The aws region'
  },
  tableName: {
    type: JsonSchemaType.STRING,
    description: 'The dynamodb table name'
  }
};

export const getItemProfileSchema = {
  region: {
    type: JsonSchemaType.STRING,
    description: 'The aws region'
  },
  tableName: {
    type: JsonSchemaType.STRING,
    description: 'The dynamodb table name'
  },
  profileId: {
    type: JsonSchemaType.STRING,
    description: 'The dynamodb profileId'
  }
};
