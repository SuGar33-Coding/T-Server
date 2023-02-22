declare module "mbta-client";

type MBTAStop = {
	id: String;
	name: String;
	latitude: Number;
	longitude: Number;
	route: MBTARoute;
};

type MBTARoute = {
	id: String;
	direction_destinations?: [String, String];
	direction_names?: [String, String];
	type: RouteType;
	color: String;
	long_name: String;
};

enum RouteType {
	LIGHT_RAIL = 0,
	HEAVY_RAIL,
	COMMUTER_RAIL,
	BUS,
	FERRY,
}
