import { jest } from '@jest/globals';

//required to mock the default export of chrome-remote-interface 
//when using esm with jest
//without this we get error CDP.mockResolvedValue is not a function
jest.unstable_mockModule('chrome-remote-interface', () => ({
  default: jest.fn()
}));
const CDP = (await import('chrome-remote-interface')).default;
const { returnTargets, returnDomains } = await import('../src/utils/utils.js');


jest.mock('chrome-remote-interface');

describe('Utils', () => {
  beforeEach(() => {
    CDP.List = jest.fn();
    CDP.List.mockResolvedValue(
      [
        { id: '1', title: 'example', url: 'http://one.com', type: 'page' },
      ]
    );

    CDP.Activate = jest.fn();
    CDP.Activate.mockResolvedValue({});

    CDP.mockResolvedValue({
      Runtime: {
        evaluate: jest.fn().mockResolvedValue({
          result: { value: 'response text' },
        }),
      },
      Fetch: {
        enable: jest.fn(),
      },
      Page: {
        enable: jest.fn(),
      },
      Network: {
        enable: jest.fn(),
        setCacheDisabled: jest.fn(),
      },
      close: jest.fn(),
    })
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should throw an error if no matching target is found', async () => {
    await expect(returnTargets('invalid-domain', 9222, 'page')).rejects.toThrow(
      'Target for invalid-domain'
    );
  });

  it('should return a client object for a valid target', async () => {
    const client = await returnDomains('one', 9222, 'page');
    expect(client).toBeDefined();
  });
});