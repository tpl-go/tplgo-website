declare module "vitest" {
  export const test: any;
  export const expect: any;
  export const vi: {
    mock: (path: string, factory: () => unknown) => void;
    fn: () => (...args: unknown[]) => unknown;
    mocked: <T>(value: T) => T & { mockClear: () => void };
  };
}
