import { serve } from "@hono/node-server";
import { Hono } from "hono";
import "./instrumentation";
import { rollTheDice } from "./dice";
import { HTTPException } from "hono/http-exception";
import { SpanStatusCode, trace } from "@opentelemetry/api";
import { logs, SeverityNumber } from "@opentelemetry/api-logs";

const tracer = trace.getTracer("backend", "1.0");
const logger = logs.getLogger("backend", "1.0");

const app = new Hono();

app.onError((err, c) => {
  const activeSpan = trace.getActiveSpan();
  activeSpan?.recordException(err);
  activeSpan?.setStatus({ code: SpanStatusCode.ERROR });

  if (err instanceof HTTPException) {
    return err.getResponse();
  }
  return c.text("Internal Server Error", 500);
});

app.use("*", async (c, next) => {
  tracer.startActiveSpan(`${c.req.path}`, async (span) => {
    await next();
    span.end();
  });
});

app.get("/error", () => {
  throw new HTTPException(400);
});

app.get("/internal-error", () => {
  throw new Error("internal");
});

app.get("/rolldice", (c) => {
  logger.emit({
    severityNumber: SeverityNumber.INFO,
    severityText: "INFO",
    body: "start rolldice",
  });

  const rollsQuery = c.req.query("rolls");
  const rolls = rollsQuery ? parseInt(rollsQuery.toString()) : NaN;
  if (isNaN(rolls)) {
    return c.text("Request parameter 'rolls' is missing or not a number.", 400);
  }
  return c.text(JSON.stringify(rollTheDice(rolls, 1, 6)));
});

const port = 3000;
console.log(`Server is running on port ${port}`);

serve({
  fetch: app.fetch,
  port,
});
