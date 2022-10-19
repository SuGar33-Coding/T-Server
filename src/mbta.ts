import MBTA from "mbta-client";

export const mbta = new MBTA(process.env.MBTA_API_KEY)