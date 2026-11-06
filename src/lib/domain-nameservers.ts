const PROVIDER_DEFAULT_NS = /(mockprovider\.com|\.name\.com)$/i;

/** Keep customer-facing nameserver lists free of wholesale/default placeholders. */
export function displayNameservers(nameservers: string[]) {
  return nameservers
    .map((ns) => ns.trim())
    .filter((ns) => ns.length > 0 && !PROVIDER_DEFAULT_NS.test(ns));
}

export function isMockNameserverList(nameservers: string[]) {
  if (!nameservers.length) return false;
  return nameservers.every((ns) => PROVIDER_DEFAULT_NS.test(ns));
}
