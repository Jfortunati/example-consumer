import { Pact } from '@pact-foundation/pact';
import { API } from './api';
import { Matchers } from '@pact-foundation/pact';
import { Product } from './product';
const { eachLike, like, regex } = Matchers;

const mockProvider = new Pact({
  consumer: 'bearbank-payments-consumer',
  provider: process.env.PACT_PROVIDER ? process.env.PACT_PROVIDER : 'bearbank-payments-provider',
});

describe('API Pact test', () => {
  beforeAll(() => mockProvider.setup());
  afterEach(() => mockProvider.verify());
  afterAll(() => mockProvider.finalize());

  describe('retrieving a payment', () => {
    test('ID 10 exists', async () => {
      // Arrange
      const expectedPayment = { id: '10', type: 'CREDIT_CARD', amount: '10.75', currency: 'USD'}

      // Uncomment to see this fail
      //const expectedProduct = { id: '10', type: 'CREDIT_CARD', name: '28 Degrees', price: '29.00'}
      
      // Uncomment to see this fail
      //const expectedProduct = { id: '10', type: 'CREDIT_CARD', name: '28 Degrees', price: 30.0, color: "red"}

      await mockProvider.addInteraction({
        state: 'a payment with ID 10 exists',
        uponReceiving: 'a request to get a payment',
        withRequest: {
          method: 'GET',
          path: '/payment/10',
          headers: {
            Authorization: like('Bearer 2019-01-14T11:34:18.045Z'),
          },
        },
        willRespondWith: {
          status: 200,
          headers: {
            'Content-Type': regex({generate: 'application/json; charset=utf-8', matcher: 'application/json;?.*'}),
          },
          body: like(expectedPayment),
        },
      });

      // Act
      const api = new API(mockProvider.mockService.baseUrl);
      const payment = await api.getPayment('10');

      // Assert - did we get the expected response
      expect(payment).toStrictEqual(new Payment(expectedPayment));
    });

    test('payment does not exist', async () => {

        // set up Pact interactions
        await mockProvider.addInteraction({
          state: 'a payment with ID 11 does not exist',
          uponReceiving: 'a request to get a payment',
          withRequest: {
            method: 'GET',
            path: '/payment/11',
            headers: {
              'Authorization': like('Bearer 2019-01-14T11:34:18.045Z')
            }
          },
          willRespondWith: {
            status: 404
          },
        });

        const api = new API(mockProvider.mockService.baseUrl);

        // make request to Pact mock server
        await expect(api.getPayment('11')).rejects.toThrow('Request failed with status code 404');
    });
  });
  describe('retrieving payments', () => {
    test('payments exists', async () => {
      // set up Pact interactions
      const expectedPayment = { id: '10', type: 'CREDIT_CARD', amount: '10.75', currency: 'USD'}

      await mockProvider.addInteraction({
        state: 'payments exist',
        uponReceiving: 'a request to get all payments',
        withRequest: {
          method: 'GET',
          path: '/payments',
          headers: {
            Authorization: like('Bearer 2019-01-14T11:34:18.045Z'),
          },
        },
        willRespondWith: {
          status: 200,
          headers: {
            'Content-Type': regex({generate: 'application/json; charset=utf-8', matcher: 'application/json;?.*'}),
          },
          body: eachLike(expectedPayment),
        },
      });

      const api = new API(mockProvider.mockService.baseUrl);

      // make request to Pact mock server
      const payments = await api.getAllPayments()

      // assert that we got the expected response
      expect(payments).toStrictEqual([new Payment(expectedPayment)]);
    });
  });
});
