// src/types/global.d.ts
export {};

declare global {
  /** Minimal constructor typing for the Credential Management API */
  interface PasswordCredentialConstructor {
    new (data: { id: string; password: string; name?: string }): Credential;
  }

  interface Window {
    PasswordCredential?: PasswordCredentialConstructor;
  }

  interface NavigatorCredentials {
    store?: (credential: Credential) => Promise<void>;
  }

  interface Navigator {
    credentials?: NavigatorCredentials;
  }
}
