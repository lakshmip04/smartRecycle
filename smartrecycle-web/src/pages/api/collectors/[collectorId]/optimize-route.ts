// This is your "Route Optimization" API route.
// Final path: `pages/api/collectors/[collectorId]/optimize-route.ts`

/*
--- HOW TO TEST ---

1. Claim several alerts with a single collector. Note the collector's USER ID
   and the IDs of the alerts they claimed.
2. In Postman, create a new request:
   - Method: POST
   - URL: http://localhost:3000/api/collectors/[PASTE_COLLECTOR_USER_ID_HERE]/optimize-route
3. Go to the "Body" tab, select "raw" and "JSON", and add the list of alert IDs:
   {
       "alertIds": [
           "[PASTE_ALERT_ID_1]",
           "[PASTE_ALERT_ID_2]",
           "[PASTE_ALERT_ID_3]"
       ]
   }
4. Send the request. You should get a 200 OK response with the same alerts,
   but now in an optimized order for pickup.

*/

import type { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// --- Placeholder for Google Maps API Integration ---
// In a real application, this function would make a call to the Google Maps
// Directions API with the collector's start location and all the pickup
// locations as waypoints, asking for the optimized order.
async function getOptimizedRoute(
  start: { lat: number; lng: number },
  waypoints: { id: string; lat: number; lng: number }[]
) {
  console.log("Simulating Google Maps API call for route optimization...");

  // For this example, we will just simulate the result by shuffling the waypoints.
  // A real implementation would return an array of waypoint IDs in the optimized order.
  const optimizedOrder = waypoints.sort(() => Math.random() - 0.5);
  
  console.log("Optimized order determined:", optimizedOrder.map(wp => wp.id));
  return optimizedOrder;
}


export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  try {
    const { collectorId } = req.query;
    const { alertIds } = req.body;

    if (!collectorId || !Array.isArray(alertIds) || alertIds.length === 0) {
      return res.status(400).json({ message: 'Collector ID and a list of alert IDs are required.' });
    }

    // --- 1. Fetch Collector's Starting Location ---
    const collectorProfile = await prisma.collectorProfile.findUnique({
      where: { userId: collectorId as string },
    });

    if (!collectorProfile || !collectorProfile.latitude || !collectorProfile.longitude) {
      return res.status(404).json({ message: 'Collector profile not found or is missing location data.' });
    }

    // --- 2. Fetch Details for the Selected Alerts ---
    const alerts = await prisma.wasteAlert.findMany({
      where: {
        id: { in: alertIds },
        claimedById: collectorProfile.id, // Security check: ensure alerts belong to this collector
        status: 'CLAIMED', // Can only optimize routes for claimed, not-yet-serviced alerts
      },
    });

    if (alerts.length !== alertIds.length) {
        return res.status(404).json({ message: 'One or more alerts could not be found, do not belong to you, or are not in "CLAIMED" status.' });
    }

    // --- 3. Prepare Data for Optimization API ---
    const startPoint = { lat: collectorProfile.latitude, lng: collectorProfile.longitude };
    const waypoints = alerts.map(alert => ({
      id: alert.id,
      lat: alert.pickupLatitude,
      lng: alert.pickupLongitude,
    }));

    // --- 4. Get Optimized Route ---
    const optimizedWaypoints = await getOptimizedRoute(startPoint, waypoints);

    // --- 5. Reorder the original alert objects based on the optimized result ---
    const orderedAlerts = optimizedWaypoints.map(waypoint => {
        return alerts.find(alert => alert.id === waypoint.id);
    });

    // --- 6. Return the Optimized List ---
    return res.status(200).json({
      message: 'Route optimized successfully.',
      optimizedAlerts: orderedAlerts,
    });

  } catch (error: any) {
    console.error("Route Optimization Error:", error);
    return res.status(500).json({ message: 'An error occurred on the server.' });
  }
}
