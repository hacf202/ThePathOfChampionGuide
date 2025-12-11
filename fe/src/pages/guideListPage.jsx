import React, { useEffect, useState } from "react";
import axios from "axios";
import { Calendar, Eye } from "lucide-react";
import { Link } from "react-router-dom";

const GuideList = () => {
	const [guides, setGuides] = useState([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);

	const fetchGuides = async () => {
		setLoading(true);
		setError(null);
		try {
			// -----------------------------------------------------------
			// Lấy URL trực tiếp từ biến môi trường (Chuẩn Vite)
			// Nếu không có biến môi trường thì fallback về localhost
			// -----------------------------------------------------------
			const backendUrl = import.meta.env.VITE_API_URL;

			// Gọi API: nối backendUrl với endpoint /api/guides
			const res = await axios.get(`${backendUrl}/api/guides`);

			if (res.data.success) {
				setGuides(res.data.data);
			}
		} catch (err) {
			console.error("Lỗi tải guides:", err);
			setError(err.message || "Lỗi kết nối server");
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		fetchGuides();
	}, []);

	if (loading)
		return <div className='text-center py-10'>Đang tải dữ liệu...</div>;
	if (error)
		return <div className='text-center py-10 text-red-500'>Lỗi: {error}</div>;

	return (
		<div className='container mx-auto px-4 py-8'>
			<h1 className='text-3xl font-bold text-center mb-10 text-gray-800'>
				Hướng dẫn POC Mới Nhất
			</h1>

			<div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8'>
				{guides.map(guide => (
					<div
						key={guide.slug}
						className='bg-white rounded-xl shadow-lg hover:shadow-xl transition duration-300 overflow-hidden border border-gray-100 flex flex-col'
					>
						<div className='h-48 bg-gray-200 overflow-hidden'>
							<img
								src={guide.thumbnail}
								alt={guide.title}
								className='w-full h-full object-cover'
							/>
						</div>

						<div className='p-6 flex-1 flex flex-col'>
							<h2 className='text-xl font-bold mb-2 text-gray-900 line-clamp-2'>
								<Link
									to={`/guides/${guide.slug}`}
									className='hover:text-blue-600'
								>
									{guide.title}
								</Link>
							</h2>
							<div className='flex flex-grow gap-4 mb-4'>
								<p className='flex items-center gap-1 text-gray-500 text-sm'>
									<Calendar size={18} /> {guide.publishedDate}
								</p>
								<p className='flex items-center gap-1 text-gray-500 text-sm'>
									<Eye size={18} />
									{guide.views} lượt xem
								</p>
							</div>
							<div className='mt-auto'>
								<Link
									to={`/guides/${guide.slug}`}
									className='inline-block w-full text-center bg-blue-600 text-white py-2 rounded-lg font-semibold hover:bg-blue-700 transition'
								>
									Xem chi tiết
								</Link>
							</div>
						</div>
					</div>
				))}
			</div>
		</div>
	);
};

export default GuideList;
