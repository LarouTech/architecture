import { GetParameterCommand, SSMClient } from '@aws-sdk/client-ssm';
import { fromEnv } from '@aws-sdk/credential-provider-env';

interface EventProps {
  region: string;
  parameterName: string;
}

export const main = async (event: EventProps) => {
  const client = new SSMClient({
    credentials: fromEnv(),
    region: event.region
  });

  const command = new GetParameterCommand({
    Name: event.parameterName
  });

  try {
    const response = await client.send(command);
    return response.Parameter;
  } catch (error) {
    console.log(error);
    return error;
  }
};
