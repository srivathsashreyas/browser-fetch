import { jest } from '@jest/globals';
import interceptRequest from '../src/utils/events.js';

describe('interceptRequest', () => {
  it('should add default CORS headers if none are provided', async () => {
    const mockFetch = {
      requestPaused: (callback) => {
        callback({
          requestId: '1',
          request: { url: 'http://example.com' },
          responseHeaders: [],
          responseStatusCode: 200,
        });
      },
      fulfillRequest: jest.fn(async ({ responseHeaders }) => {
        expect(responseHeaders).toEqual(
          expect.arrayContaining([
            expect.objectContaining({ name: 'Access-Control-Allow-Origin' }),
          ])
        );
      }),
    };

    interceptRequest(mockFetch, 'http://example.com', [], (err) => {
      expect(err).toBeFalsy();
    });
  });

  it('should add (only) custom CORS headers if provided', async () => {
    const mockFetch = {
      requestPaused: (callback) => {
        callback({
          requestId: '1',
          request: { url: 'http://example.com' },
          responseHeaders: [],
          responseStatusCode: 200,
        });
      },
      fulfillRequest: jest.fn(async ({ responseHeaders }) => {
        expect(responseHeaders).toEqual(
          expect.arrayContaining([
            expect.objectContaining({ name: 'Access-Control-Allow-Methods' }),
          ])
        );
        expect(responseHeaders).toEqual(
          expect.arrayContaining([
            expect.not.objectContaining({ name: 'Access-Control-Allow-Origin' }),
          ])
        );
      }),
    };

    interceptRequest(mockFetch, 'http://example.com', [{
      name: 'Access-Control-Allow-Methods',
      value: 'POST,PATCH',
    }], (err) => {
      expect(err).toBeFalsy();
    });
  });
});