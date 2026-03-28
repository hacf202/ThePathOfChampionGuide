const fs = require('fs');
const { DynamoDBClient, UpdateItemCommand } = require('@aws-sdk/client-dynamodb');
const { marshall } = require('@aws-sdk/util-dynamodb');
require('dotenv').config();

const client = new DynamoDBClient({
    region: process.env.AWS_REGION || 'ap-southeast-1',
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
        const originalEnDesc = aatrox.translations?.en?.description;
        
        console.log("Original VN:", originalDescription?.substring(0, 50));
        console.log("Original EN:", originalEnDesc?.substring(0, 50));

        const command = new UpdateItemCommand({
            TableName: process.env.CHAMPIONS_TABLE || 'POC_Champions',
            Key: marshall({ championID: 'C076' }),
            UpdateExpression: 'SET description = :desc, translations.en.description = :enDesc',
            ExpressionAttributeValues: marshall({
                ':desc': originalDescription,
                ':enDesc': originalEnDesc
            })
        });

        await client.send(command);
        console.log("Champion C076 successfully restored description");
    } catch (e) {
        console.error("Error:", e);
    }
}
main();
