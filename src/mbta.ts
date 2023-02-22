import MBTA from "mbta-client";
import formatInTimeZone from "date-fns-tz/formatInTimeZone";

export const mbta = new MBTA(process.env.MBTA_API_KEY);

export const stops: any[] = [];

export async function fetchSchedulesWithStops(
	stopName: string,
	tz = "America/New_York",
	limit = 3
) {
	if (process.env.DEBUG) {
		console.log(formatInTimeZone(new Date(), tz, "HH:mm"));
	}
	let schedules = await mbta.fetchSchedules({
		stop: stopName,
		min_time: formatInTimeZone(new Date(), tz, "HH:mm"),
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

export async function fetchAllStops(limit?: number) {
	let stops = await mbta.fetchStops({
		limit,
	});

	return stops.data
		.map((stop: any) => {
			return {
				id: stop.id,
				name: stop.attributes.name,
				latitude: stop.attributes.latitude,
				longitude: stop.attributes.longitude,
				route_type: stop.attributes.vehicle_type,
			};
		})
		.filter((stop: any) => [0, 1, 3].includes(stop.route_type));
}

export async function cacheAllStopsWithRoutes() {
	let routes: any[] = (await mbta.fetchRoutes()).data.filter((route: any) =>
		[0, 1, 3].includes(route.attributes.type)
	);

	for (const route of routes) {
		console.debug(`fetching stops for route ${route.id}`)
		let routeStops = (await mbta.fetchStops({ route: route.id })).data.map(
			(stop: any) => {
				const ret: MBTAStop = {
					id: stop.id,
					name: stop.attributes.name,
					latitude: stop.attributes.latitude,
					longitude: stop.attributes.longitude,
					route: {
						id: route.id,
						direction_destinations: route.attributes.direction_destinations,
						direction_names: route.attributes.direction_names,
						type: route.attributes.type,
						color: route.attributes.color,
						long_name: route.attributes.long_name,
					},
				};
				return ret;
			}
		);
		stops.push(...routeStops);
	}
}
