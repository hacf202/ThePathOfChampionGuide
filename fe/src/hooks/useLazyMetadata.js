// src/hooks/useLazyMetadata.js
import { useState, useCallback, useRef } from "react";

export const useLazyMetadata = tUI => {
	const [metadata, setMetadata] = useState({
		champions: [],
		relics: [],
		powers: [],
		runes: [],
	});
	const [isLoadingMeta, setIsLoadingMeta] = useState(false);
	const [isLoaded, setIsLoaded] = useState(false);
	const isLoadedRef = useRef(false);

	const fetchAllMetadata = useCallback(async () => {
		if (isLoadedRef.current) return; // Nếu đã tải rồi thì không tải lại
		setIsLoadingMeta(true);
		try {
			const apiUrl = import.meta.env.VITE_API_URL;
			const fetchOptions = "?page=1&limit=-1"; // Tạm giữ limit này, nhưng chỉ gọi khi cần thiết
			const [champRes, relicRes, powerRes, runeRes] = await Promise.all([
				fetch(`${apiUrl}/api/champions${fetchOptions}`),
				fetch(`${apiUrl}/api/relics${fetchOptions}`),
				fetch(`${apiUrl}/api/powers${fetchOptions}&types=General%20Power`),
				fetch(`${apiUrl}/api/runes${fetchOptions}`),
			]);

			if (!champRes.ok || !relicRes.ok || !powerRes.ok || !runeRes.ok)
				throw new Error("Lỗi tải metadata");

			const [champData, relicData, powerData, runeData] = await Promise.all([
				champRes.json(),
				relicRes.json(),
				powerRes.json(),
				runeRes.json(),
			]);

			setMetadata({
				champions: champData.items || [],
				relics: relicData.items || [],
				powers: powerData.items || [],
				runes: runeData.items || [],
			});
			isLoadedRef.current = true;
			setIsLoaded(true);
		} catch (err) {
			console.error("Lỗi lazy load metadata:", err);
		} finally {
			setIsLoadingMeta(false);
		}
	}, []);

	return { metadata, isLoadingMeta, fetchAllMetadata };
};
