import { serve } from "../deps.ts";
import { JSONResponse } from "./util.ts";

function handler(_req: Request): Response {
	const { pathname: path } = new URL(_req.url);

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

serve(handler);
