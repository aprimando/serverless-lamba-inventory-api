import * as sinon from 'sinon';
import * as chai from 'chai';
import chaiAsPromised from 'chai-as-promised';
import uuid from 'uuid';

import { InventoryItem } from '../../src/interfaces';
import { aws } from '../../src/helpers';
import { inventory } from '../../src/services';
import moment from 'moment';

chai.use(chaiAsPromised);

const expect = chai.expect;

describe('inventory', () => {
  let sandbox: sinon.SinonSandbox;
  let getDynamoDBClientStub: sinon.SinonStub;
  let consoleErrorStub: sinon.SinonStub;

  const { INVENTORY_TABLE_NAME } = process.env;

  before(() => {
    sandbox = sinon.createSandbox();
  });

  beforeEach(() => {
    getDynamoDBClientStub = sandbox.stub(aws, 'getDynamoDBClient');
    consoleErrorStub = sandbox.stub(console, 'error');
  });

  afterEach(() => {
    sandbox.restore();
  });

  after(() => {
    sandbox.restore();
  });

  describe('#getList', () => {
    const items = [
      {
        name: 'test-item-name',
        quantity: 20,
        unitPrice: 30
      } as InventoryItem
    ];
    let dynamoDBScanStub: sinon.SinonStub;

    beforeEach(() => {
      dynamoDBScanStub = sandbox.stub();
    });

    it('should be able get list of inventory items', async () => {
      dynamoDBScanStub.returns({
        promise: () => Promise.resolve({
          Items: items
        })
      });
      getDynamoDBClientStub.returns({
        scan: dynamoDBScanStub
      });

      const result = await inventory.getList({ name: items[0].name });

      expect(result).to.be.eql(items);
      expect(getDynamoDBClientStub.calledOnce).to.be.true;
      expect(dynamoDBScanStub.calledOnceWithExactly({
        TableName: INVENTORY_TABLE_NAME,
        IndexName: 'nameAndCreatedAt',
        FilterExpression: 'contains(#name, :name)',
        ExpressionAttributeValues: {
          ':name': items[0].name,
        },
        ExpressionAttributeNames: {
          '#name': 'name',
        },
      })).to.be.true;
      expect(consoleErrorStub.notCalled).to.be.true;
    });

    it('should be able catch error while getting list of inventory items', async () => {
      dynamoDBScanStub.returns({
        promise: () => Promise.reject('Someting went wrong.')
      });
      getDynamoDBClientStub.returns({
        scan: dynamoDBScanStub
      });

      const result = await inventory.getList({ name: items[0].name });

      expect(result).to.be.eql([]);
      expect(getDynamoDBClientStub.calledOnce).to.be.true;
      expect(dynamoDBScanStub.calledOnceWithExactly({
        TableName: INVENTORY_TABLE_NAME,
        IndexName: 'nameAndCreatedAt',
        FilterExpression: 'contains(#name, :name)',
        ExpressionAttributeValues: {
          ':name': items[0].name,
        },
        ExpressionAttributeNames: {
          '#name': 'name',
        },
      })).to.be.true;
      expect(consoleErrorStub.calledOnce).to.be.true;
    });
  });

  describe('#create', () => {
    let dynamoDBPutStub: sinon.SinonStub;
    let uuidStub: sinon.SinonStub;

    const itemId = 'test-item-id';
    const createdAt = moment().format('MM-DD-YYYY');
    const item = {
      name: 'test-item-name',
      quantity: 20,
      unitPrice: 30
    } as InventoryItem;

    beforeEach(() => {
      dynamoDBPutStub = sandbox.stub();
      uuidStub = sandbox.stub(uuid, 'v4');
    });

    it('should be able create an inventory item', async () => {
      uuidStub.returns(itemId);
      dynamoDBPutStub.returns({
        promise: () => Promise.resolve()
      });
      getDynamoDBClientStub.returns({
        put: dynamoDBPutStub
      });
      
      const result = await inventory.create(item);

      expect(result).to.be.eql(itemId);
      expect(getDynamoDBClientStub.calledOnce).to.be.true;
      expect(dynamoDBPutStub.calledOnceWithExactly({
        TableName: INVENTORY_TABLE_NAME,
        Item: {
          id: itemId,
          createdAt,
          ...item
        }
      })).to.be.true;
      expect(consoleErrorStub.notCalled).to.be.true;
    });

    it('should be able catch error while create an new iventory item', async () => {
      uuidStub.returns(itemId);
      dynamoDBPutStub.returns({
        promise: () => Promise.reject('Something went wrong')
      });
      getDynamoDBClientStub.returns({
        put: dynamoDBPutStub
      });
      
      
      const result = await inventory.create(item);

      expect(result).to.be.eql(undefined);
      expect(getDynamoDBClientStub.calledOnce).to.be.true;
      expect(dynamoDBPutStub.calledOnceWithExactly({
        TableName: INVENTORY_TABLE_NAME,
        Item: {
          id: itemId,
          createdAt,
          ...item
        }
      })).to.be.true;
      expect(consoleErrorStub.calledOnce).to.be.true;
    });   
  });

  describe('#get', () => {
    let dynamoDBGetStub: sinon.SinonStub;

    const item = {
      id: 'test-item-id',
      name: 'test-item-name',
      quantity: 20,
      unitPrice: 30,
      createdAt: '05-20-2020'
    } as InventoryItem;

    beforeEach(() => {
      dynamoDBGetStub = sandbox.stub();
    });

    it('should be able get an inventory item', async () => {
      dynamoDBGetStub.returns({
        promise: () => Promise.resolve({ Item: item })
      });
      getDynamoDBClientStub.returns({
        get: dynamoDBGetStub
      });
      
      const result = await inventory.get({ id: item.id });

      expect(result).to.be.eql(item);
      expect(getDynamoDBClientStub.calledOnce).to.be.true;
      expect(dynamoDBGetStub.calledOnceWithExactly({
        TableName: INVENTORY_TABLE_NAME,
        Key: { id: item.id }
      })).to.be.true;
      expect(consoleErrorStub.notCalled).to.be.true;
    });

    it('should be able catch error while getting an iventory item', async () => {
      dynamoDBGetStub.returns({
        promise: () => Promise.reject('Something went wrong.')
      });
      getDynamoDBClientStub.returns({
        get: dynamoDBGetStub
      });
      
      const result = await inventory.get({ id: item.id });

      expect(result).to.be.eql(undefined);
      expect(getDynamoDBClientStub.calledOnce).to.be.true;
      expect(dynamoDBGetStub.calledOnceWithExactly({
        TableName: INVENTORY_TABLE_NAME,
        Key: { id: item.id }
      })).to.be.true;
      expect(consoleErrorStub.calledOnce).to.be.true;
    });   
  });

  describe('#update', () => {
    let dynamoDBUpdateStub: sinon.SinonStub;

    const itemId = 'test-item-id';
    const item = {
      id: itemId,
      name: 'test-item-name',
      quantity: 20,
      unitPrice: 30,
      createdAt: '05-20-2020'
    } as InventoryItem;

    beforeEach(() => {
      dynamoDBUpdateStub = sandbox.stub();
    });

    it('should be able update an inventory item', async () => {
      dynamoDBUpdateStub.returns({
        promise: () => Promise.resolve()
      });
      getDynamoDBClientStub.returns({
        update: dynamoDBUpdateStub
      });
      
      await inventory.update(itemId, item);

      expect(getDynamoDBClientStub.calledOnce).to.be.true;
      expect(dynamoDBUpdateStub.calledOnceWithExactly({
        TableName: INVENTORY_TABLE_NAME,
        Key: { id: itemId },
        UpdateExpression: 'set #name = :name,' +
          'quantity = :quantity,' +
          'unitPrice = :unitPrice',
        ExpressionAttributeValues: {
          ':name': item.name,
          ':quantity': item.quantity,
          ':unitPrice': item.unitPrice
        },
        ExpressionAttributeNames: {
          '#name': 'name'
        }
      })).to.be.true;
      expect(consoleErrorStub.notCalled).to.be.true;
    });

    it('should be able catch error while deleting an inventory item', async () => {
      dynamoDBUpdateStub.returns({
        promise: () => Promise.reject('Something went wrong.')
      });
      getDynamoDBClientStub.returns({
        update: dynamoDBUpdateStub
      });
      
      await inventory.update(itemId, item);

      expect(getDynamoDBClientStub.calledOnce).to.be.true;
      expect(dynamoDBUpdateStub.calledOnceWithExactly({
        TableName: INVENTORY_TABLE_NAME,
        Key: { id: itemId },
        UpdateExpression: 'set #name = :name,' +
          'quantity = :quantity,' +
          'unitPrice = :unitPrice',
        ExpressionAttributeValues: {
          ':name': item.name,
          ':quantity': item.quantity,
          ':unitPrice': item.unitPrice
        },
        ExpressionAttributeNames: {
          '#name': 'name'
        }
      })).to.be.true;
      expect(consoleErrorStub.calledOnce).to.be.true;
    });
  });

  describe('#deleteItem', () => {
    let dynamoDBDeleteStub: sinon.SinonStub;

    const itemId = 'test-item-id';

    beforeEach(() => {
      dynamoDBDeleteStub = sandbox.stub();
    });

    it('should be able delete an inventory item', async () => {
      dynamoDBDeleteStub.returns({
        promise: () => Promise.resolve()
      });
      getDynamoDBClientStub.returns({
        delete: dynamoDBDeleteStub
      });
      
      const result = await inventory.deleteItem(itemId);

      expect(result).to.be.eql(itemId);
      expect(getDynamoDBClientStub.calledOnce).to.be.true;
      expect(dynamoDBDeleteStub.calledOnceWithExactly({
        TableName: INVENTORY_TABLE_NAME,
        Key: { id: itemId }
      })).to.be.true;
      expect(consoleErrorStub.notCalled).to.be.true;
    });

    it('should be able catch error while deleting an inventory item', async () => {
      dynamoDBDeleteStub.returns({
        promise: () => Promise.reject('Something went wrong.')
      });
      getDynamoDBClientStub.returns({
        delete: dynamoDBDeleteStub
      });
      
      const result = await inventory.deleteItem(itemId);

      expect(result).to.be.eql(undefined);
      expect(getDynamoDBClientStub.calledOnce).to.be.true;
      expect(dynamoDBDeleteStub.calledOnceWithExactly({
        TableName: INVENTORY_TABLE_NAME,
        Key: { id: itemId }
      })).to.be.true;
      expect(consoleErrorStub.calledOnce).to.be.true;
    });
  });
});
