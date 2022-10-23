import MBTA from "mbta-client";
import format from "date-fns/format";

export const mbta = new MBTA(process.env.MBTA_API_KEY);

export async function fetchSchedulesWithStops(stopName: string, limit = 3) {
	console.log(format(new Date(), "HH:mm"));
	let schedules = await mbta.fetchSchedules({
		stop: stopName,
		min_time: format(new Date(), "HH:mm"),
		include: "stop",
		sort: "arrival_time",
		limit,
	});

	const stops = await mbta.selectIncluded(schedules, "stop");
	schedules.data.forEach((schedule: any) => {
		schedule.stop = stops.find(
			(stop: any) => stop.id === schedule.relationships.stop.data.id
		);
	});

	schedules = schedules.data.map((schedule: any) => {
		return {
			arrivalTime: schedule.attributes.arrival_time,
			departureTime: schedule.attributes.departure_time,
			directionId: schedule.attributes.direction_id,
			// dropOffType: schedule.attributes.drop_off_type,
			// pickupType: schedule.attributes.pickup_type,
			// stopHeadsign: schedule.attributes.stop_headsign,
			// stopSequence: schedule.attributes.stop_sequence,
			// timepoint: schedule.attributes.timepoint,
			type: schedule.type,
			id: schedule.id,
			stop: {
				name: schedule.stop.attributes.name,
				type: schedule.stop.type,
				id: schedule.stop.id,
			},
		};
	});
	return schedules;
}
