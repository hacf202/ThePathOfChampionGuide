// src/hooks/useMapDetailData.js
import { useState, useEffect } from "react";
import { api } from "../context/services/apiHelper";

export const useMapDetailData = adventureID => {
	const [adventure, setAdventure] = useState(null);
	const [resolvedRules, setResolvedRules] = useState([]);
	const [resolvedBosses, setResolvedBosses] = useState([]);
	const [resolvedChampions, setResolvedChampions] = useState([]);
	const [resourceCache, setResourceCache] = useState({});
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);

	useEffect(() => {
		let isMounted = true;

		const fetchMapData = async () => {
			try {
				setLoading(true);

				// 1. Fetch dữ liệu Adventure chính
				const advData = await api.get(`/adventures/${adventureID}`);
				if (!isMounted) return;
				setAdventure(advData);

				// 2. Fetch Sức mạnh đặc biệt (Special Rules của Map)
				const rulesPromises = api.resolve("powers", advData.specialRules || []);

				// 3. Fetch Thông tin Tướng yêu cầu
				const reqChampionsPromises = api.resolve(
					"champions",
					advData.requirement?.champions || [],
				);

				// 4. XỬ LÝ BOSS (TỐI ƯU HÓA BATCHING - KHÔNG BỊ N+1)
				const bossList = advData.Bosses || [];
				const bossIds = bossList.map(b => b.bossID).filter(Boolean);
				let finalBossesData = [];

				if (bossIds.length > 0) {
					// 4.1. Lấy toàn bộ Boss trong 1 Request duy nhất
					// LƯU Ý: Yêu cầu api.resolve("bosses", [...]) gọi đúng tới POST /api/bosses/resolve mà ta vừa tạo ở Backend
					const bossesDetail = (await api.resolve("bosses", bossIds)) || [];

					// 4.2. Gom toàn bộ Power ID của TẤT CẢ các Boss lại thành 1 mảng
					const allBossPowerIds = [];
					bossesDetail.forEach(boss => {
						if (boss.power) {
							const pIds = Array.isArray(boss.power)
								? boss.power
								: [boss.power];
							allBossPowerIds.push(...pIds);
						}
					});

					// 4.3. Lấy toàn bộ Sức mạnh của các Boss trong 1 Request duy nhất
					const uniquePowerIds = [...new Set(allBossPowerIds)];
					const resolvedAllBossPowers =
						uniquePowerIds.length > 0
							? await api.resolve("powers", uniquePowerIds)
							: [];

					// 4.4. Lắp ráp dữ liệu lại (Merge Note và Resolved Powers vào từng Boss)
					finalBossesData = bossesDetail.map(bossDetail => {
						// Lấy lại cái note từ dữ liệu advData gốc
						const originalBossInfo =
							bossList.find(b => b.bossID === bossDetail.bossID) || {};

						let resolvedPowers = [];
						let resolvedPower = null;

						if (bossDetail.power) {
							const pIds = Array.isArray(bossDetail.power)
								? bossDetail.power
								: [bossDetail.power];

							// Tìm power tương ứng từ mảng data vừa fetch
							resolvedPowers = pIds
								.map(id => {
									return resolvedAllBossPowers.find(
										p => p.powerCode === id || p.id === id || p._id === id,
									);
								})
								.filter(Boolean);

							resolvedPower = resolvedPowers[0] || null; // Giữ tương thích ngược
						}

						return {
							...bossDetail,
							note: originalBossInfo.note,
							resolvedPower,
							resolvedPowers,
						};
					});
				}

				// Chờ Data của Rules và Champions (Bosses đã được await tuần tự ở trên vì cần chaining ID)
				const [rulesData, champsData] = await Promise.all([
					rulesPromises,
					reqChampionsPromises,
				]);

				// 5. Fetch Special Blocks resources
				const specialBlocks = advData.specialBlocks || [];
				const idsByType = {};
				specialBlocks.forEach(block => {
					(block.items || []).forEach(item => {
						if (item.id && item.type) {
							let apiType = item.type;
							if (item.type === "champion") apiType = "champions";
							if (item.type === "boss") apiType = "bosses";
							if (item.type === "item") apiType = "items";
							if (item.type === "relic") apiType = "relics";
							if (item.type === "power") apiType = "powers";
							if (item.type === "rune") apiType = "runes";
							if (item.type === "bonusStar") apiType = "bonusStars";
							if (item.type === "card") apiType = "cards";
							
							if (!idsByType[apiType]) idsByType[apiType] = [];
							idsByType[apiType].push(item.id);
						}
					});
				});

				const resolvePromises = Object.entries(idsByType).map(async ([type, ids]) => {
					const uniqueIds = [...new Set(ids)];
					const resolved = await api.resolve(type, uniqueIds);
					return { type, resolved };
				});

				const resolvedResults = await Promise.all(resolvePromises);
				const cache = {};
				resolvedResults.forEach(({ type, resolved }) => {
					resolved.forEach(res => {
						const code = res.championCode || res.bossID || res.powerCode || res.relicCode || res.itemCode || res.runeCode || res.cardCode || res.bonusStarID || res.id || res._id;
						if (code) {
							let originalType = type;
							if (type === "champions") originalType = "champion";
							if (type === "bosses") originalType = "boss";
							if (type === "items") originalType = "item";
							if (type === "relics") originalType = "relic";
							if (type === "powers") originalType = "power";
							if (type === "runes") originalType = "rune";
							if (type === "bonusStars") originalType = "bonusStar";
							if (type === "cards") originalType = "card";

							cache[`${originalType}_${code}`] = res;
						}
					});
				});

				if (isMounted) {
					setResolvedRules(rulesData);
					setResolvedBosses(finalBossesData);
					setResolvedChampions(champsData);
					setResourceCache(cache);
				}
			} catch (err) {
				console.error(err);
				if (isMounted) setError("Không thể tải thông tin bản đồ này.");
			} finally {
				if (isMounted) setLoading(false);
			}
		};

		if (adventureID) {
			fetchMapData();
		}

		return () => {
			isMounted = false;
		};
	}, [adventureID]);

	return {
		adventure,
		resolvedRules,
		resolvedBosses,
		resolvedChampions,
		resourceCache,
		loading,
		error,
	};
};
