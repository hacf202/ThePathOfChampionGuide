// src/pages/TermsOfUse.jsx
import { memo } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "../../hooks/useTranslation"; // 🟢 Import Hook

function TermsOfUse() {
	const { language } = useTranslation(); // 🟢 Khởi tạo Hook

	return (
		<main className='min-h-screen bg-[var(--color-page-bg)] py-12'>
			<div className='max-w-[900px] mx-auto px-4 sm:px-6'>
				{/* Tiêu đề */}
				<div className='text-center mb-12'>
					<h1 className='text-4xl sm:text-5xl font-bold text-[var(--color-text-primary)] mb-4'>
						{language === "vi" ? "Điều Khoản Sử Dụng" : "Terms of Use"}
					</h1>
					<p className='text-lg text-[var(--color-text-secondary)]'>
						{language === "vi" ? (
							<>
								Chào mừng bạn đến với <strong>Guide POC</strong>. Vui lòng đọc
								kỹ các điều khoản dưới đây trước khi sử dụng.
							</>
						) : (
							<>
								Welcome to <strong>Guide POC</strong>. Please read these terms
								carefully before using.
							</>
						)}
					</p>
				</div>

				{/* Nội dung chính */}
				<div className='prose prose-lg max-w-none text-[var(--color-text-secondary)] space-y-10 leading-relaxed'>
					{/* 1. Dự án do người hâm mộ phát triển */}
					<section>
						<h2 className='text-2xl font-bold text-[var(--color-text-primary)] mb-4'>
							{language === "vi"
								? "1. Dự án do người hâm mộ phát triển"
								: "1. Fan-made Project"}
						</h2>
						{language === "vi" ? (
							<>
								<p>
									<strong>Guide POC</strong> là một trang web{" "}
									<strong>độc lập</strong>, được xây dựng và vận hành hoàn toàn
									bởi <strong>người hâm mộ</strong> của{" "}
									<i>Legends of Runeterra</i>.
								</p>
								<p className='mt-3'>
									Chúng tôi{" "}
									<strong>không liên kết, được xác nhận, hoặc tài trợ</strong>{" "}
									bởi <strong>Riot Games</strong>, <strong>Riot Forge</strong>,
									hoặc bất kỳ công ty con nào liên quan.
								</p>
								<p className='mt-3'>
									Mọi tên gọi, hình ảnh, nhân vật, cơ chế trò chơi và tài sản
									trí tuệ trong <i>Path of Champions</i> đều thuộc quyền sở hữu
									hợp pháp của <strong>Riot Games</strong>.
								</p>
							</>
						) : (
							<>
								<p>
									<strong>Guide POC</strong> is an <strong>independent</strong>{" "}
									website, built and operated entirely by <strong>fans</strong>{" "}
									of <i>Legends of Runeterra</i>.
								</p>
								<p className='mt-3'>
									We are{" "}
									<strong>
										not affiliated with, endorsed by, or sponsored by
									</strong>{" "}
									<strong>Riot Games</strong>, <strong>Riot Forge</strong>, or
									any of their subsidiaries.
								</p>
								<p className='mt-3'>
									All names, images, characters, game mechanics, and
									intellectual property within <i>Path of Champions</i> legally
									belong to <strong>Riot Games</strong>.
								</p>
							</>
						)}
					</section>

					{/* 2. Sử dụng Nội dung */}
					<section>
						<h2 className='text-2xl font-bold text-[var(--color-text-primary)] mb-4'>
							{language === "vi" ? "2. Sử dụng Nội dung" : "2. Content Usage"}
						</h2>
						{language === "vi" ? (
							<>
								<p>
									Tất cả nội dung gốc trên <strong>Guide POC</strong> — bao gồm
									hướng dẫn build, lộ trình farm, phân tích relic, hình ảnh minh
									họa — đều được tạo ra bởi cộng đồng{" "}
									<strong>
										chỉ nhằm mục đích chia sẻ thông tin và hỗ trợ người chơi
									</strong>
									.
								</p>
								<ul className='list-decimal pl-6 mt-4 space-y-2 font-medium'>
									<li>
										Bạn được <strong>tự do đọc, chia sẻ, hoặc liên kết</strong>{" "}
										đến nội dung của chúng tôi cho mục đích{" "}
										<strong>cá nhân hoặc phi thương mại</strong>.
									</li>
									<li>
										<strong>
											Vui lòng không sao chép, tải lại hoặc tái phân phối
										</strong>{" "}
										nội dung mà <strong>không ghi rõ nguồn</strong>.
									</li>
									<li>
										Nếu sử dụng lại (bản dịch, video, bài viết),{" "}
										<strong>bắt buộc phải ghi nguồn đầy đủ</strong> và{" "}
										<strong>liên kết trở lại trang gốc</strong>.
									</li>
								</ul>
							</>
						) : (
							<>
								<p>
									All original content on <strong>Guide POC</strong> — including
									build guides, farming routes, relic analysis, and
									illustrations — is created by the community{" "}
									<strong>
										solely for the purpose of sharing information and assisting
										players
									</strong>
									.
								</p>
								<ul className='list-decimal pl-6 mt-4 space-y-2 font-medium'>
									<li>
										You are <strong>free to read, share, or link</strong> to our
										content for <strong>personal or non-commercial</strong>{" "}
										purposes.
									</li>
									<li>
										<strong>
											Please do not copy, re-upload, or redistribute
										</strong>{" "}
										our content <strong>without proper credit</strong>.
									</li>
									<li>
										If reusing (translations, videos, articles),{" "}
										<strong>full credit is mandatory</strong> along with a{" "}
										<strong>link back to the original page</strong>.
									</li>
								</ul>
							</>
						)}
					</section>

					{/* 3. Tính chính xác của Thông tin */}
					<section>
						<h2 className='text-2xl font-bold text-[var(--color-text-primary)] mb-4'>
							{language === "vi"
								? "3. Tính chính xác của Thông tin"
								: "3. Information Accuracy"}
						</h2>
						{language === "vi" ? (
							<>
								<p>
									Chúng tôi luôn nỗ lực cập nhật thông tin{" "}
									<strong>chính xác và mới nhất</strong> dựa trên datamine, thử
									nghiệm thực tế và bản vá chính thức.
								</p>
								<p className='mt-3'>
									Tuy nhiên, <strong>cơ chế trò chơi có thể thay đổi</strong> do
									cập nhật, hotfix hoặc thay đổi balance.{" "}
									<strong>
										Guide POC không đảm bảo 100% chính xác mọi lúc
									</strong>
									.
								</p>
								<p className='mt-3'>
									Hãy sử dụng hướng dẫn của chúng tôi như một{" "}
									<strong>gợi ý tham khảo</strong>, không phải quy tắc bắt buộc.
								</p>
							</>
						) : (
							<>
								<p>
									We always strive to keep information{" "}
									<strong>accurate and up-to-date</strong> based on datamines,
									practical testing, and official patches.
								</p>
								<p className='mt-3'>
									However, <strong>game mechanics may change</strong> due to
									updates, hotfixes, or balance changes.{" "}
									<strong>
										Guide POC does not guarantee 100% accuracy at all times
									</strong>
									.
								</p>
								<p className='mt-3'>
									Please treat our guides as{" "}
									<strong>reference suggestions</strong>, not absolute rules.
								</p>
							</>
						)}
					</section>

					{/* 4. Trách nhiệm của người dùng */}
					<section>
						<h2 className='text-2xl font-bold text-[var(--color-text-primary)] mb-4'>
							{language === "vi"
								? "4. Trách nhiệm của người dùng"
								: "4. User Responsibilities"}
						</h2>
						{language === "vi" ? (
							<>
								<p>
									Khi sử dụng <strong>Guide POC</strong>, bạn đồng ý:
								</p>
								<ul className='list-decimal pl-6 mt-4 space-y-2 font-medium'>
									<li>
										Sử dụng nội dung cho{" "}
										<strong>mục đích hợp pháp và tôn trọng</strong>.
									</li>
									<li>
										<strong>
											Không cố ý phá hoại, tấn công, hoặc lạm dụng
										</strong>{" "}
										tài nguyên website (bao gồm spam, bot, DDoS).
									</li>
									<li>
										Chấp nhận rằng tất cả nội dung được cung cấp{" "}
										<strong>"nguyên trạng"</strong> —{" "}
										<strong>không có bảo hành</strong> về tính chính xác, đầy đủ
										hoặc khả dụng.
									</li>
								</ul>
							</>
						) : (
							<>
								<p>
									By using <strong>Guide POC</strong>, you agree to:
								</p>
								<ul className='list-decimal pl-6 mt-4 space-y-2 font-medium'>
									<li>
										Use the content for{" "}
										<strong>legal and respectful purposes</strong>.
									</li>
									<li>
										<strong>
											Not intentionally sabotage, attack, or abuse
										</strong>{" "}
										website resources (including spam, bots, DDoS).
									</li>
									<li>
										Accept that all content is provided <strong>"as is"</strong>{" "}
										— <strong>without warranty</strong> regarding accuracy,
										completeness, or availability.
									</li>
								</ul>
							</>
						)}
					</section>

					{/* 5. Liên kết ngoài */}
					<section>
						<h2 className='text-2xl font-bold text-[var(--color-text-primary)] mb-4'>
							{language === "vi" ? "5. Liên kết ngoài" : "5. External Links"}
						</h2>
						{language === "vi" ? (
							<>
								<p>
									Trang web có thể chứa liên kết đến{" "}
									<strong>trang web, video, hoặc tài nguyên bên thứ ba</strong>{" "}
									(YouTube, Discord, wiki, v.v.).
								</p>
								<p className='mt-3'>
									Chúng tôi <strong>không chịu trách nhiệm</strong> về nội dung,
									tính chính xác, hoặc chính sách bảo mật của các trang đó.
								</p>
							</>
						) : (
							<>
								<p>
									The website may contain links to{" "}
									<strong>third-party websites, videos, or resources</strong>{" "}
									(YouTube, Discord, wikis, etc.).
								</p>
								<p className='mt-3'>
									We are <strong>not responsible</strong> for the content,
									accuracy, or privacy policies of those sites.
								</p>
							</>
						)}
					</section>

					{/* 6. Thay đổi Điều khoản */}
					<section>
						<h2 className='text-2xl font-bold text-[var(--color-text-primary)] mb-4'>
							{language === "vi"
								? "6. Thay đổi Điều khoản"
								: "6. Changes to Terms"}
						</h2>
						{language === "vi" ? (
							<>
								<p>
									Chúng tôi có quyền <strong>cập nhật hoặc sửa đổi</strong> các
									điều khoản này{" "}
									<strong>bất kỳ lúc nào mà không cần báo trước</strong>.
								</p>
								<p className='mt-3'>
									Việc bạn <strong>tiếp tục sử dụng trang web</strong> sau khi
									thay đổi đồng nghĩa với việc{" "}
									<strong>chấp nhận phiên bản mới nhất</strong>.
								</p>
							</>
						) : (
							<>
								<p>
									We reserve the right to <strong>update or modify</strong>{" "}
									these terms <strong>at any time without prior notice</strong>.
								</p>
								<p className='mt-3'>
									Your <strong>continued use of the website</strong> following
									any changes signifies your{" "}
									<strong>acceptance of the latest version</strong>.
								</p>
							</>
						)}
					</section>

					{/* Cập nhật lần cuối */}
					<section className='text-center pt-8 border-t border-[var(--color-border)]'>
						<p className='text-sm text-[var(--color-text-secondary)]'>
							<strong>
								{language === "vi" ? "Cập nhật lần cuối:" : "Last updated:"}
							</strong>{" "}
							04/11/2025
						</p>
						<Link
							to='/'
							className='inline-block mt-6 px-8 py-3 bg-[var(--color-btn-primary-bg)] text-[var(--color-btn-primary-text)] font-medium rounded-md hover:bg-[var(--color-btn-primary-hover-bg)] transition-colors'
						>
							{language === "vi" ? "Quay về Trang Chủ" : "Back to Home"}
						</Link>
					</section>
				</div>
			</div>
		</main>
	);
}

export default memo(TermsOfUse);
