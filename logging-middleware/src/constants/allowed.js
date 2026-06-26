const ALLOWED_STACKS = ['backend', 'frontend'];

const ALLOWED_LEVELS = ['debug', 'info', 'warn', 'error', 'fatal'];

const BACKEND_PACKAGES = [
  'cache',
  'controller',
  'cron_job',
  'db',
  'domain',
  'handler',
  'repository',
  'route',
  'service',
];

const FRONTEND_PACKAGES = [
  'api',
  'component',
  'hook',
  'page',
  'state',
  'style',
];

const SHARED_PACKAGES = ['auth', 'config', 'middleware', 'utils'];

const PACKAGE_MAP = {
  backend: [...BACKEND_PACKAGES, ...SHARED_PACKAGES],
  frontend: [...FRONTEND_PACKAGES, ...SHARED_PACKAGES],
};

export { ALLOWED_STACKS, ALLOWED_LEVELS, PACKAGE_MAP };