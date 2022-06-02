import { env } from 'process';

export enum STAGE {
  'DEV' = 'dev',
  'STE' = 'ste'
}

export enum AwsRegions {
  'US_EAST_1' = 'us-east-1'
}

export interface ConfigServiceProps {
  project: {
    name: string;
    stage: STAGE | string;
    domain: {
      name: string;
    };
  };
  aws: {
    region: AwsRegions;
  };
}

export class ConfigService {
  getConfig() {
    return {
      project: {
        name: 'poolers',
        stage: STAGE.DEV,
        domain: {
          name: 'techkronik.com'
        }
      },
      aws: {
        region: AwsRegions.US_EAST_1
      }
    } as ConfigServiceProps;
  }
}
