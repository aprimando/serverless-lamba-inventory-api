import * as sinon from 'sinon';
import * as chai from 'chai';
import chaiAsPromised from 'chai-as-promised';
import awsSdk from 'aws-sdk';


import { aws } from '../../src/helpers';

chai.use(chaiAsPromised);

const expect = chai.expect;

describe('inventory', () => {
  let sandbox: sinon.SinonSandbox;

  before(() => {
    sandbox = sinon.createSandbox();
  });

  afterEach(() => {
    sandbox.restore();
  });

  after(() => {
    sandbox.restore();
  });

  describe('#getDynamoDBClient', () => {
    let dynamoDBSpy: sinon.SinonSpy;

    beforeEach(() => {
      dynamoDBSpy = sandbox.spy(awsSdk.DynamoDB, 'DocumentClient');
    });

    it('should be able to get an AWS Dynamo instance', () => {
      const result = aws.getDynamoDBClient();

      expect(result).to.be.instanceOf(awsSdk.DynamoDB.DocumentClient);
      expect(dynamoDBSpy.calledOnce).to.be.true;
    });
  });
});