import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { BatchWriteCommand } from "@aws-sdk/lib-dynamodb";
import docClient from "../config/db.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const TABLE_NAME = "guidePocCardList";
const CARD_LIST_PATH = path.resolve(__dirname, "../../datacard/cardList.json");

async function standardizeAndUpload() {
    try {
        if (!fs.existsSync(CARD_LIST_PATH)) {
            console.error(`File not found: ${CARD_LIST_PATH}`);
            return;
        }

        const rawData = fs.readFileSync(CARD_LIST_PATH, 'utf8');
        const cards = JSON.parse(rawData);

        // --- 1. Standardize the data ---
        // Duplicating fields to ensure compatibility with GenericCard (names) and GSI (cardNames)
        const standardizedCards = cards.map(card => {
            const newCard = { ...card };
            
            // ROOT: Ensure both 'name' and 'cardName' exist
            if (card.cardName) {
                newCard.name = card.cardName;
            } else if (card.name) {
                newCard.cardName = card.name;
            }

            // TRANSLATIONS: Ensure both 'name' and 'cardName' exist in English
            if (card.translations?.en) {
                if (card.translations.en.cardName) {
                    newCard.translations.en.name = card.translations.en.cardName;
                } else if (card.translations.en.name) {
                    newCard.translations.en.cardName = card.translations.en.name;
                }
                
                // Ensure image field is also in translations for consistency
                // USE en-specific gameAbsolutePath if available, fallback to root
                const enImage = card.translations.en.gameAbsolutePath || card.gameAbsolutePath;
                if (enImage) {
                    newCard.translations.en.image = enImage;
                }
            }

            // Ensure root 'image' exists for GenericCard
            if (card.gameAbsolutePath && !card.image) {
                newCard.image = card.gameAbsolutePath;
            }

            return newCard;
        });

        // Save standardized list back to file
        fs.writeFileSync(CARD_LIST_PATH, JSON.stringify(standardizedCards, null, 1), 'utf8');
        console.log(`Successfully standardized ${standardizedCards.length} cards locally (keeping both name and cardName).`);

        // --- 2. Re-upload to DynamoDB ---
        console.log(`Starting bulk upload of standardized cards to ${TABLE_NAME}...`);

        const BATCH_SIZE = 25;
        for (let i = 0; i < standardizedCards.length; i += BATCH_SIZE) {
            const batch = standardizedCards.slice(i, i + BATCH_SIZE);
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

            // Simple retry
            let retries = 0;
            while (unprocessedItems && Object.keys(unprocessedItems).length > 0 && retries < 3) {
                console.log(`Retrying batch starting at ${i} (Attempt ${retries + 1})...`);
                await new Promise(resolve => setTimeout(resolve, 1000));
                response = await docClient.send(new BatchWriteCommand({ RequestItems: unprocessedItems }));
                unprocessedItems = response.UnprocessedItems;
                retries++;
            }

            if (i % 250 === 0 || i + BATCH_SIZE >= standardizedCards.length) {
                console.log(`Progress: ${Math.min(i + BATCH_SIZE, standardizedCards.length)}/${standardizedCards.length} cards uploaded.`);
            }
        }

        console.log("Bulk upload of standardized data completed!");
    } catch (error) {
        console.error("Error during standardization and upload:", error);
    }
}

standardizeAndUpload();
