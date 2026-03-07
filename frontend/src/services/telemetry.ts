import { ApplicationInsights } from '@microsoft/applicationinsights-web';

const connectionString = import.meta.env.VITE_APPLICATIONINSIGHTS_CONNECTION_STRING;

let appInsights: any = {
    trackPageView: () => { },
    trackEvent: () => { },
    trackException: () => { },
    trackMetric: () => { },
    trackTrace: () => { },
    startTrackPage: () => { },
    stopTrackPage: () => { },
    loadAppInsights: () => { }
};

if (connectionString) {
    appInsights = new ApplicationInsights({
        config: {
            connectionString: connectionString,
            enableAutoRouteTracking: true, // Automatically track route changes (SPA)
            enableCorsCorrelation: true,
            enableRequestHeaderTracking: true,
            enableResponseHeaderTracking: true,
        }
    });

    appInsights.loadAppInsights();
}

export { appInsights };
