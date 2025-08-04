import { PrismaClient } from '@prisma/client';
import prisma from '../../../lib/prisma';

export default async function handler(req, res) {
  const { userId } = req.query;

  if (req.method !== 'DELETE') {
    res.setHeader('Allow', ['DELETE']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  // TODO: Add admin role verification here for security

  try {
    // Deleting the user will also delete their associated profile
    // because of the `onDelete: Cascade` rule in your Prisma schema.
    await prisma.user.delete({
      where: {
        id: userId,
      },
    });

    res.status(200).json({ message: 'User deleted successfully.' });
  } catch (error) {
    console.error(`Failed to delete user ${userId}:`, error);
    res.status(500).json({ message: 'Failed to delete user.' });
  }
}
