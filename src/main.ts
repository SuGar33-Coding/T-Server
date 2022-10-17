import "dotenv/config";
import Fastify from "fastify";
import fastifyCors from "@fastify/cors";

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

fastify.setErrorHandler((err, req, res) => {
	fastify.log.error(err);

	res.status(500).send();
});

fastify.listen({
	port: parseInt(process.env.PORT ?? "3000"),
});
