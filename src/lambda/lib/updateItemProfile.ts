import {
  AttributeValue,
  DynamoDBClient,
  GetItemCommand,
  GetItemCommandOutput,
  UpdateItemCommand,
  UpdateItemCommandOutput
} from '@aws-sdk/client-dynamodb';
import { fromEnv } from '@aws-sdk/credential-provider-env';
import { catchError, from, lastValueFrom, of, switchMap, tap } from 'rxjs';

interface Profile {
  id: string;
  email?: string;
  creationDate?: string;
  firstName?: string;
  lastName?: string;
  lastModified?: string;
  username?: string;
  cognitoSub?: string;
  imageKeyId?: string;
}
interface EventDto {
  region: string;
  tableName: string;
  item: Profile;
}

export async function main(event: EventDto): Promise<UpdateItemCommandOutput> {
  const client = new DynamoDBClient({
    region: event.region,
    credentials: fromEnv()
  });

  console.log(event);

  const command$ = of(
    new UpdateItemCommand({
      TableName: event.tableName,
      Key: {
        id: {
          S: event.item.id
        }
      },
      AttributeUpdates: {
        firstName: {
          Action: 'PUT',
          Value: {
            S: event.item.firstName!
          }
        },
        lastName: {
          Action: 'PUT',
          Value: {
            S: event.item.lastName!
          }
        },
        username: {
          Action: 'PUT',
          Value: {
            S: event.item.username!
          }
        },
        lastLogin: {
          Action: 'PUT',
          Value: {
            S: event.item.lastModified!
          }
        },
        imageKeyId: {
          Action: 'PUT',
          Value: {
            S: event.item.imageKeyId!
          }
        }
      }
    })
  );

  const response$ = command$.pipe(
    switchMap((command) => {
      return from(client.send(command));
    })
  );

  return lastValueFrom(response$);
}
