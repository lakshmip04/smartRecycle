import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

export default async function handler(req, res) {
  const { alertId } = req.query;

  if (req.method !== 'GET') {
    return res.status(405).end();
  }

  try {
    const alert = await prisma.wasteAlert.findUnique({
      where: { id: alertId },
      include: {
        createdBy: {
          select: {
            householdProfile: {
              select: { name: true },
            },
          },
        },
      },
    });

    if (!alert) {
      return res.status(404).json({ message: 'Alert not found' });
    }

    res.status(200).json(alert);
  } catch (error) {
    console.error(`Error fetching alert ${alertId}:`, error);
    res.status(500).json({ message: 'Failed to fetch alert details' });
  }
}