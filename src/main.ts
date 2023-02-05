import "dotenv/config";

import Fastify from "fastify";
import fastifyCors from "@fastify/cors";

import { fetchAllStops, fetchSchedulesWithStops, mbta } from "./mbta";

const fastify = Fastify({
	logger: { level: "debug" },
});

const validDomains = (process.env.CORS_ACCESS as string).split(",");
fastify.register(fastifyCors, {
	origin: validDomains.length > 1 ? validDomains : validDomains[0],
});

fastify.get("/hi", (req, res) => {
	res.send({
		msg: "Hi :)",
	});
});

fastify.get("/routes/all", async (req, res) => {
	const allRoutes = await mbta.fetchRoutes();

	res.send(allRoutes);
});

fastify.get("/stops", async (req, res) => {
	const stops = await fetchAllStops();

	res.send(stops);
});

fastify.get<{
	Params: { lat: string; long: string };
}>("/stops/near/:lat/:long", async (req, res) => {
	const { lat, long } = req.params;

	const stops = await mbta.fetchStops({
		latitude: lat,
		longitude: long,
		limit: 3,
	});

	res.send(stops);
});

fastify.get<{
	Params: { lat: string; long: string; radius: number };
}>("/stops/within/:lat/:long/:radius", async (req, res) => {
	// NOTE: Expects radius in Miles,
	// will be converted to degrees of latitude
	const { lat, long, radius } = req.params;

	const stops = await mbta.fetchStops({
		latitude: lat,
		longitude: long,
		radius: radius * 0.02,
		limit: 3,
	});

	res.send(stops);
});

fastify.get<{
	Params: { stopName: string };
}>("/schedules/:stopName", async (req, res) => {
	const { stopName } = req.params;

	let schedules = await fetchSchedulesWithStops(stopName);

	res.send(schedules);
});

fastify.get<{
	Params: { stopName: string; tz: string };
}>("/schedules/:stopName/:tz", async (req, res) => {
	const { stopName, tz } = req.params;

	let schedules = await fetchSchedulesWithStops(stopName, tz);

	res.send(schedules);
});

fastify.setErrorHandler((err, req, res) => {
	fastify.log.error(err);

	res.status(500).send();
});

fastify.listen({
	port: parseInt(process.env.PORT ?? "3000"),
	// NOTE: "::" allows the server to be accessed by other devices on LAN
	// via this device's IP addr
	host: process.env.HOST ?? "::",
});
