import { register, login, getProfile } from '../services/authservice.js';
import { sendSuccess } from '../utils/response.js';
import { Log } from '../../../logging-middleware/src/middleware/logger.js';

async function registerController(req, res, next) {
  try {
    const { name, email, password, rollNo } = req.body;
    const result = await register(name, email, password, rollNo);
    await Log('backend', 'info', 'controller', `Register success: ${email}`);
    return sendSuccess(res, result, 201);
  } catch (err) {
    next(err);
  }
}

async function loginController(req, res, next) {
  try {
    const { email, password } = req.body;
    const result = await login(email, password);
    await Log('backend', 'info', 'controller', `Login success: ${email}`);
    return sendSuccess(res, result);
  } catch (err) {
    next(err);
  }
}

async function profileController(req, res, next) {
  try {
    const user = await getProfile(req.user.userId);
    return sendSuccess(res, { user });
  } catch (err) {
    next(err);
  }
}

export { registerController, loginController, profileController };