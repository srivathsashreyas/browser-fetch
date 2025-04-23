import { jest } from '@jest/globals';

//required to mock the default export of chrome-remote-interface 
//when using esm with jest
//without this we get error CDP.mockResolvedValue is not a function
jest.unstable_mockModule('chrome-remote-interface', () => ({
    default: jest.fn()
}));
const CDP = (await import('chrome-remote-interface')).default;
const browserFetch = (await import('../src/app.js')).default;

describe('browserFetch', () => {
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

    it('should return an error if the domain is invalid', async () => {
        const response = await browserFetch('invalid-domain', 'http://example.com');
        expect(response.error).toBeTruthy();
    });

    it('should return a response object with status and text if the domain is open', async () => {
        const response = await browserFetch('one', 'http://one.com', {}, false, [], 9222, 'page');
        expect(response.status).toBeDefined();
        expect(response.text).toBeDefined();
    });
});