import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { BatchWriteCommand } from "@aws-sdk/lib-dynamodb";
import docClient from "../config/db.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const TABLE_NAME = "guidePocCardList";
const CARD_LIST_PATH = path.resolve(__dirname, "../../datacard/cardList.json");

async function uploadCards() {
    try {
        if (!fs.existsSync(CARD_LIST_PATH)) {
            console.error(`File not found: ${CARD_LIST_PATH}`);
            return;
        }

        const rawData = fs.readFileSync(CARD_LIST_PATH, 'utf8');
        const cards = JSON.parse(rawData);

        console.log(`Starting upload of ${cards.length} cards to ${TABLE_NAME}...`);

        const BATCH_SIZE = 25;
        for (let i = 0; i < cards.length; i += BATCH_SIZE) {
            const batch = cards.slice(i, i + BATCH_SIZE);
            const putRequests = batch.map(card => ({
                PutRequest: {
                    Item: card
                }
            }));

            const params = {
                RequestItems: {
                    [TABLE_NAME]: putRequests
                }
            };

            let response = await docClient.send(new BatchWriteCommand(params));
            let unprocessedItems = response.UnprocessedItems;

            // Retry for unprocessed items
            let retries = 0;
            while (unprocessedItems && Object.keys(unprocessedItems).length > 0 && retries < 3) {
                console.log(`Retrying unprocessed items for batch ${i/BATCH_SIZE + 1} (Attempt ${retries + 1})...`);
                // Wait a bit before retry
                await new Promise(resolve => setTimeout(resolve, 1000));
                response = await docClient.send(new BatchWriteCommand({
                    RequestItems: unprocessedItems
                }));
                unprocessedItems = response.UnprocessedItems;
                retries++;
            }

            if (unprocessedItems && Object.keys(unprocessedItems).length > 0) {
                console.error(`Failed to process some items in batch starting at index ${i}`);
            }

            console.log(`Progress: ${Math.min(i + BATCH_SIZE, cards.length)}/${cards.length} cards uploaded.`);
        }

        console.log("Bulk upload completed!");
    } catch (error) {
        console.error("Error during bulk upload:", error);
    }
}

uploadCards();
