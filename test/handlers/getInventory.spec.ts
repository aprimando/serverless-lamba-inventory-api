import * as sinon from 'sinon';
import * as chai from 'chai';
import chaiAsPromised from 'chai-as-promised';

import { handler } from '../../src/handlers/getInventory';
import { inventory } from '../../src/services';
import { http } from '../../src/helpers';
import {
  OK,
  NOT_FOUND,
  INTERNAL_SERVER_ERROR
} from 'http-status-codes';

chai.use(chaiAsPromised);

const expect = chai.expect;

describe('getInventory', () => {
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

    let inventoryGetListStub: sinon.SinonStub;
    let httpResponseSpy: sinon.SinonSpy;

    beforeEach(() => {
      inventoryGetListStub = sandbox.stub(inventory, 'getList');
      httpResponseSpy = sandbox.spy(http, 'response');
    });
    
    it(`should return a ${OK} and be able to search the list of inventory items`, async () => {
      const items = [{
        id: 'test-id',
        name: 'test-item-name',
        quantity: 20,
        unitPrice: 30
      }];

      inventoryGetListStub.resolves(items);

      event.queryStringParameters = {
        name: items[0].name
      };

      const res = await handler(event, context);

      expect(res).to.eql({
        statusCode: OK,
        body: JSON.stringify({
          items
        })
      });
      expect(inventoryGetListStub.calledWithExactly(
        {
          name: items[0].name 
        }
      )).to.be.true;
      expect(httpResponseSpy.calledWithExactly(
        OK,
        { 
          items
        }
      )).to.be.true;
    });

    it(`should return a ${OK} and be able to get list of inventory items`, async () => {
      const items = [{
        id: 'test-id',
        name: 'test-item-name',
        quantity: 20,
        unitPrice: 30
      }];

      inventoryGetListStub.resolves(items);

      event.queryStringParameters = {};

      const res = await handler(event, context);

      expect(res).to.eql({
        statusCode: OK,
        body: JSON.stringify({
          items
        })
      });
      expect(inventoryGetListStub.calledWithExactly(
        {
          name: ''
        }
      )).to.be.true;
      expect(httpResponseSpy.calledWithExactly(
        OK,
        { 
          items
        }
      )).to.be.true;
    });

    it(`should return a ${NOT_FOUND} error if inventory item not found`, async () => {
      inventoryGetListStub.resolves([]);

      const res = await handler(event, context);

      expect(res).to.eql({
        statusCode: NOT_FOUND,
        body: JSON.stringify({
          message: 'Inventory item not found.'
        })
      });
      expect(httpResponseSpy.calledWithExactly(
        NOT_FOUND,
        { 
          message: 'Inventory item not found.'
        }
      )).to.be.true;
    });

    it(`should return a ${INTERNAL_SERVER_ERROR} error if something went wrong`, async () => {
      inventoryGetListStub.rejects();

      const res = await handler(event, context);

      expect(res).to.eql({
        statusCode: INTERNAL_SERVER_ERROR,
        body: JSON.stringify({
          message: 'Something went wrong.'
        })
      });
      expect(httpResponseSpy.calledWithExactly(
        INTERNAL_SERVER_ERROR,
        { 
          message: 'Something went wrong.'
        }
      )).to.be.true;
    });
  });
});
