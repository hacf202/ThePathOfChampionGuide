// src/config/db.js
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import dotenv from "dotenv";

dotenv.config();

const client = new DynamoDBClient({ region: process.env.AWS_REGION });

export default client;
