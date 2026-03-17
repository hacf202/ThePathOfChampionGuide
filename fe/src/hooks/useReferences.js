// src/hooks/useReferences.js
import { useState, useEffect } from "react";

const API_BASE = import.meta.env.VITE_API_URL;

export const useReferences = () => {
	const [items, setItems] = useState([]);
	const [relics, setRelics] = useState([]);
	const [powers, setPowers] = useState([]);
	const [runes, setRunes] = useState([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);

	useEffect(() => {
		const fetchAll = async () => {
			setLoading(true);
			try {
				const endpoints = [
					"/api/items",
					"/api/relics",
					"/api/powers",
					"/api/runes",
				];
				const responses = await Promise.all(
					endpoints.map(url =>
						fetch(`${API_BASE}${url}`)
							.then(r => (r.ok ? r.json() : []))
							.catch(() => [])
					)
				);

				const [itemData, relicData, powerData, runeData] = responses;

				// === ITEM ===
				setItems(
					itemData.map(x => ({
						id: x.itemCode,
						name: x.name,
						rarity: x.rarity,
						rarityRef: x.rarityRef,
						icon: x.assetAbsolutePath,
						type: "item",
					}))
				);

				// === RELIC ===
				setRelics(
					relicData.map(x => ({
						id: x.relicCode,
						name: x.name,
						rarity: x.rarity,
						rarityRef: x.rarityRef,
						icon: x.assetAbsolutePath,
						type: "relic",
					}))
				);

				// === POWER ===
				setPowers(
					powerData.map(x => ({
						id: x.powerCode,
						name: x.name,
						rarity: x.rarity,
						rarityRef: x.rarityRef,
						icon: x.assetAbsolutePath,
						type: "power",
					}))
				);

				// === RUNE ===
				setRunes(
					runeData.map(x => ({
						id: x.runeCode,
						name: x.name,
						rarity: x.rarity,
						rarityRef: x.rarityRef,
						icon: x.assetAbsolutePath,
						type: "rune",
					}))
				);
			} catch (err) {
				setError("Không tải được dữ liệu tham chiếu.");
				console.error(err);
			} finally {
				setLoading(false);
			}
		};

		fetchAll();
	}, []);

	const getName = (type, id) => {
		if (!id) return "";
		const map = { items, relics, powers, runes };
		const list = map[type] || [];
		const found = list.find(x => x.id === id);
		if (!found) return id;

		const rarityColor =
			{
				THƯỜNG: "text-gray-400",
				HIẾM: "text-blue-400",
				"SỬ THI": "text-purple-400",
				"HUYỀN THOẠI": "text-orange-400",
				Common: "text-gray-400",
				Rare: "text-blue-400",
				Epic: "text-purple-400",
				Champion: "text-orange-400",
			}[found.rarity] || "text-text-secondary";

		return (
			<div className='flex items-center gap-2'>
				{found.icon && (
					<img
						src={found.icon}
						alt=''
						className='w-6 h-6 rounded object-contain bg-black/10'
						onError={e => (e.target.style.display = "none")}
					/>
				)}
				<span className='font-medium'>{found.name}</span>
				<span className={`text-xs font-bold ${rarityColor}`}>
					[{found.rarity}]
				</span>
			</div>
		);
	};

	const searchOptions = (type, query) => {
		const map = { items, relics, powers, runes };
		const list = map[type] || [];
		if (!query) return list;
		const q = query.toLowerCase();
		return list.filter(
			x =>
				x.id.toLowerCase().includes(q) ||
				x.name.toLowerCase().includes(q) ||
				x.rarity.toLowerCase().includes(q) ||
				x.rarityRef.toLowerCase().includes(q)
		);
	};

	return {
		items,
		relics,
		powers,
		runes,
		getName,
		searchOptions,
		loading,
		error,
	};
};
