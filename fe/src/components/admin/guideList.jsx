// src/pages/admin/guideList.jsx
import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../../context/AuthContext";
import { useTranslation } from "../../hooks/useTranslation"; // 🟢 Import i18n
import Button from "../common/button";
import { Edit, Trash2, Eye, Plus, Search } from "lucide-react";
import InputField from "../common/inputField";

const GuideList = () => {
	const { tUI, t } = useTranslation();
	const [guides, setGuides] = useState([]);
	const [loading, setLoading] = useState(true);
	const [searchTerm, setSearchTerm] = useState("");
	const { token } = useAuth();
	const navigate = useNavigate();

	const fetchGuides = async () => {
		try {
			const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/guides`);
			if (res.data.success) {
				const sorted = res.data.data.sort(
					(a, b) =>
						new Date(b.updateDate || b.publishedDate) -
						new Date(a.updateDate || a.publishedDate),
				);
				setGuides(sorted);
			}
		} catch (err) {
			console.error("Error loading guide list:", err);
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		fetchGuides();
	}, []);

	const handleDelete = async slug => {
		if (!window.confirm(tUI("common.deleteConfirmPrefix") + slug + "?")) return;

		try {
			await axios.delete(`${import.meta.env.VITE_API_URL}/api/guides/${slug}`, {
				headers: { Authorization: `Bearer ${token}` },
			});
			setGuides(guides.filter(g => g.slug !== slug));
		} catch (err) {
			alert(tUI("common.errorLoadData"));
		}
	};

	const filteredGuides = guides.filter(g =>
		t(g, "title").toLowerCase().includes(searchTerm.toLowerCase()),
	);

	if (loading)
		return <div className='p-10 text-center'>{tUI("common.loading")}</div>;

	return (
		<div className='p-6'>
			<div className='flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8'>
				<h1 className='text-2xl font-bold text-text-primary uppercase'>
					{tUI("guideList.heading")} (Admin)
				</h1>
				<Button
					onClick={() => navigate("new")}
					variant='primary'
					iconLeft={<Plus size={18} />}
				>
					{tUI("common.addNew")}
				</Button>
			</div>

			<div className='mb-6 max-w-md'>
				<InputField
					icon={<Search size={18} />}
					placeholder={tUI("common.searchPlaceholder")}
					value={searchTerm}
					onChange={e => setSearchTerm(e.target.value)}
				/>
			</div>

			<div className='bg-surface-bg rounded-xl border border-border overflow-hidden shadow-sm'>
				<table className='w-full text-left border-collapse'>
					<thead className='bg-surface-hover/50 text-text-secondary text-sm uppercase'>
						<tr>
							<th className='px-6 py-4 font-semibold'>
								{tUI("constellation.colName")}
							</th>
							<th className='px-6 py-4 font-semibold'>
								{tUI("guideDetail.authorLabel")}
							</th>
							<th className='px-6 py-4 font-semibold hidden md:table-cell'>
								{tUI("common.views")}
							</th>
							<th className='px-6 py-4 font-semibold text-right'>
								{tUI("randomWheel.panelTitle")}
							</th>
						</tr>
					</thead>
					<tbody className='divide-y divide-border'>
						{filteredGuides.map(guide => (
							<tr key={guide._id} className='hover:bg-surface-hover/30  '>
								<td className='px-6 py-4 font-medium text-text-primary'>
									{t(guide, "title")}
								</td>
								<td className='px-6 py-4 text-text-secondary'>
									{guide.author}
								</td>
								<td className='px-6 py-4 text-text-secondary hidden md:table-cell'>
									{guide.views || 0}
								</td>
								<td className='px-6 py-4 text-right space-x-2'>
									<Button
										variant='ghost'
										onClick={() => navigate(guide.slug)}
										className='text-blue-500 hover:bg-blue-500/10 p-2'
									>
										<Edit size={18} />
									</Button>
									<Button
										variant='ghost'
										onClick={() => handleDelete(guide.slug)}
										className='text-red-500 hover:bg-red-500/10 p-2'
									>
										<Trash2 size={18} />
									</Button>
									<a
										href={`/guides/${guide.slug}`}
										target='_blank'
										rel='noreferrer'
										className='inline-flex p-2 text-text-secondary hover:text-text-primary'
									>
										<Eye size={18} />
									</a>
								</td>
							</tr>
						))}
					</tbody>
				</table>
			</div>
		</div>
	);
};

export default GuideList;
