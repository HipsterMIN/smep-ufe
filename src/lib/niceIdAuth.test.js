import { beforeEach, describe, expect, it, vi } from 'vitest';

import { api } from './apiClient';
import { NICE_ID_AUTH_ERROR_CODES, openNiceIdAuth } from './niceIdAuth';

vi.mock('./apiClient', () => ({
  api: {
    post: vi.fn(),
  },
}));

const captureMessageHandler = () => {
  let handler = null;
  vi.spyOn(window, 'addEventListener').mockImplementation((type, listener) => {
    if (type === 'message') {
      handler = listener;
    }
  });

  return () => handler;
};

const createPopupMessage = (popup, data, origin = window.location.origin) => ({
  data,
  origin,
  source: popup,
});

const flushAuthSetup = async () => {
  await Promise.resolve();
  await Promise.resolve();
};

describe('openNiceIdAuth', () => {
  beforeEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
    api.post.mockReset();
  });

  it('invalid svcTypes returns controlled failure without API call', async () => {
    const result = await openNiceIdAuth({ svcTypes: [] });

    expect(result).toMatchObject({
      success: false,
      errorCode: NICE_ID_AUTH_ERROR_CODES.invalidSvcTypes,
    });
    expect(api.post).not.toHaveBeenCalled();
  });

  it('requests auth-url through the common API endpoint only once', async () => {
    vi.spyOn(window, 'open').mockReturnValue(null);
    api.post.mockResolvedValue({ authUrl: 'https://nice.example.test/auth' });

    await openNiceIdAuth({ svcTypes: ['M', 'F', 'M'] });

    expect(api.post).toHaveBeenCalledTimes(1);
    expect(api.post).toHaveBeenCalledWith('/v1/nice-id/auth-url', {
      svcTypes: ['M', 'F'],
    });
  });

  it('popup blocked returns controlled failure', async () => {
    vi.spyOn(window, 'open').mockReturnValue(null);
    api.post.mockResolvedValue({ authUrl: 'https://nice.example.test/auth' });

    const result = await openNiceIdAuth({ svcTypes: ['M'] });

    expect(result).toMatchObject({
      success: false,
      errorCode: NICE_ID_AUTH_ERROR_CODES.popupBlocked,
    });
  });

  it('success message resolves resultKey and cleans up listener', async () => {
    vi.useFakeTimers();
    const popup = {
      focus: vi.fn(),
    };
    const getMessageHandler = captureMessageHandler();
    const removeEventListenerSpy = vi.spyOn(window, 'removeEventListener');

    vi.spyOn(window, 'open').mockReturnValue(popup);
    api.post.mockResolvedValue({ authUrl: 'https://nice.example.test/auth' });

    const promise = openNiceIdAuth({ svcTypes: ['M'], timeoutMs: 1000 });
    await flushAuthSetup();

    getMessageHandler()(
      createPopupMessage(popup, {
        type: 'NICE_ID_AUTH_SUCCESS',
        resultKey: 'result-key',
      }),
    );

    await expect(promise).resolves.toEqual({
      success: true,
      resultKey: 'result-key',
    });
    expect(removeEventListenerSpy).toHaveBeenCalledWith('message', expect.any(Function));
  });

  it('foreign origin message is ignored until timeout', async () => {
    vi.useFakeTimers();
    const popup = {
      focus: vi.fn(),
    };
    const getMessageHandler = captureMessageHandler();

    vi.spyOn(window, 'open').mockReturnValue(popup);
    api.post.mockResolvedValue({ authUrl: 'https://nice.example.test/auth' });

    const promise = openNiceIdAuth({ svcTypes: ['M'], timeoutMs: 1000 });
    await flushAuthSetup();

    getMessageHandler()(
      createPopupMessage(
        popup,
        {
          type: 'NICE_ID_AUTH_SUCCESS',
          resultKey: 'result-key',
        },
        'https://evil.example.test',
      ),
    );

    await vi.advanceTimersByTimeAsync(1000);

    await expect(promise).resolves.toMatchObject({
      success: false,
      errorCode: NICE_ID_AUTH_ERROR_CODES.timeout,
    });
  });

  it('backend callback error message returns controlled failure', async () => {
    const popup = {
      focus: vi.fn(),
    };
    const getMessageHandler = captureMessageHandler();

    vi.spyOn(window, 'open').mockReturnValue(popup);
    api.post.mockResolvedValue({ authUrl: 'https://nice.example.test/auth' });

    const promise = openNiceIdAuth({ svcTypes: ['M'] });
    await flushAuthSetup();

    getMessageHandler()(
      createPopupMessage(popup, {
        type: 'NICE_ID_AUTH_ERROR',
        errorCode: 'NICE_TRANSACTION_NOT_FOUND',
        message: '인증 요청을 찾을 수 없습니다.',
      }),
    );

    await expect(promise).resolves.toEqual({
      success: false,
      errorCode: 'NICE_TRANSACTION_NOT_FOUND',
      message: '인증 요청을 찾을 수 없습니다.',
    });
  });
});
