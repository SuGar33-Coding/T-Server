FROM denoland/deno:alpine

# The port that your application listens to.
# EXPOSE 1993

WORKDIR /usr/src/app
COPY ./ /usr/src/app
# Prefer not to run as root.
# USER deno

RUN deno cache deps.ts

# These steps will be re-run upon each file change in your working directory:
ADD . .
# Compile the main app so that it doesn't need to be compiled each startup/entry.
RUN deno cache src/main.ts

CMD ["run", "--allow-net", "--allow-env=PORT", "src/main.ts"]
