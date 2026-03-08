import React, { useState, useRef, useEffect } from "react";
import Swal from "sweetalert2";

const getRandomRotation = (min, max) => {
	return Math.floor(Math.random() * (max - min)) + min;
};

const VongQuayNgauNhien = ({ title, items, onRemoveWinner }) => {
	const canvasRef = useRef(null);
	const wheelContainerRef = useRef(null);

	const [rotation, setRotation] = useState(() => getRandomRotation(0, 360));
	const [isSpinning, setIsSpinning] = useState(false);
	const [fontSize, setFontSize] = useState(10);
	const [currentSize, setCurrentSize] = useState(300);
	const [hasSpun, setHasSpun] = useState(false);

	const colors = ["#3B82F6", "#10B981", "#F59E0B", "#EF4444"];

	// Idle animation
	useEffect(() => {
		let animationFrameId;
		const rotationSpeed = 0.05;
		const animateIdle = () => {
			if (!isSpinning && !hasSpun) {
				setRotation(prev => (prev + rotationSpeed) % 360000);
				animationFrameId = requestAnimationFrame(animateIdle);
			}
		};
		if (!isSpinning && !hasSpun) {
			animationFrameId = requestAnimationFrame(animateIdle);
		}
		return () => cancelAnimationFrame(animationFrameId);
	}, [isSpinning, hasSpun]);

	// Resize observer
	useEffect(() => {
		const wheelContainer = wheelContainerRef.current;
		if (!wheelContainer) return;

		const resizeObserver = new ResizeObserver(entries => {
			if (entries[0]) {
				const { width } = entries[0].contentRect;
				setCurrentSize(width);
			}
		});

		resizeObserver.observe(wheelContainer);
		return () => resizeObserver.unobserve(wheelContainer);
	}, []);

	// Draw wheel
	useEffect(() => {
		const canvas = canvasRef.current;
		if (!canvas) return;
		const context = canvas.getContext("2d");
		const centerX = currentSize / 2;
		const centerY = currentSize / 2;
		const radius = currentSize / 2 - 15;
		const buttonKeepOutRadius = Math.min(90, currentSize * 0.2);
		const numSegments = items.length;
		const angleStep = (Math.PI * 2) / numSegments;

		const calculateFontSize = () => {
			const baseSize = 36;
			let calculatedSize = baseSize;
			if (numSegments > 3) {
				calculatedSize = Math.max(10, baseSize - (numSegments - 3) * 1.5);
			}
			return Math.min(baseSize, (calculatedSize * currentSize) / 700);
		};
		const dynamicFontSize = calculateFontSize();
		setFontSize(dynamicFontSize);

		const truncateText = (text, maxWidth) => {
			let currentText = text;
			if (context.measureText(currentText).width <= maxWidth)
				return currentText;
			while (
				context.measureText(currentText + "...").width > maxWidth &&
				currentText.length > 0
			) {
				currentText = currentText.slice(0, -1);
			}
			return currentText + "...";
		};

		const drawWheel = () => {
			context.clearRect(0, 0, currentSize, currentSize);
			items.forEach((item, index) => {
				const startAngle = angleStep * index + (rotation * Math.PI) / 180;
				const endAngle = startAngle + angleStep;
				context.beginPath();
				context.moveTo(centerX, centerY);
				context.arc(centerX, centerY, radius, startAngle, endAngle);
				context.closePath();
				context.fillStyle = colors[index % colors.length];
				context.fill();
				context.strokeStyle = "#334155";
				context.lineWidth = 1;
				context.stroke();

				context.save();
				context.translate(centerX, centerY);
				context.rotate(startAngle + angleStep / 2);
				context.textAlign = "right";
				context.fillStyle = "#ffffff";
				context.font = `bold ${fontSize}px Arial`;
				context.textBaseline = "middle";
				const maxTextWidth = radius - buttonKeepOutRadius - 15;
				const textToDraw = truncateText(item.name, maxTextWidth);
				context.fillText(textToDraw, radius - 10, 0);
				context.restore();
			});

			// Center circle
			context.beginPath();
			context.arc(centerX, centerY, 35, 0, Math.PI * 2);
			context.fillStyle = "#1e293b";
			context.fill();
		};

		drawWheel();
	}, [rotation, currentSize, fontSize, items]);

	// Spin logic
	const spinWheel = () => {
		if (isSpinning || items.length === 0) return;
		setIsSpinning(true);
		setHasSpun(true);

		const numSegments = items.length;
		const winnerIndex = Math.floor(Math.random() * numSegments);
		const angleStepDegrees = 360 / numSegments;
		const initialRotation = rotation;
		const midSegmentAngle =
			winnerIndex * angleStepDegrees + angleStepDegrees / 2;
		const pointerAngle = 90;

		let currentRotationModulo = initialRotation % 360;
		if (currentRotationModulo < 0) currentRotationModulo += 360;

		const angleToTarget = pointerAngle - midSegmentAngle;
		const offsetRotation = (360 - currentRotationModulo) % 360;
		const deltaToLand = (angleToTarget + offsetRotation + 360) % 360;
		const duration = 8;
		const minSpins = 5;
		const maxSpins = 10;
		const spins =
			Math.floor(Math.random() * (maxSpins - minSpins + 1)) + minSpins;
		const fullTargetRotation = spins * 360 + deltaToLand;
		const accelerationTime = 3;
		const decelerationTime = duration - accelerationTime;
		const maxVelocity = (2 * fullTargetRotation) / duration;
		const alphaAcceleration = maxVelocity / accelerationTime;
		const alphaDeceleration = -maxVelocity / decelerationTime;
		const startTime = performance.now();

		const animate = now => {
			const elapsed = (now - startTime) / 1000;
			if (elapsed < duration) {
				let deltaRotation;
				if (elapsed < accelerationTime) {
					deltaRotation = 0.5 * alphaAcceleration * elapsed * elapsed;
				} else {
					const timeDecel = elapsed - accelerationTime;
					const thetaAccel = 0.5 * maxVelocity * accelerationTime;
					deltaRotation =
						thetaAccel +
						maxVelocity * timeDecel +
						0.5 * alphaDeceleration * timeDecel * timeDecel;
				}
				setRotation(initialRotation + deltaRotation);
				requestAnimationFrame(animate);
			} else {
				setRotation(initialRotation + fullTargetRotation);
				setIsSpinning(false);
				showResult(items[winnerIndex]);
			}
		};
		requestAnimationFrame(animate);
	};

	// Hiển thị kết quả với hình ảnh + tên + nút lựa chọn
	const showResult = winner => {
		// Xác định loại item để lấy đúng trường
		const isChampion = winner.assets?.[0]?.avatar;
		const isRelicOrItemOrPower = winner.assetAbsolutePath;

		// Lấy hình ảnh
		const imageHtml = isChampion
			? `<img src="${winner.assets[0].avatar}" alt="${winner.name}" class="mx-auto my-4 rounded-lg border-2 border-blue-400" style="max-height: 150px;" />`
			: isRelicOrItemOrPower
				? `<img src="${winner.assetAbsolutePath}" alt="${winner.name}" class="mx-auto my-4 rounded-lg border-2 border-blue-400" style="max-height: 150px;" />`
				: "";

		Swal.fire({
			title: "Kết quả!",
			html: `
      <div class="text-center ">
        ${imageHtml}
        <p class="mt-3">Bạn đã quay trúng:</p>
        <b class="text-blue-400 text-2xl">${winner.name}</b>
	
      </div>
    `,
			icon: "success",
			showDenyButton: true,
			confirmButtonText: "Giữ lại",
			denyButtonText: "Loại bỏ",
			background: "#1e293b",
			color: "#ffffff",
			confirmButtonColor: "#3B82F6",
			denyButtonColor: "#EF4444",
			customClass: {
				popup: "swal-custom-popup",
				htmlContainer: "swal-html-container",
			},
			didOpen: () => {
				const img = Swal.getHtmlContainer().querySelector("img");
				if (img) {
					img.style.display = "block";
					img.style.margin = "0 auto";
				}
			},
		}).then(result => {
			if (result.isDenied && onRemoveWinner) {
				onRemoveWinner(winner);
			}
		});
	};
	// Nếu không có item
	if (!items || items.length === 0) {
		return (
			<div className='flex flex-col items-center justify-center text-center p-8'>
				<h2 className='text-3xl font-bold text-gray-100 mb-3 tracking-wide'>
					{title}
				</h2>
				<div className='relative flex items-center justify-center bg-slate-700/50 border-2 border-dashed border-slate-500 rounded-full w-80 h-80'>
					<p className='text-slate-400 text-lg max-w-[200px]'>
						Vui lòng chọn ít nhất một mục trong phần Tùy Chỉnh.
					</p>
				</div>
			</div>
		);
	}

	return (
		<div className='w-full h-full flex flex-col items-center justify-center'>
			<h2 className='text-3xl font-bold text-gray-100 mb-3 tracking-wide text-center'>
				{title}
			</h2>
			<div
				ref={wheelContainerRef}
				className='relative w-[500px] h-[500px] sm:w-[600px] sm:h-[600px] lg:w-[700px] lg:h-[700px] xl:w-[850px] xl:h-[850px]'
			>
				<canvas
					ref={canvasRef}
					width={currentSize}
					height={currentSize}
					className='rounded-full -rotate-90'
				/>
				{/* Pointer */}
				<div className='absolute top-1/2 right-0 -translate-y-1/2 z-20'>
					<div className='w-0 h-0 border-t-[20px] border-b-[20px] border-r-[40px] border-t-transparent border-b-transparent border-r-blue-500' />
				</div>
				{/* Spin Button */}
				<button
					onClick={spinWheel}
					disabled={isSpinning}
					className='absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-28 h-28 sm:w-40 sm:h-40 rounded-full bg-slate-900 text-blue-400 border-4 border-blue-400 text-2xl sm:text-3xl font-extrabold cursor-pointer z-10 transition-all duration-200 hover:scale-110 hover:shadow-2xl hover:shadow-blue-500/50 focus:outline-none focus:ring-4 focus:ring-blue-300 flex justify-center items-center disabled:opacity-50 disabled:cursor-not-allowed'
				>
					{isSpinning ? "..." : "SPIN"}
				</button>
			</div>
		</div>
	);
};

export default VongQuayNgauNhien;
