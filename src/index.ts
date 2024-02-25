import { serve } from "@hono/node-server";
import { Hono } from "hono";
import "./instrumentation";
import { rollTheDice } from "./dice";

const app = new Hono();

app.get("/rolldice", (c) => {
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
