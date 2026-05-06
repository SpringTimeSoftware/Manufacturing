import "@testing-library/jest-dom/vitest";
import { afterEach, beforeEach, vi } from "vitest";

beforeEach(() => {
  localStorage.clear();

  vi.stubGlobal(
    "fetch",
    vi.fn(async (input: string | URL | Request) => {
      const url = typeof input === "string" ? input : input instanceof URL ? input.toString() : input.url;

      if (url.includes("/api/localization/resources")) {
        return new Response(
          JSON.stringify({
            success: true,
            message: null,
            data: {
              languageCode: "en-IN",
              resources: {}
            },
            errors: [],
            meta: {
              correlationId: "test-correlation-id",
              timestampUtc: "2026-04-18T00:00:00Z"
            }
          }),
          {
            status: 200,
            headers: {
              "Content-Type": "application/json"
            }
          }
        );
      }

      throw new Error(`Unexpected fetch request in test: ${url}`);
    })
  );
});

afterEach(() => {
  vi.restoreAllMocks();
  localStorage.clear();
});
