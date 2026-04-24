import { appConfig } from "@/config/runtime-config";

type SubdomainContext = {
  prefix: string;
  environment: string;
};

const ENV_SUFFIXES = ["dev", "qa", "stage", "uat", "prod"] as const;

function extractNameAndEnv(value: string): { name: string; env?: string } {
  const parts = value.toLowerCase().split("-");

  if (parts.length > 1) {
    const lastPart = parts[parts.length - 1];

    if (ENV_SUFFIXES.includes(lastPart as (typeof ENV_SUFFIXES)[number])) {
      return {
        name: parts.slice(0, -1).join("-"),
        env: lastPart,
      };
    }
  }

  return { name: value.toLowerCase() };
}

export function getSubdomain(): SubdomainContext | null {
  const hostname = window.location.hostname.toLowerCase().split(":")[0];

  const rootDomain = (appConfig.ROOT_DOMAIN || "localhost").toLowerCase();
  const productCode = (appConfig.PRODUCT_CODE || "customerportal").toLowerCase();

  if (hostname === "localhost" || hostname === rootDomain) {
    return null;
  }

  if (!hostname.endsWith(`.${rootDomain}`)) {
    return null;
  }

  const subdomainPart = hostname.slice(0, -(rootDomain.length + 1));
  const hostParts = subdomainPart.split(".");

  if (hostParts.length !== 2) {
    return null;
  }

  const [tenantPart, productPart] = hostParts;

  const tenantResult = extractNameAndEnv(tenantPart);
  const productResult = extractNameAndEnv(productPart);

  if (!tenantResult.name) {
    return null;
  }

  if (productResult.name !== productCode) {
    return null;
  }

  if (
    tenantResult.env &&
    productResult.env &&
    tenantResult.env !== productResult.env
  ) {
    return null;
  }

  const environment = productResult.env || tenantResult.env || "prod";

  return {
    prefix: tenantResult.name,
    environment,
  };
}