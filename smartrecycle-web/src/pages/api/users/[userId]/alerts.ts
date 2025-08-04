// This is your "Get User's Alert History" API route.
// Final path: `pages/api/users/[userId]/alerts.ts`

/*
--- HOW TO TEST ---

1. Make sure you have created alerts with a specific household user.
2. In Postman, create a new request:
   - Method: GET
   - URL: http://localhost:3000/api/users/[PASTE_THE_HOUSEHOLD_USER_ID_HERE]/alerts
3. Send the request. You should get a 200 OK response with a list of all alerts
   created by that user.

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
    const { userId } = req.query;

    if (!userId) {
      return res.status(400).json({ message: 'User ID is required.' });
    }

    // --- 1. Fetch all alerts created by the specified user ---
    const userAlerts = await prisma.wasteAlert.findMany({
      where: {
        createdById: userId as string,
      },
      // Order by most recent first
      orderBy: {
        createdAt: 'desc',
      },
      // Include details about the collector who claimed the alert, if any
      include: {
        claimedBy: {
          select: {
            name: true,
            vehicleDetails: true,
            user: {
                select: {
                    phone: true
                }
            }
          },
        },
        // Also include the status history
        statusLogs: {
            orderBy: {
                timestamp: 'asc'
            }
        },
        review: true // Include the review if one was left
      },
    });

    // --- 2. Return Success Response ---
    return res.status(200).json({ alerts: userAlerts });

  } catch (error: any) {
    console.error("Get User Alerts Error:", error);
    return res.status(500).json({ message: 'An error occurred on the server.' });
  }
}
