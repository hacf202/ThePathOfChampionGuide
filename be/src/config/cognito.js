// src/config/cognito.js
import { CognitoIdentityProviderClient } from "@aws-sdk/client-cognito-identity-provider";
import { CognitoJwtVerifier } from "aws-jwt-verify";
import dotenv from "dotenv";

dotenv.config();

const { COGNITO_USER_POOL_ID, COGNITO_APP_CLIENT_ID, AWS_REGION } = process.env;

export const cognitoClient = new CognitoIdentityProviderClient({
	region: AWS_REGION,
});

export const verifier = CognitoJwtVerifier.create({
	userPoolId: COGNITO_USER_POOL_ID,
	tokenUse: "id",
	clientId: COGNITO_APP_CLIENT_ID,
});
