import "dotenv/config";

import Fastify from "fastify";
import fastifyCors from "@fastify/cors";

import { fetchSchedulesWithStops, mbta } from "./mbta";

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

fastify.get("/stops/near/:lat/:long", async (req, res) => {
	const stops = await mbta.fetchStops({
		latitude: 42.34919,
		longitude: -71.10404,
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

fastify.setErrorHandler((err, req, res) => {
	fastify.log.error(err);

	res.status(500).send();
});

fastify.listen({
	port: parseInt(process.env.PORT ?? "3000"),
	host: "::",
});

