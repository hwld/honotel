import { Span, metrics, trace } from "@opentelemetry/api";

const tracer = trace.getTracer("dice-lib");
const meter = metrics.getMeter("dice-lib");

const rollOnce = (i: number, min: number, max: number): number => {
  return tracer.startActiveSpan(`rollOnce:${i}`, (span: Span) => {
    const result = Math.floor(Math.random() * (max - min) + min);
    span.setAttribute("dicelib.rolled", result);
    span.end();
    return result;
  });
};

export const rollTheDice = (
  rolls: number,
  min: number,
  max: number
): number[] => {
  return tracer.startActiveSpan("rollTheDice", (span: Span) => {
    const results = [...new Array(rolls)].map((_, i) => rollOnce(i, min, max));
    span.end();
    return results;
  });
};
