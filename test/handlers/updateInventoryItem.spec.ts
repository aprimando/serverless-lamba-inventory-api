import * as sinon from 'sinon';
import * as chai from 'chai';
import chaiAsPromised from 'chai-as-promised';

import { handler } from '../../src/handlers/updateInventoryItem';
import { inventory } from '../../src/services';
import { http } from '../../src/helpers';
import {
  OK,
  INTERNAL_SERVER_ERROR,
  UNPROCESSABLE_ENTITY,
  NOT_FOUND,
  BAD_REQUEST
} from 'http-status-codes';
import { InventoryItem } from '../../src/interfaces';

chai.use(chaiAsPromised);

const expect = chai.expect;

describe('updateInventoryItem', () => {
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

    let inventoryUpdateStub: sinon.SinonStub;
    let inventoryGetStub: sinon.SinonStub;
    let httpResponseSpy: sinon.SinonSpy;

    const itemId = 'test-item-id';
    const item = {
      name: 'test-item-name',
      quantity: 20,
      unitPrice: 30
    } as InventoryItem;

    beforeEach(() => {
      inventoryUpdateStub = sandbox.stub(inventory, 'update');
      inventoryGetStub = sandbox.stub(inventory, 'get');
      httpResponseSpy = sandbox.spy(http, 'response');
    });

    it(`should return a ${OK} success and be able to update inventory item`, async () => {
      inventoryGetStub.resolves(item);
      inventoryUpdateStub.resolves(itemId);

      event.body = item;
      event.pathParameters = {
        id: itemId
      };

      const res = await handler(event, context);

      expect(res).to.eql({
        statusCode: OK,
        body: JSON.stringify({
          message: `Successfully updated an inventory item: ${itemId}`
        })
      });
      expect(inventoryGetStub.calledOnceWithExactly({ id: itemId })).to.be.true;
      expect(inventoryUpdateStub.calledOnceWithExactly(itemId, item)).to.be.true;
      expect(httpResponseSpy.calledWithExactly(
        OK,
        { 
          message: `Successfully updated an inventory item: ${itemId}`
        }
      )).to.be.true;
    });

    it(`should return a ${BAD_REQUEST} error if unable to update inventory item`, async () => {
      inventoryGetStub.resolves(item);
      inventoryUpdateStub.resolves(undefined);

      event.body = item;
      event.pathParameters = {
        id: itemId
      };

      const res = await handler(event, context);

      expect(res).to.eql({
        statusCode: BAD_REQUEST,
        body: JSON.stringify({
          message: 'Failed to update an inventory item.'
        })
      });
      expect(inventoryGetStub.calledOnceWithExactly({ id: itemId })).to.be.true;
      expect(inventoryUpdateStub.calledOnceWithExactly(itemId, item)).to.be.true;
      expect(httpResponseSpy.calledWithExactly(
        BAD_REQUEST,
        { 
          message: 'Failed to update an inventory item.'
        }
      )).to.be.true;
    });


    it(`should return a ${INTERNAL_SERVER_ERROR} error and be able to catch error while updated an inventory item`, async () => {
      inventoryGetStub.resolves(item);
      inventoryUpdateStub.rejects();

      event.body = item;
      event.pathParameters = {
        id: item.id
      };

      const res = await handler(event, context);

      expect(res).to.eql({
        statusCode: INTERNAL_SERVER_ERROR,
        body: JSON.stringify({
          message: `Something went wrong.`
        })
      });
      expect(inventoryGetStub.calledOnceWithExactly({ id: item.id })).to.be.true;
      expect(inventoryUpdateStub.calledOnceWithExactly(item.id, item)).to.be.true;
      expect(httpResponseSpy.calledWithExactly(
        INTERNAL_SERVER_ERROR,
        { 
          message: `Something went wrong.`
        }
      )).to.be.true;
    });

    it(`should return a ${NOT_FOUND} error and not update non-existing inventory item`, async () => {
      inventoryGetStub.resolves(null);

      event.body = item;
      event.pathParameters = {
        id: item.id
      };

      const res = await handler(event, context);

      expect(res).to.eql({
        statusCode: NOT_FOUND,
        body: JSON.stringify({
          message: `Item not found: ${item.name}`
        })
      });
      expect(inventoryGetStub.calledOnceWithExactly({ id: item.id })).to.be.true;
      expect(inventoryUpdateStub.notCalled).to.be.true;
      expect(httpResponseSpy.calledWithExactly(
        NOT_FOUND,
        { 
          message: `Item not found: ${item.name}`
        }
      )).to.be.true;
    });

    it(`should return a ${UNPROCESSABLE_ENTITY} error and be able to validate new inventory item payload`, async () => {
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
      expect(inventoryUpdateStub.notCalled).to.be.true;
      expect(httpResponseSpy.calledWithExactly(
        UNPROCESSABLE_ENTITY,
        { 
          message: 'Please enter name, quantity and unit price.'
        }
      )).to.be.true;
    });
  });
});
