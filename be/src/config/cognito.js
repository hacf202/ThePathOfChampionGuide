// src/config/cognito.js
import { CognitoIdentityProviderClient } from "@aws-sdk/client-cognito-identity-provider";
import { CognitoJwtVerifier } from "aws-jwt-verify";
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

export const cognitoClient = new CognitoIdentityProviderClient({
	region: AWS_REGION || "us-east-1",
});

let verifierInstance = null;
try {
    if (COGNITO_USER_POOL_ID && COGNITO_APP_CLIENT_ID) {
        verifierInstance = CognitoJwtVerifier.create({
            userPoolId: COGNITO_USER_POOL_ID,
            tokenUse: "id",
            clientId: COGNITO_APP_CLIENT_ID,
        });
    }
} catch (e) {
    console.error("Failed to initialize Cognito Verifier:", e.message);
}

export const verifier = verifierInstance;
