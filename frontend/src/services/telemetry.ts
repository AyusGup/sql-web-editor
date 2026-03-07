import { ApplicationInsights } from '@microsoft/applicationinsights-web';

const appInsights = new ApplicationInsights({
    config: {
        connectionString: import.meta.env.VITE_APPLICATIONINSIGHTS_CONNECTION_STRING,
        enableAutoRouteTracking: true, // Automatically track route changes (SPA)
        enableCorsCorrelation: true,
        enableRequestHeaderTracking: true,
        enableResponseHeaderTracking: true,
    }
});

if (import.meta.env.VITE_APPLICATIONINSIGHTS_CONNECTION_STRING) {
    appInsights.loadAppInsights();
}

export { appInsights };
