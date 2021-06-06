import { DynamoDB } from 'aws-sdk';

export const getDynamoDBClient = () => new DynamoDB.DocumentClient();
