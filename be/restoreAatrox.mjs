import fs from 'fs';
import { DynamoDBClient, GetItemCommand, UpdateItemCommand } from '@aws-sdk/client-dynamodb';
import { marshall, unmarshall } from '@aws-sdk/util-dynamodb';
import dotenv from 'dotenv';
dotenv.config();

const client = new DynamoDBClient({
    region: process.env.AWS_REGION || 'us-east-1',
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
    }
});

async function main() {
    try {
        const data = JSON.parse(fs.readFileSync('uploadData/guidePocChampionList.json', 'utf8'));
        const aatrox = data.find(c => c.championID === 'C076');
        
        if (!aatrox) {
            console.log("Aatrox not found in original file");
            return;
        }

        const originalDescription = aatrox.description;
        const originalEnDesc = aatrox.translations?.en?.description || "";
        
        console.log("Original VN:", originalDescription?.substring(0, 50));
        console.log("Original EN:", originalEnDesc?.substring(0, 50));

        // Let's get the current item first to ensure translations object exists
        const getCmd = new GetItemCommand({
            TableName: 'guidePocChampionList',
            Key: marshall({ championID: 'C076' })
        });
        const { Item } = await client.send(getCmd);
        const currentAatrox = unmarshall(Item);
        
        currentAatrox.description = originalDescription;
        if (!currentAatrox.translations) currentAatrox.translations = { en: {} };
        if (!currentAatrox.translations.en) currentAatrox.translations.en = {};
        currentAatrox.translations.en.description = originalEnDesc;
        
        // Then we can use UpdateItem or just PutItem. Since ratings exist now, we use UpdateItem
        const command = new UpdateItemCommand({
            TableName: 'guidePocChampionList',
            Key: marshall({ championID: 'C076' }),
            UpdateExpression: 'SET description = :desc, translations = :translations',
            ExpressionAttributeValues: marshall({
                ':desc': originalDescription,
                ':translations': currentAatrox.translations
            })
        });

        await client.send(command);
        console.log("Champion C076 successfully restored description");
    } catch (e) {
        console.error("Error:", e);
    }
}
main();
