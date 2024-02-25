import { Exception, Span, SpanStatusCode, trace } from "@opentelemetry/api";
import { exec } from "child_process";

const tracer = trace.getTracer("dice-lib");

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

    try {
      throw new Error("error sample");
    } catch (e) {
      if (!(e instanceof Error)) {
        throw e;
      }

      span.recordException(e);
      span.setStatus({ code: SpanStatusCode.ERROR });
    }

    span.end();
    return results;
  });
};
