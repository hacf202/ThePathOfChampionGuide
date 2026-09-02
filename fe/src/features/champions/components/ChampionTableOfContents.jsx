import { useEffect, useState } from "react";

const ChampionTableOfContents = ({ tUI }) => {
	const [activeId, setActiveId] = useState("");

	const sections = [
		{ id: "relic-sets", label: tUI("nav.relics") || "Cổ Vật Khuyên Dùng" },
		{ id: "community-builds", label: tUI("championDetail.communityBuilds") || "Top Community Builds" },
		{ id: "recommendations", label: tUI("nav.recommendations") || "Sức Mạnh & Vật Phẩm" },
		{ id: "level-section", label: tUI("championLevelRewards.title") || "Nâng Cấp Cấp Độ" },
		{ id: "starting-deck", label: tUI("championDetail.startingDeck") || "Bộ Bài Khởi Điểm" },
		{ id: "constellation", label: tUI("championDetail.constellation") || "Chòm Sao" },
		{ id: "playstyle-chart", label: tUI("championDetail.playstyle") || "Đánh Giá Lối Chơi" },
		{ id: "video-section", label: tUI("championDetail.videoSection") || "Video Hướng Dẫn" },
		{ id: "comments", label: tUI("championDetail.comments") || "Bình Luận" },
	];

	useEffect(() => {
		const handleScroll = () => {
			const scrollPosition = window.scrollY + 200;
			
			// Find the current active section
			let found = false;
			for (let i = sections.length - 1; i >= 0; i--) {
				const section = document.getElementById(sections[i].id);
				if (section && section.offsetTop <= scrollPosition) {
					setActiveId(sections[i].id);
					found = true;
					break;
				}
			}
			if (!found) setActiveId("");
		};

		// Run once on load
		handleScroll();

		window.addEventListener("scroll", handleScroll);
		return () => window.removeEventListener("scroll", handleScroll);
	}, []);

	const scrollTo = (id) => {
		const element = document.getElementById(id);
		if (element) {
			const y = element.getBoundingClientRect().top + window.scrollY - 100; // 100px offset cho Navbar
			window.scrollTo({ top: y, behavior: 'smooth' });
		}
	};

	return (
		<div className="bg-surface-bg border border-border rounded-xl p-4 shadow-sm w-full sticky top-24">
			<h3 className="font-bold text-primary-500 mb-4 uppercase text-sm border-b border-border pb-2">
				{tUI("common.tableOfContents") || "Mục lục"}
			</h3>
			<ul className="space-y-2.5 text-sm font-medium">
				{sections.map(section => (
					<li key={section.id}>
						<button
							onClick={() => scrollTo(section.id)}
							className={`text-left w-full transition-all duration-300 flex items-center gap-2 group ${
								activeId === section.id 
									? "text-primary-500 font-bold translate-x-1" 
									: "text-text-tertiary hover:text-primary-400 hover:translate-x-1"
							}`}
						>
							<div className={`w-1 h-1 rounded-full ${activeId === section.id ? 'bg-primary-500' : 'bg-border group-hover:bg-primary-400'}`} />
							{section.label}
						</button>
					</li>
				))}
			</ul>
		</div>
	);
};

export default ChampionTableOfContents;
