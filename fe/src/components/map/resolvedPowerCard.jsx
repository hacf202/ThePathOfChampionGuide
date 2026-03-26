import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import SafeImage from "../common/SafeImage";
import { useTranslation } from "../../hooks/useTranslation";
import { getPowerBatched } from "../../utils/powerBatcher"; // Import Batcher

const ResolvedPowerCard = ({ powerOrId }) => {
	const { tDynamic } = useTranslation();

	// Nếu truyền vào object thì set luôn, truyền chuỗi thì để null chờ API
	const [power, setPower] = useState(
		typeof powerOrId === "object" ? powerOrId : null,
	);

	useEffect(() => {
		let isMounted = true; // Cờ kiểm tra component còn hiển thị hay không

		if (typeof powerOrId === "string") {
			// Sử dụng cơ chế gom nhóm (Batching) thay vì fetch() trực tiếp
			getPowerBatched(powerOrId)
				.then(data => {
					// Chỉ cập nhật state nếu component chưa bị hủy
					if (isMounted && data) {
						setPower(data);
					}
				})
				.catch(err => {
					console.error(`Không thể tải Power ID: ${powerOrId}`, err);
				});
		} else {
			setPower(powerOrId);
		}

		// Cleanup function: Xóa cờ khi component unmount
		return () => {
			isMounted = false;
		};
	}, [powerOrId]);

	// Giao diện Loading Skeleton
	if (!power) {
		return (
			<div className='h-[68px] bg-surface-hover/50 rounded-lg animate-pulse border border-border/50'></div>
		);
	}

	const powerName =
		tDynamic(power, "name") || power.name || power.powerCode || powerOrId;
	const powerDesc =
		tDynamic(power, "description") || tDynamic(power, "descriptionRaw") || "";

	return (
		<Link
			to={`/power/${power.powerCode || power.id || powerOrId}`}
			className='block h-full'
		>
			<div className='flex items-start gap-3 bg-surface-hover/50 rounded-lg h-full hover:border-primary-500 transition-colors p-2 shadow-sm border border-border/50'>
				<SafeImage
					src={power.assetAbsolutePath || power.image || "/fallback-image.svg"}
					alt={powerName}
					className='w-10 h-10 rounded-md object-cover bg-surface-bg shrink-0'
				/>
				<div>
					<h4 className='font-bold text-text-primary text-sm md:text-base'>
						{powerName}
					</h4>
					{powerDesc && (
						<p
							className='text-xs md:text-sm text-text-secondary mt-1 line-clamp-3'
							dangerouslySetInnerHTML={{ __html: powerDesc }}
						/>
					)}
				</div>
			</div>
		</Link>
	);
};

export default ResolvedPowerCard;
