// This is your "Get Collector's Alert History" API route.
// Final path: `pages/api/collectors/[collectorId]/alerts.ts`

/*
--- HOW TO TEST ---

1. Make sure you have claimed a few alerts with a specific collector.
2. In Postman, create a new request:
   - Method: GET
   - URL: http://localhost:3000/api/collectors/[PASTE_THE_COLLECTOR_USER_ID_HERE]/alerts
3. Send the request. You should get a 200 OK response with a list of all alerts
   claimed by that collector, separated into "active" and "completed" jobs.

*/

import type { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';

import prisma from '../../../../lib/prisma';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  try {
    const { collectorId } = req.query;

    if (!collectorId) {
      return res.status(400).json({ message: 'Collector User ID is required.' });
    }

    // --- 1. Find the Collector's Profile ID ---
    // We need the profile ID to find the alerts they claimed.
    const collectorProfile = await prisma.collectorProfile.findUnique({
        where: { userId: collectorId as string },
        select: { id: true }
    });

    if (!collectorProfile) {
        return res.status(404).json({ message: 'Collector profile not found.' });
    }

    // --- 2. Fetch all alerts claimed by this collector ---
    const allClaimedAlerts = await prisma.wasteAlert.findMany({
      where: {
        claimedById: collectorProfile.id,
      },
      orderBy: {
        updatedAt: 'desc', // Show most recently updated alerts first
      },
      include: {
        createdBy: { // Include household user's details
          select: {
            householdProfile: {
              select: {
                name: true,
                address: true,
              }
            }
          }
        },
        review: true // Include the review if one was left
      },
    });

    // --- 3. Separate alerts into active and completed for easier frontend display ---
    const activeAlerts = allClaimedAlerts.filter(
      (alert) => alert.status === 'CLAIMED' || alert.status === 'IN_TRANSIT'
    );
    const completedAlerts = allClaimedAlerts.filter(
      (alert) => alert.status === 'COMPLETED' || alert.status === 'CANCELLED'
    );


    // --- 4. Return Success Response ---
    return res.status(200).json({
        activeAlerts,
        completedAlerts
    });

  } catch (error: any) {
    console.error("Get Collector Alerts Error:", error);
    return res.status(500).json({ message: 'An error occurred on the server.' });
  }
}
