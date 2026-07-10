import { mockBackend } from "./mocks/backend";
import type { backendInterface } from "./backend.d";

// Re-export types for convenience
export * from "./backend.d";

// Use the Mock backend by default (Backend-less mode)
export const backend: backendInterface = mockBackend;

// Compatibility class if any code uses `new Backend()`
export class Backend {
  constructor() {
    return mockBackend as any;
  }
}
