// src/utils/bossBatcher.js
const API_URL = import.meta.env.VITE_API_URL;

const bossCache = new Map();
let pendingIds = new Set();
let callbacks = [];
let timeoutId = null;

export const getBossBatched = bossID => {
	return new Promise((resolve, reject) => {
		if (bossCache.has(bossID)) {
			return resolve(bossCache.get(bossID));
		}

		pendingIds.add(bossID);
		callbacks.push({ id: bossID, resolve, reject });

		if (timeoutId) clearTimeout(timeoutId);

		timeoutId = setTimeout(async () => {
			const idsToFetch = Array.from(pendingIds);
			const callbacksToProcess = [...callbacks];

			pendingIds.clear();
			callbacks = [];
			timeoutId = null;

			try {
				const response = await fetch(`${API_URL}/api/bosses/resolve`, {
					method: "POST",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify({ ids: idsToFetch }),
				});

				if (!response.ok) throw new Error(`Status: ${response.status}`);

				const data = await response.json();
				const bossesArray = Array.isArray(data) ? data : data.data || [];

				const bossMap = new Map();
				bossesArray.forEach(boss => {
					const id = boss.bossID || boss.id || boss._id;
					if (id) {
						bossMap.set(id, boss);
						bossCache.set(id, boss);
					}
				});

				callbacksToProcess.forEach(({ id, resolve }) => {
					resolve(bossMap.get(id) || null);
				});
			} catch (error) {
				console.error("Lỗi fetch batched bosses:", error);
				callbacksToProcess.forEach(({ reject }) => reject(error));
			}
		}, 50); // Gom request trong 50ms
	});
};
