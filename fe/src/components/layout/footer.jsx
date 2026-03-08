// src/components/Footer.jsx
import React, { memo } from "react";
import LogoBlack from "/ahriicon.png";
import { Youtube, Facebook } from "lucide-react";
import { useTranslation } from "../../hooks/useTranslation"; // Import hook

function Footer() {
	const { language } = useTranslation();

	return (
		<footer className=' bg-[var(--color-footer-bg)] text-[var(--color-footer-text)] pt-4 border-t border-[var(--color-border)] '>
			<div className=' mx-auto px-4 sm:px-6'>
				<div className='grid grid-cols-1 md:grid-cols-12 gap-8 mb-10'>
					{/* === CỘT 1: Logo & Mô tả === */}
					<div className='md:col-span-3'>
						<a href='/' className='inline-block mb-4'>
							<img
								src={LogoBlack}
								alt='Genshin Guide Logo'
								className='h-10 w-auto'
								loading='lazy'
							/>
						</a>
						<p className='text-sm leading-relaxed'>
							<b className='font-bold'>POC GUIDE (Path of champions)</b>
							{language === "vi"
								? " là kho tài nguyên độc lập do cộng đồng người chơi chia sẻ."
								: " is an independent resource hub shared by the player community."}
						</p>
						<p className='text-sm leading-relaxed mt-2'>
							<i className='italic'>Path of champions</i>
							{language === "vi"
								? " hay Con Đường Anh Hùng là chế độ chơi PVE của Huyền Thoại Runeterra do Riot phát triển. Tất cả nội dung build, hướng dẫn, hình ảnh đều được tạo ra bởi fan và dành cho fan."
								: " is the PVE game mode of Legends of Runeterra developed by Riot Games. All builds, guides, and images are created by fans, for fans."}
						</p>
					</div>

					{/* === CỘT 2: Hướng dẫn === */}
					<div className='md:col-span-2'>
						<h3 className='font-bold text-lg mb-4 text-[var(--color-footer-text)]'>
							{language === "vi" ? "Hướng dẫn" : "Guides"}
						</h3>
						<ul className='space-y-2 text-sm'>
							<li>
								<a
									href='/champions'
									className='hover:text-[var(--color-footer-link-hover)] transition-colors'
								>
									{language === "vi" ? "Danh Sách Tướng" : "Champions List"}
								</a>
							</li>
							<li>
								<a
									href='/builds'
									className='hover:text-[var(--color-footer-link-hover)] transition-colors'
								>
									{language === "vi" ? "Hướng Dẫn Build" : "Build Guides"}
								</a>
							</li>
							<li>
								<a
									href='/powers'
									className='hover:text-[var(--color-footer-link-hover)] transition-colors'
								>
									{language === "vi" ? "Danh sách sức mạnh" : "Powers List"}
								</a>
							</li>
							<li>
								<a
									href='/relics'
									className='hover:text-[var(--color-footer-link-hover)] transition-colors'
								>
									{language === "vi" ? "Danh sách cổ vật" : "Relics List"}
								</a>
							</li>
						</ul>
					</div>

					{/* === CỘT 3: Giới thiệu === */}
					<div className='md:col-span-2'>
						<h3 className='font-bold text-lg mb-4 text-[var(--color-footer-text)]'>
							{language === "vi"
								? "Giới thiệu về POC GUIDE"
								: "About POC GUIDE"}
						</h3>
						<ul className='space-y-2 text-sm'>
							<li>
								<a
									href='/about-us'
									className='hover:text-[var(--color-footer-link-hover)] transition-colors'
								>
									{language === "vi" ? "Về Chúng Tôi" : "About Us"}
								</a>
							</li>
							<li>
								<a
									href='/introduction'
									className='hover:text-[var(--color-footer-link-hover)] transition-colors'
								>
									{language === "vi" ? "Giới Thiệu" : "Introduction"}
								</a>
							</li>
							<li>
								<a
									href='/terms-of-use'
									className='hover:text-[var(--color-footer-link-hover)] transition-colors'
								>
									{language === "vi" ? "Điều Khoản Sử Dụng" : "Terms of Use"}
								</a>
							</li>
						</ul>
					</div>

					{/* === CỘT 4: Theo dõi & Form === */}
					<div className='md:col-span-5'>
						<h3 className='font-bold text-lg mb-4 text-[var(--color-footer-text)]'>
							{language === "vi" ? "Theo dõi chúng tôi" : "Follow Us"}
						</h3>

						{/* Social Links */}
						<ul className='flex gap-4 mb-6'>
							<li>
								<a
									href='https://www.facebook.com/lkinh.djack/'
									target='_blank'
									rel='noopener noreferrer'
									className='text-[var(--color-footer-link)] hover:text-[var(--color-footer-link-hover)] transition-colors'
								>
									<Facebook className='inline-block mr-1' />
									Facebook
								</a>
							</li>
							<li>
								<a
									href='https://www.youtube.com/@Evin0126'
									target='_blank'
									rel='noopener noreferrer'
									className='text-[var(--color-footer-link)] hover:text-[var(--color-footer-link-hover)] transition-colors'
								>
									<Youtube className='inline-block mr-1' />
									Youtube
								</a>
							</li>
						</ul>
					</div>
				</div>
			</div>
		</footer>
	);
}

export default memo(Footer);
