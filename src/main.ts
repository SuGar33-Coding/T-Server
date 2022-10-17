import { serve } from "../deps.ts";
import { JSONResponse } from "./util.ts";

function handler(req: Request): Response {
	const { pathname: path } = new URL(req.url);

	console.debug(`${req.method} ${path}`);

	switch (path) {
		case "/secret":
			return new Response("You found me!!");
		case "/hi":
			return JSONResponse({
				msg: "Hi",
			});
		default:
			return new Response(null, { status: 404 });
	}
}

serve(handler, { port: parseInt(Deno.env.get("PORT") ?? "8000") });
