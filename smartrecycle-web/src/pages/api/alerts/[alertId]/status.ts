// This is your "Update Alert Status" API route.
// Final path: `pages/api/alerts/[alertId]/status.ts`

/*
--- HOW TO TEST ---

1. First, claim an alert using the /claim endpoint. Note the alert's ID.
2. Get the ID of the collector who claimed it.
3. In Postman, create a new request:
   - Method: PUT
   - URL: http://localhost:3000/api/alerts/[PASTE_ALERT_ID_HERE]/status
4. Go to the "Body" tab, select "raw" and "JSON", and add the new status
   and the collector's ID for verification.

   // To mark as in transit:
   {
       "status": "IN_TRANSIT",
       "collectorId": "[PASTE_COLLECTOR_USER_ID_HERE]"
   }

   // To mark as completed:
   {
       "status": "COMPLETED",
       "collectorId": "[PASTE_COLLECTOR_USER_ID_HERE]"
   }

5. Send the request. You should get a 200 OK with the updated alert.

*/

import type { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient, AlertStatus } from '@prisma/client';

const prisma = new PrismaClient();

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'PUT') {
    res.setHeader('Allow', ['PUT']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  try {
    // --- 1. Get IDs and new status from request ---
    const { alertId } = req.query;
    const { status, collectorId } = req.body;

    if (!alertId || !status || !collectorId) {
      return res.status(400).json({ message: 'Alert ID, new status, and Collector ID are required.' });
    }

    // Validate the provided status
    const validStatuses: AlertStatus[] = ['IN_TRANSIT', 'COMPLETED', 'CANCELLED'];
    if (!validStatuses.includes(status)) {
        return res.status(400).json({ message: 'Invalid status provided.' });
    }

    // --- 2. Fetch the alert and its collector for validation ---
    const alert = await prisma.wasteAlert.findUnique({
        where: { id: alertId as string },
        include: {
            claimedBy: { // Include the profile of the collector who claimed it
                select: { userId: true }
            }
        }
    });

    if (!alert) {
        return res.status(404).json({ message: 'Alert not found.' });
    }

    // --- 3. Authorization and State Validation ---
    // Check if the request is coming from the collector who actually claimed the alert
    if (alert.claimedBy?.userId !== collectorId) {
        return res.status(403).json({ message: 'Forbidden. You are not authorized to update this alert.' });
    }

    // Check for valid status transitions
    if (status === 'IN_TRANSIT' && alert.status !== 'CLAIMED') {
        return res.status(409).json({ message: 'Cannot mark as "In Transit". Alert must be in "Claimed" status.' });
    }
    if (status === 'COMPLETED' && alert.status !== 'IN_TRANSIT') {
        return res.status(409).json({ message: 'Cannot mark as "Completed". Alert must be in "In Transit" status.' });
    }


    // --- 4. Update the status and log the change in a transaction ---
    const updatedAlert = await prisma.$transaction(async (tx) => {
        const alertUpdate = await tx.wasteAlert.update({
            where: { id: alertId as string },
            data: {
                status: status as AlertStatus,
            },
        });

        await tx.statusLog.create({
            data: {
                alertId: alertUpdate.id,
                status: status as AlertStatus,
                notes: `Status updated to ${status} by collector.`,
            },
        });

        return alertUpdate;
    });


    // --- 5. Return Success Response ---
    return res.status(200).json({ message: 'Alert status updated successfully!', alert: updatedAlert });

  } catch (error: any) {
    console.error("Update Status Error:", error);
    return res.status(500).json({ message: 'An error occurred on the server.' });
  }
}
