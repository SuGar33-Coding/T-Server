import "dotenv/config";

import Fastify from "fastify";
import fastifyCors from "@fastify/cors";

import {
	cacheAllStopsWithRoutes,
	fetchSchedulesWithStops,
	mbta,
	stops,
	routes,
} from "./mbta";

const envToLogger: {
	[key:string]: any
} = {
	development: {
		transport: {
			target: "pino-pretty",
			options: {
				translateTime: "HH:MM:ss Z",
				ignore: "pid,hostname",
			},
		},
		level: "debug"
	},
	production: true,
	test: false,
};

export const fastify = Fastify({
	logger: envToLogger[process.env.NODE_ENV!],
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

fastify.get("/routes", async (req, res) => {
	res.send(routes);
});

fastify.get("/stops", async (req, res) => {
	res.send(stops);
});

fastify.get<{
	Params: { limit: number };
}>("/stops/:limit", async (req, res) => {
	const { limit } = req.params;

	res.send(stops.slice(0, limit));
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

async function populateCache() {
	await cacheAllStopsWithRoutes();
}

populateCache().then(() => {
	fastify.listen({
		port: parseInt(process.env.PORT ?? "3000"),
		host: process.env.DOMAIN ?? "0.0.0.0",
	}).catch((err) => {
		fastify.log.error(err);
	});
});
