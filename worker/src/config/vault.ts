import { DefaultAzureCredential } from "@azure/identity";
import { SecretClient } from "@azure/keyvault-secrets";
import logger from "../config/logger";

export async function loadVaultSecrets() {
    // 1. Check if we should skip Vault entirely (local development offline)
    if (
        process.env.NODE_ENV === "development" ||
        process.env.NODE_ENV === "test"
    ) {
        logger.info(`Running in ${process.env.NODE_ENV} mode. Skipping Azure Key Vault.`);
        return;
    }

    // 2. Check for Vault URL
    const vaultUrl = process.env.AZURE_KEY_VAULT_URL;
    if (!vaultUrl) {
        logger.warn("AZURE_KEY_VAULT_URL is not set. Falling back to local .env");
        return;
    }

    try {
        logger.info(`Connecting to Azure Key Vault: ${vaultUrl}`);

        const credential = new DefaultAzureCredential();
        const client = new SecretClient(vaultUrl, credential);

        // List of secrets we expect to fetch from the vault for the backend
        const secretsToFetch = [
            { vaultKey: "postgres-admin-password", envKey: "POSTGRES_PASSWORD" }
        ];

        for (const secret of secretsToFetch) {
            try {
                const fetchedSecret = await client.getSecret(secret.vaultKey);
                if (fetchedSecret.value) {
                    process.env[secret.envKey] = fetchedSecret.value;
                    // Note: Avoid logging the actual secret value
                    logger.info(`Successfully loaded secret: ${secret.vaultKey} -> process.env.${secret.envKey}`);
                }
            } catch (err: any) {
                logger.error(`Failed to fetch secret '${secret.vaultKey}': ${err.message}`);
                // Depending on your requirements, you could throw here to crash the app 
                // if a critical secret is missing.
                throw err;
            }
        }

        logger.info("All Azure Key Vault secrets loaded successfully.");
    } catch (error: any) {
        logger.error(`Error connecting to Azure Key Vault: ${error.message}`);
        throw error;
    }
}
