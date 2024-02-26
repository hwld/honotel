import { diag, DiagConsoleLogger, DiagLogLevel } from "@opentelemetry/api";
import { OTLPMetricExporter } from "@opentelemetry/exporter-metrics-otlp-proto";
import { OTLPTraceExporter } from "@opentelemetry/exporter-trace-otlp-proto";
import { HostMetrics } from "@opentelemetry/host-metrics";
import { Resource } from "@opentelemetry/resources";
import {
  MeterProvider,
  PeriodicExportingMetricReader,
} from "@opentelemetry/sdk-metrics";
import { NodeSDK } from "@opentelemetry/sdk-node";
import { SemanticResourceAttributes } from "@opentelemetry/semantic-conventions";

diag.setLogger(new DiagConsoleLogger(), DiagLogLevel.INFO);

const sdk = new NodeSDK({
  resource: new Resource({
    [SemanticResourceAttributes.SERVICE_NAME]: "honotel",
    [SemanticResourceAttributes.SERVICE_VERSION]: "1.0",
  }),
  traceExporter: new OTLPTraceExporter({}),
  metricReader: new PeriodicExportingMetricReader({
    exporter: new OTLPMetricExporter({}),
    exportIntervalMillis: 10000,
  }),
});

const hostMetrics = new HostMetrics({
  meterProvider: new MeterProvider({
    readers: [
      new PeriodicExportingMetricReader({
        exporter: new OTLPMetricExporter(),
        exportIntervalMillis: 10000,
      }),
    ],
  }),
  name: "host-metrics",
});

sdk.start();
hostMetrics.start();
