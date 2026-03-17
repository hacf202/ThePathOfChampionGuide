// src/hooks/useMapDetailData.js
import { useState, useEffect } from "react";
import { api } from "../context/services/apiHelper";

export const useMapDetailData = adventureID => {
	const [adventure, setAdventure] = useState(null);
	const [resolvedRules, setResolvedRules] = useState([]);
	const [resolvedBosses, setResolvedBosses] = useState([]);
	const [resolvedChampions, setResolvedChampions] = useState([]);
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

				// 2. Fetch Sức mạnh đặc biệt (Special Rules)
				const rulesPromises = api.resolve("powers", advData.specialRules || []);

				// 3. Fetch Thông tin các Boss (bao gồm cả sức mạnh của Boss)
				const bossPromises = (advData.Bosses || []).map(async b => {
					if (!b.bossID) return null;
					try {
						const bossDetail = await api.get(`/bosses/${b.bossID}`);
						let resolvedPower = null;
						if (bossDetail.power) {
							const pInfo = await api.resolve("powers", [bossDetail.power]);
							resolvedPower = pInfo[0] || null;
						}
						return {
							...bossDetail,
							note: b.note,
							resolvedPower,
						};
					} catch (e) {
						console.warn(`Không thể tải Boss ${b.bossID}`);
						return null;
					}
				});

				// 4. Fetch Thông tin Tướng yêu cầu (Dùng api.resolve để lấy Name, Avatar)
				const reqChampionsPromises = api.resolve(
					"champions",
					advData.requirement?.champions || [],
				);

				// Chờ toàn bộ data chạy xong song song
				const [rulesData, bossesData, champsData] = await Promise.all([
					rulesPromises,
					Promise.all(bossPromises),
					reqChampionsPromises,
				]);

				if (isMounted) {
					setResolvedRules(rulesData);
					setResolvedBosses(bossesData.filter(Boolean));
					setResolvedChampions(champsData); // Lưu danh sách tướng đã resolve
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
		loading,
		error,
	};
};
