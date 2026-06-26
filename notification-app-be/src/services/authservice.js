import bcrypt from 'bcryptjs';
import { findUserByEmail, createUser, findUserById } from '../repositories/authRepository.js';
import { signToken } from '../config/jwt.js';
import { AppError } from '../utils/appError.js';
import { Log } from '../../../logging-middleware/src/middleware/logger.js';

async function register(name, email, password, rollNo) {
  await Log('backend', 'info', 'service', `Registration attempt for ${email}`);

  const existing = await findUserByEmail(email);
  if (existing) {
    await Log('backend', 'warn', 'service', `Registration failed: email already exists ${email}`);
    throw new AppError('Email already registered', 409);
  }

  const passwordHash = await bcrypt.hash(password, 12);

  const user = await createUser({ name, email, passwordHash, rollNo });

  await Log('backend', 'info', 'service', `User registered successfully: ${email}`);

  const token = signToken({ userId: user.id, email: user.email });

  return { user, token };
}

async function login(email, password) {
  await Log('backend', 'info', 'service', `Login attempt for ${email}`);

  const user = await findUserByEmail(email);
  if (!user) {
    await Log('backend', 'warn', 'service', `Login failed: user not found ${email}`);
    throw new AppError('Invalid credentials', 401);
  }

  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) {
    await Log('backend', 'warn', 'service', `Login failed: wrong password for ${email}`);
    throw new AppError('Invalid credentials', 401);
  }

  await Log('backend', 'info', 'service', `Login successful for ${email}`);

  const token = signToken({ userId: user.id, email: user.email });

  const { passwordHash, ...safeUser } = user;

  return { user: safeUser, token };
}

async function getProfile(userId) {
  const user = await findUserById(userId);
  if (!user) throw new AppError('User not found', 404);
  const { passwordHash, ...safeUser } = user;
  return safeUser;
}

export { register, login, getProfile };