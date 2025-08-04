import { PrismaClient } from '@prisma/client';
import prisma from '../../../../lib/prisma';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    return res.status(405).end();
  }

  try {
    const { collectorId } = req.query; // This is the User ID

    if (!collectorId) {
      return res.status(400).json({ message: 'Collector User ID is required.' });
    }

    // Find all rejections for this collector and include the full alert details
    const rejections = await prisma.alertRejection.findMany({
      where: {
        collector: {
          userId: collectorId,
        },
      },
      include: {
        alert: { // Include the full details of the rejected alert
          include: {
            createdBy: {
              select: {
                householdProfile: {
                  select: { name: true },
                },
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    // Extract just the alert objects from the rejection records
    const rejectedAlerts = rejections.map(rejection => rejection.alert);

    res.status(200).json({ rejectedAlerts });
  } catch (error) {
    console.error("Fetch Rejected Alerts Error:", error);
    res.status(500).json({ message: 'An error occurred on the server.' });
  }
}
