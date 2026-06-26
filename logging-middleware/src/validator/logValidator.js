import { ALLOWED_STACKS, ALLOWED_LEVELS, PACKAGE_MAP } from '../constants/allowed.js';

function validateLogInput(stack, level, pkg, message) {
  const errors = [];

  if (!stack || typeof stack !== 'string') {
    errors.push('stack is required and must be a string');
  } else if (!ALLOWED_STACKS.includes(stack)) {
    errors.push(`stack must be one of: ${ALLOWED_STACKS.join(', ')}`);
  }

  if (!level || typeof level !== 'string') {
    errors.push('level is required and must be a string');
  } else if (!ALLOWED_LEVELS.includes(level)) {
    errors.push(`level must be one of: ${ALLOWED_LEVELS.join(', ')}`);
  }

  if (!pkg || typeof pkg !== 'string') {
    errors.push('package is required and must be a string');
  } else if (stack && ALLOWED_STACKS.includes(stack)) {
    const validPackages = PACKAGE_MAP[stack];
    if (!validPackages.includes(pkg)) {
      errors.push(
        `package "${pkg}" is not valid for stack "${stack}". Allowed: ${validPackages.join(', ')}`
      );
    }
  }

  if (!message || typeof message !== 'string' || message.trim() === '') {
    errors.push('message is required and must be a non-empty string');
  }

  return errors;
}

export { validateLogInput };