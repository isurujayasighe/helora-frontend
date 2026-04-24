declare global {
  interface Window {
    __APP_CONFIG__: {
      API_URL: string;
      IDENTITY_BASE_URL: string;
      ROOT_DOMAIN: string;
      PRODUCT_CODE: string;
      LANDING_PAGE_URL: string;
    };
  }
}

export {};