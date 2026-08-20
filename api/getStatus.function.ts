export default function () {
  return {
    status: "online",
    timestamp: new Date().toISOString(),
    environment: "Dynatrace",
    appName: "DYANE",
    appVersion: "0.0.0",
  };
}
