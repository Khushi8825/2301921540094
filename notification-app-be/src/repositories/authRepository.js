import prisma from '../config/database.js';
import { Log } from '../../../logging-middleware/src/middleware/logger.js';

async function findUserByEmail(email) {
  await Log('backend', 'debug', 'repository', `Finding user by email: ${email}`);
  return prisma.user.findUnique({ where: { email } });
}

async function findUserById(id) {
  await Log('backend', 'debug', 'repository', `Finding user by id: ${id}`);
  return prisma.user.findUnique({ where: { id } });
}

async function createUser(data) {
  await Log('backend', 'info', 'repository', `Creating user: ${data.email}`);
  return prisma.user.create({
    data,
    select: { id: true, email: true, name: true, rollNo: true, createdAt: true },
  });
}

export { findUserByEmail, findUserById, createUser };