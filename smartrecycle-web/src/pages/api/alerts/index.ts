// This is your "View Pending Alerts" API route.
// Final path: `pages/api/alerts/index.ts`

/*
--- HOW TO TEST ---

1. Make sure you have registered a COLLECTOR and noted their user ID.
   (e.g., the dummy collector who accepts ["E_WASTE", "RECYCLABLE", "GENERAL"])
2. Make sure you have created a few alerts with DIFFERENT waste types.
3. Send a GET request to /api/alerts in Postman.
4. Add a "Header" in Postman:
   - Key: x-user-id
   - Value: [the ID of the registered COLLECTOR user]
5. You should only see alerts that match the collector's accepted waste types.

*/

import type { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  try {
    // --- 1. Authentication (Now Mandatory) ---
    const collectorId = req.headers['x-user-id'] as string;

    if (!collectorId) {
      return res.status(401).json({ message: 'Unauthorized. Collector ID is required.' });
    }

    // --- 2. Fetch Collector's Profile to Get Their Preferences ---
    const collectorProfile = await prisma.collectorProfile.findUnique({
      where: { userId: collectorId },
      select: {
        id: true, // Get the profile ID for the rejection query
        acceptedWasteTypes: true,
        user: {
            select: { role: true }
        }
      },
    });

    if (!collectorProfile || collectorProfile.user?.role !== 'COLLECTOR') {
      return res.status(403).json({ message: 'Forbidden. User is not a valid collector.' });
    }

    // --- 3. Get a list of alert IDs that this collector has already rejected ---
    const rejectedAlertIds = await prisma.alertRejection.findMany({
        where: { collectorId: collectorProfile.id },
        select: { alertId: true },
    }).then(rejections => rejections.map(r => r.alertId));


    // --- 4. Fetch Filtered Pending Alerts ---
    const pendingAlerts = await prisma.wasteAlert.findMany({
      where: {
        status: 'PENDING',
        wasteType: {
          in: collectorProfile.acceptedWasteTypes,
        },
        // ADDED: This filter excludes the alerts the collector has rejected
        id: {
            notIn: rejectedAlertIds,
        }
      },
      orderBy: {
        createdAt: 'asc',
      },
      include: {
        createdBy: {
          select: {
            householdProfile: {
              select: {
                name: true,
              },
            },
          },
        },
      },
    });

    // --- 5. Return Success Response ---
    return res.status(200).json({ alerts: pendingAlerts });

  } catch (error: any) {
    console.error("Fetch Alerts Error:", error);
    return res.status(500).json({ message: 'An error occurred on the server.' });
  }
}
