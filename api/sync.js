import { MongoClient } from 'mongodb';

const uri = process.env.MONGODB_URI;
const client = new MongoClient(uri);

export default async function handler(req, res) {
    // Разрешаем только POST запросы (отправка данных)
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        await client.connect();
        const database = client.db('tonpulse_db');
        const users = database.collection('players');

        const { userId, balance, level } = req.body;

        if (!userId) {
            return res.status(400).json({ error: 'No userId provided' });
        }

        // Обновляем данные пользователя или создаем нового (upsert)
        await users.updateOne(
            { userId: userId },
            { 
                $set: { 
                    balance: balance, 
                    level: level, 
                    lastUpdate: new Date() 
                } 
            },
            { upsert: true }
        );

        return res.status(200).json({ success: true });
    } catch (e) {
        return res.status(500).json({ error: e.message });
    } finally {
        await client.close();
    }
}
