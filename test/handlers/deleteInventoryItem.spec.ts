import * as sinon from 'sinon';
import * as chai from 'chai';
import chaiAsPromised from 'chai-as-promised';

import { handler } from '../../src/handlers/deleteInventoryItem';
import { inventory } from '../../src/services';
import { http } from '../../src/helpers';
import {
  OK,
  INTERNAL_SERVER_ERROR,
  NOT_FOUND,
  BAD_REQUEST
} from 'http-status-codes';
import { InventoryItem } from '../../src/interfaces';

chai.use(chaiAsPromised);

const expect = chai.expect;

describe('deleteInventoryItem', () => {
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

    let inventoryDeleteItemStub: sinon.SinonStub;
    let inventoryGetStub: sinon.SinonStub;
    let httpResponseSpy: sinon.SinonSpy;

    const item = {
      id: 'test-item-id',
      name: 'test-item-name',
      quantity: 20,
      unitPrice: 30
    } as InventoryItem;

    beforeEach(() => {
      inventoryDeleteItemStub = sandbox.stub(inventory, 'deleteItem');
      inventoryGetStub = sandbox.stub(inventory, 'get');
      httpResponseSpy = sandbox.spy(http, 'response');
    });

    it(`should return a ${OK} success and be able to delete an inventory item`, async () => {
      inventoryGetStub.resolves(item);
      inventoryDeleteItemStub.resolves(item.id);

      event.pathParameters = { id: item.id };

      const res = await handler(event, context);

      expect(res).to.eql({
        statusCode: OK,
        body: JSON.stringify({
          message: `Successfully deleted an inventory item: ${item.id}`
        })
      });
      expect(inventoryGetStub.calledOnceWithExactly({ id: item.id })).to.be.true;
      expect(inventoryDeleteItemStub.calledOnceWithExactly(item.id)).to.be.true;
      expect(httpResponseSpy.calledWithExactly(
        OK,
        { 
          message: `Successfully deleted an inventory item: ${item.id}`
        }
      )).to.be.true;
    });

    it(`should return a ${BAD_REQUEST} error if unable to delete an inventory item`, async () => {
      inventoryGetStub.resolves(item);
      inventoryDeleteItemStub.resolves(undefined);

      event.pathParameters = { id: item.id };

      const res = await handler(event, context);

      expect(res).to.eql({
        statusCode: BAD_REQUEST,
        body: JSON.stringify({
          message: `Failed to delete an inventory item.`
        })
      });
      expect(inventoryGetStub.calledOnceWithExactly({ id: item.id })).to.be.true;
      expect(inventoryDeleteItemStub.calledOnceWithExactly(item.id)).to.be.true;
      expect(httpResponseSpy.calledWithExactly(
        BAD_REQUEST,
        { 
          message: `Failed to delete an inventory item.`
        }
      )).to.be.true;
    });

    it(`should return a ${NOT_FOUND} error and not be able delete a non-existing inventory item`, async () => {
      inventoryGetStub.resolves(null);

      event.pathParameters = { id: item.id };

      const res = await handler(event, context);

      expect(res).to.eql({
        statusCode: NOT_FOUND,
        body: JSON.stringify({
          message: `Item not found: ${item.id}`
        })
      });
      expect(inventoryGetStub.calledOnceWithExactly({ id: item.id })).to.be.true;
      expect(inventoryDeleteItemStub.notCalled).to.be.true;
      expect(httpResponseSpy.calledWithExactly(
        NOT_FOUND,
        { 
          message: `Item not found: ${item.id}`
        }
      )).to.be.true;
    });

    it(`should return a ${INTERNAL_SERVER_ERROR} error and be able to catch error while deleting an inventory item`, async () => {
      inventoryGetStub.resolves(item);
      inventoryDeleteItemStub.rejects();

      event.pathParameters = { id: item.id };

      const res = await handler(event, context);

      expect(res).to.eql({
        statusCode: INTERNAL_SERVER_ERROR,
        body: JSON.stringify({
          message: `Something went wrong.`
        })
      });
      expect(inventoryGetStub.calledOnceWithExactly({ id: item.id })).to.be.true;
      expect(inventoryDeleteItemStub.calledOnceWithExactly(item.id)).to.be.true;
      expect(httpResponseSpy.calledWithExactly(
        INTERNAL_SERVER_ERROR,
        { 
          message: `Something went wrong.`
        }
      )).to.be.true;
    });
  });
});
