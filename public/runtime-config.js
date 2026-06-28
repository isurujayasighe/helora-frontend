window.__APP_CONFIG__ = {
  API_URL:
    window.__APP_CONFIG__?.API_URL ||
    "https://api.heloralabs.co.uk/api/v1",

    // "https://helora-backend-production.up.railway.app/api/v1",

    //  "https://api-test.heloralabs.co.uk/api/v1",

  IDENTITY_BASE_URL:
    window.__APP_CONFIG__?.IDENTITY_BASE_URL ||
    "http://localhost:5174",

  ROOT_DOMAIN:
    window.__APP_CONFIG__?.ROOT_DOMAIN ||
    "localhost",

  PRODUCT_CODE:
    window.__APP_CONFIG__?.PRODUCT_CODE ||
    "customerportal",

  LANDING_PAGE_URL:
    window.__APP_CONFIG__?.LANDING_PAGE_URL ||
    "https://covalentworldtest.com",
};