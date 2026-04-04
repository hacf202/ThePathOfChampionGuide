import { CognitoIdentityProviderClient } from "@aws-sdk/client-cognito-identity-provider";
import { CognitoJwtVerifier } from "aws-jwt-verify";
import { SimpleJwksCache } from "aws-jwt-verify/jwk";
import { SimpleFetcher } from "aws-jwt-verify/https";
import dotenv from "dotenv";

dotenv.config();

const { COGNITO_USER_POOL_ID, COGNITO_APP_CLIENT_ID, AWS_REGION } = process.env;

if (!AWS_REGION || !COGNITO_USER_POOL_ID || !COGNITO_APP_CLIENT_ID) {
    console.error("CRITICAL: Missing Cognito environment variables!", {
        region: !!AWS_REGION,
        poolId: !!COGNITO_USER_POOL_ID,
        clientId: !!COGNITO_APP_CLIENT_ID
    });
}

// Cấu hình fetcher với timeout 10 giây
const fetcher = new SimpleFetcher({
	defaultRequestOptions: {
		responseTimeout: 10000,
	},
});
const jwksCache = new SimpleJwksCache({ fetcher });

export const cognitoClient = new CognitoIdentityProviderClient({
	region: AWS_REGION || "us-east-1",
});

let verifierInstance = null;
try {
    if (COGNITO_USER_POOL_ID && COGNITO_APP_CLIENT_ID) {
        verifierInstance = CognitoJwtVerifier.create(
            {
                userPoolId: COGNITO_USER_POOL_ID,
                tokenUse: "id",
                clientId: COGNITO_APP_CLIENT_ID,
            },
            { jwksCache }
        );
    }
} catch (e) {
    console.error("Failed to initialize Cognito Verifier:", e.message);
}

export const verifier = verifierInstance;
