export function JSONResponse(
  res: Record<string, unknown>,
  init?: ResponseInit
) {
  const newInit: ResponseInit = init ?? {};

  newInit.headers = {
    "content-type": "application/json; charset=UTF-8",
  };

  return new Response(JSON.stringify(res), newInit);
}
