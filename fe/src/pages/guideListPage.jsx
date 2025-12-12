// src/pages/guideListPage.jsx
import React, { useEffect, useState } from "react";
import axios from "axios";
import { Calendar, Eye, ArrowRight } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import Button from "../components/common/button"; // Đảm bảo đường dẫn đúng

const GuideList = () => {
	const [guides, setGuides] = useState([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);
	const navigate = useNavigate();

	const fetchGuides = async () => {
		setLoading(true);
		setError(null);
		try {
			const backendUrl = import.meta.env.VITE_API_URL;
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
		<div className='container mx-auto  md:px-4 py-8'>
			<h1 className='text-3xl font-bold text-center mb-10 text-gray-800'>
				Hướng dẫn POC Mới Nhất
			</h1>

			<div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8'>
				{guides.map(guide => (
					<div
						key={guide.slug}
						className='bg-white rounded-xl shadow-lg hover:shadow-xl transition duration-300 overflow-hidden border border-gray-100 flex flex-col'
					>
						{/* Hình ảnh vẫn dùng wrapper div, có thể bọc Link nếu muốn click vào ảnh */}
						<div className='h-48 bg-gray-200 overflow-hidden'>
							<Link to={`/guides/${guide.slug}`}>
								<img
									src={guide.thumbnail}
									alt={guide.title}
									className='w-full h-full object-cover hover:scale-105 transition-transform duration-500'
								/>
							</Link>
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
								{/* Sử dụng Button component */}
								<Button
									variant='primary'
									className='w-full'
									onClick={() => navigate(`/guides/${guide.slug}`)}
									iconRight={<ArrowRight size={16} />}
								>
									Xem chi tiết
								</Button>
							</div>
						</div>
					</div>
				))}
			</div>
		</div>
	);
};

export default GuideList;
