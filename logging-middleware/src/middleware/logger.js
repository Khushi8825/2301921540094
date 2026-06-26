import { validateLogInput } from '../validator/logValidator.js';
import { sendLog } from '../services/logServices.js';

async function Log(stack, level, pkg, message) {
  const errors = validateLogInput(stack, level, pkg, message);

  if (errors.length > 0) {
    const errorSummary = errors.join(' | ');
    console.error(`[AffordMed Logger] Validation failed: ${errorSummary}`);
    return { success: false, errors };
  }

  try {
    const result = await sendLog(stack, level, pkg, message);
    return { success: true, logID: result.logID, message: result.message };
  } catch (err) {
    console.error(`[AffordMed Logger] Failed to send log: ${err.message}`);
    return { success: false, error: err.message };
  }
}

export { Log };