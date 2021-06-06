import * as sinon from 'sinon';
import * as chai from 'chai';
import chaiAsPromised from 'chai-as-promised';

import { handler } from '../../src/handlers/createInventoryItem';
import { inventory } from '../../src/services';
import { http } from '../../src/helpers';
import {
  INTERNAL_SERVER_ERROR,
  UNPROCESSABLE_ENTITY,
  NOT_FOUND,
  BAD_REQUEST,
  CREATED
} from 'http-status-codes';
import { InventoryItem } from '../../src/interfaces';

chai.use(chaiAsPromised);

const expect = chai.expect;

describe('createInventoryItem', () => {
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

  describe('#handler', () => {
    const event = {} as any;
    const context = {} as any;

    let inventoryCreateStub: sinon.SinonStub;
    let inventoryGetListStub: sinon.SinonStub;
    let httpResponseSpy: sinon.SinonSpy;

    const item = {
      name: 'test-item-name',
      quantity: 20,
      unitPrice: 30
    } as InventoryItem;

    beforeEach(() => {
      inventoryCreateStub = sandbox.stub(inventory, 'create');
      inventoryGetListStub = sandbox.stub(inventory, 'getList');
      httpResponseSpy = sandbox.spy(http, 'response');
    });

    it(`should return a ${CREATED} success and be able to create new inventory item`, async () => {
      const itemId = 'test-item-id';

      inventoryGetListStub.resolves([]);
      inventoryCreateStub.resolves(itemId);

      event.body = item;

      const res = await handler(event, context);

      expect(res).to.eql({
        statusCode: CREATED,
        body: JSON.stringify({
          message: `Successfully created new inventory item: ${itemId}`
        })
      });
      expect(inventoryGetListStub.calledOnceWithExactly({ name: item.name })).to.be.true;
      expect(inventoryCreateStub.calledOnceWithExactly(item)).to.be.true;
      expect(httpResponseSpy.calledWithExactly(
        CREATED,
        { 
          message: `Successfully created new inventory item: ${itemId}`
        }
      )).to.be.true;
    });

    it(`should return a ${BAD_REQUEST} error if unable create new inventory item`, async () => {
      inventoryGetListStub.resolves([]);
      inventoryCreateStub.resolves(undefined);

      event.body = item;

      const res = await handler(event, context);

      expect(res).to.eql({
        statusCode: BAD_REQUEST,
        body: JSON.stringify({
          message: 'Failed to create new inventory item.'
        })
      });
      expect(inventoryGetListStub.calledOnceWithExactly({ name: item.name })).to.be.true;
      expect(inventoryCreateStub.calledOnceWithExactly(item)).to.be.true;
      expect(httpResponseSpy.calledWithExactly(
        BAD_REQUEST,
        { 
          message: 'Failed to create new inventory item.'
        }
      )).to.be.true;
    });

    it(`should return a ${INTERNAL_SERVER_ERROR} error and be able to catch error while creating a new inventory item`, async () => {
      inventoryGetListStub.resolves([]);
      inventoryCreateStub.rejects();

      event.body = item;

      const res = await handler(event, context);

      expect(res).to.eql({
        statusCode: INTERNAL_SERVER_ERROR,
        body: JSON.stringify({
          message: 'Something went wrong.'
        })
      });
      expect(inventoryCreateStub.calledOnceWithExactly(item)).to.be.true;
      expect(httpResponseSpy.calledWithExactly(
        INTERNAL_SERVER_ERROR,
        { 
          message: 'Something went wrong.'
        }
      )).to.be.true;
    });

    it(`should return a ${UNPROCESSABLE_ENTITY} and be able to validate new inventory item payload`, async () => {
      inventoryCreateStub.resolves();

      event.body = {
        quantity: 20
      };

      const res = await handler(event, context);

      expect(res).to.eql({
        statusCode: UNPROCESSABLE_ENTITY,
        body: JSON.stringify({
          message: 'Please enter name, quantity and unit price.'
        })
      });
      expect(inventoryCreateStub.notCalled).to.be.true;
      expect(httpResponseSpy.calledWithExactly(
        UNPROCESSABLE_ENTITY,
        { 
          message: 'Please enter name, quantity and unit price.'
        }
      )).to.be.true;
    });

    it(`should return a ${BAD_REQUEST} and not be able to create an item if exists`, async () => {
      inventoryGetListStub.resolves([item]);

      event.body = item;

      const res = await handler(event, context);

      expect(res).to.eql({
        statusCode: BAD_REQUEST,
        body: JSON.stringify({
          message: `${item.name} already exists.`
        })
      });
      expect(inventoryGetListStub.calledOnceWithExactly({ name: item.name })).to.be.true;
      expect(inventoryCreateStub.notCalled).to.be.true;
      expect(httpResponseSpy.calledWithExactly(
        BAD_REQUEST,
        { 
          message: `${item.name} already exists.`
        }
      )).to.be.true;
    });
  });
});