import React, { useState, useEffect, useMemo, useCallback } from "react";
import {
	MessageSquare,
	Send,
	User,
	Loader2,
	Edit3,
	Trash2,
	AlertTriangle,
	ChevronDown,
	ExternalLink,
} from "lucide-react";
import { useNavigate, Link, useLocation } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";

const BuildLocation = ({ buildId, championName }) => {
	if (!buildId || buildId === "global") return null;
	return (
		<Link
			to={`/builds/detail/${buildId}`}
			className="inline-flex items-center gap-1 text-[10px] font-mono-tech tactical-accent-cyan bg-[var(--tactical-accent-cyan)]/10 px-2 py-0.5 border border-[var(--tactical-accent-cyan)]/30 clip-chamfer-sm hover:bg-[var(--tactical-accent-cyan)]/20 transition"
		>
			<ExternalLink size={10} />
			<span>BUILD: {championName || buildId}</span>
		</Link>
	);
};

const CommentForm = ({
	initialValue = "",
	onCommentPosted,
	parentId = null,
	buildId = "global",
	championName = null,
	replyToUsername = null,
	onCancel,
	isEdit = false,
	commentId = null,
	tUI,
}) => {
	const { user, token } = useAuth();
	const [content, setContent] = useState(initialValue);
	const [isSubmitting, setIsSubmitting] = useState(false);
	const navigate = useNavigate();
	const location = useLocation();

	const handleSubmit = async (e) => {
		e.preventDefault();
		if (!content.trim()) return;
		setIsSubmitting(true);
		const apiUrl = import.meta.env.VITE_API_URL;

		try {
			let res;
			if (isEdit) {
				res = await fetch(`${apiUrl}/api/comments/${commentId}`, {
					method: "PUT",
					headers: {
						"Content-Type": "application/json",
						Authorization: `Bearer ${token}`,
					},
					body: JSON.stringify({ content: content.trim(), buildId }),
				});
			} else {
				res = await fetch(`${apiUrl}/api/builds/${buildId}/comments`, {
					method: "POST",
					headers: {
						"Content-Type": "application/json",
						Authorization: `Bearer ${token}`,
					},
					body: JSON.stringify({
						content: content.trim(),
						parentId,
						championName,
					}),
				});
			}

			const data = await res.json();
			if (res.ok) {
				if (onCommentPosted) onCommentPosted(data);
				if (onCancel) onCancel();
				if (!isEdit) setContent("");
			}
		} catch (err) {
			console.error("Comment submit error:", err);
		} finally {
			setIsSubmitting(false);
		}
	};

	if (!user) {
		return (
			<div className="tactical-box border p-5 clip-chamfer-sm flex flex-col sm:flex-row items-center justify-between gap-4">
				<div className="flex items-center gap-3 tactical-text-sub text-sm">
					<div className="w-9 h-9 tactical-card border flex items-center justify-center tactical-accent-lime clip-chamfer-sm shrink-0">
						<User className="w-4 h-4" />
					</div>
					<span>
						{tUI("comments.loginToComment") ||
							"Đăng nhập tài khoản để tham gia thảo luận chiến thuật cùng cộng đồng."}
					</span>
				</div>
				<button
					type="button"
					onClick={() =>
						navigate(
							`/auth?mode=login&redirect=${encodeURIComponent(
								location.pathname + location.search
							)}`
						)
					}
					className="px-5 py-2 tactical-btn-primary font-display uppercase tracking-wider text-xs sm:text-sm clip-chamfer-sm transition shadow-[var(--tactical-btn-primary-shadow)] shrink-0"
				>
					{tUI("common.login") || "ĐĂNG NHẬP"}
				</button>
			</div>
		);
	}

	return (
		<form onSubmit={handleSubmit} className="space-y-3">
			<div className="flex items-start gap-3">
				<div className="w-10 h-10 tactical-btn-primary font-display font-bold text-lg flex items-center justify-center clip-chamfer-sm shrink-0 shadow-[var(--tactical-btn-primary-shadow)]">
					{(user.name || user.username || "U").charAt(0).toUpperCase()}
				</div>
				<div className="flex-1 space-y-2">
					<div className="flex items-center justify-between">
						<span className="font-display text-base uppercase tactical-text-main tracking-wide">
							{user.name || user.username}
						</span>
						<span className="font-mono-tech text-[10px] tactical-badge-cyan px-2 py-0.5 clip-chamfer-sm">
							{replyToUsername ? `@${replyToUsername}` : "PILOT DEBRIEF"}
						</span>
					</div>
					<textarea
						value={content}
						onChange={(e) => setContent(e.target.value)}
						placeholder={
							replyToUsername
								? `@${replyToUsername} ...`
								: tUI("comments.writeComment") ||
								  `Chia sẻ ý kiến chiến thuật hoặc kinh nghiệm chơi...`
						}
						rows={Math.min(5, Math.max(2, content.split("\n").length))}
						className="w-full tactical-box border focus:border-[var(--tactical-accent-lime)] tactical-text-main text-sm p-3.5 clip-chamfer-sm outline-none resize-none transition placeholder:text-gray-500 focus:shadow-[0_0_15px_rgba(34,197,94,0.15)] leading-relaxed"
					/>
				</div>
			</div>
			<div className="flex items-center justify-between pt-1">
				<span className="text-[11px] font-mono-tech tactical-text-dim">
					// TACTICAL DEBRIEF • KEEP IT CONSTRUCTIVE
				</span>
				<div className="flex items-center gap-2">
					{onCancel && (
						<button
							type="button"
							onClick={onCancel}
							className="px-3.5 py-1.5 text-xs font-mono-tech uppercase tactical-text-dim hover:tactical-text-main tactical-box border clip-chamfer-sm transition"
						>
							{tUI("common.cancel") || "HỦY"}
						</button>
					)}
					<button
						type="submit"
						disabled={isSubmitting || !content.trim()}
						className="px-5 py-2 tactical-btn-primary font-display uppercase tracking-wider text-xs sm:text-sm clip-chamfer-sm transition flex items-center gap-2 shadow-[var(--tactical-btn-primary-shadow)] disabled:opacity-40 disabled:cursor-not-allowed"
					>
						{isSubmitting ? (
							<>
								<Loader2 className="w-4 h-4 animate-spin" />
								<span>ĐANG GỬI...</span>
							</>
						) : (
							<>
								<Send className="w-3.5 h-3.5" />
								<span>
									{isEdit
										? tUI("common.save") || "LƯU"
										: tUI("comments.postBtn") || "GỬI BÌNH LUẬN"}
								</span>
							</>
						)}
					</button>
				</div>
			</div>
		</form>
	);
};

const CommentItem = ({
	comment,
	onDeleted,
	onUpdated,
	onPosted,
	championName,
	tUI,
	language,
}) => {
	const { user, token } = useAuth();
	const [isReplying, setIsReplying] = useState(false);
	const [isEditing, setIsEditing] = useState(false);
	const [showDeleteModal, setShowDeleteModal] = useState(false);
	const [isDeleting, setIsDeleting] = useState(false);

	const isOwner = user && user.sub === (comment.sub || comment.user_sub);

	const handleDelete = async () => {
		setIsDeleting(true);
		try {
			const res = await fetch(
				`${import.meta.env.VITE_API_URL}/api/comments/${comment.id}?buildId=${comment.buildId}`,
				{
					method: "DELETE",
					headers: { Authorization: `Bearer ${token}` },
				}
			);
			if (res.ok) {
				onDeleted(comment.id);
				setShowDeleteModal(false);
			}
		} catch (err) {
			console.error("Delete error:", err);
		} finally {
			setIsDeleting(false);
		}
	};

	return (
		<div className="tactical-card border p-5 clip-chamfer-sm space-y-3 hover:border-[var(--tactical-accent-lime)]/50 transition group">
			{/* Top Header */}
			<div className="flex flex-wrap items-center justify-between gap-2">
				<div className="flex items-center space-x-3">
					<div className="w-9 h-9 rounded tactical-box border group-hover:border-[var(--tactical-accent-lime)] flex items-center justify-center tactical-accent-lime font-display text-base font-bold shrink-0 transition">
						{(comment.displayName || comment.username || "U").charAt(0).toUpperCase()}
					</div>
					<div>
						<div className="flex items-center space-x-2">
							<span className="font-display text-lg uppercase tracking-wide tactical-accent-lime">
								{comment.displayName || comment.username}
							</span>
							<BuildLocation
								buildId={comment.buildId}
								championName={comment.championName}
							/>
						</div>
						<div className="text-[11px] font-mono-tech tactical-text-dim">
							{new Date(comment.createdAt).toLocaleString(
								language === "vi" ? "vi-VN" : "en-US"
							)}
						</div>
					</div>
				</div>

				<span className="font-mono-tech text-[10px] tactical-badge-lime px-2 py-0.5 clip-chamfer-sm font-bold">
					VERIFIED DUELIST
				</span>
			</div>

			{/* Comment Content or Edit Form */}
			{isEditing ? (
				<div className="pt-2">
					<CommentForm
						initialValue={comment.content}
						isEdit={true}
						commentId={comment.id}
						buildId={comment.buildId}
						championName={championName}
						onCommentPosted={(u) => {
							setIsEditing(false);
							onUpdated(u);
						}}
						onCancel={() => setIsEditing(false)}
						tUI={tUI}
					/>
				</div>
			) : (
				<p className="text-sm sm:text-base tactical-text-sub leading-relaxed whitespace-pre-wrap break-words pt-1 font-sans">
					"{comment.content}"
					{comment.isEdited && (
						<span className="text-[10px] font-mono-tech tactical-text-dim italic ml-2">
							({tUI("comments.edited") || "Đã chỉnh sửa"})
						</span>
					)}
				</p>
			)}

			{/* Actions row */}
			{!isEditing && (
				<div className="flex items-center gap-2 pt-2 border-t tactical-section">
					<button
						type="button"
						onClick={() => setIsReplying(!isReplying)}
						className="text-xs font-mono-tech uppercase tactical-text-dim hover:text-[var(--tactical-accent-cyan)] transition flex items-center gap-1.5 px-2.5 py-1 tactical-box border hover:border-[var(--tactical-accent-cyan)]/40 clip-chamfer-sm"
					>
						<MessageSquare className="w-3.5 h-3.5" />
						<span>{tUI("comments.replyBtn") || "Trả lời"}</span>
					</button>

					{isOwner && (
						<>
							<button
								type="button"
								onClick={() => setIsEditing(true)}
								className="text-xs font-mono-tech uppercase tactical-text-dim hover:text-[var(--tactical-accent-lime)] transition flex items-center gap-1 px-2.5 py-1 tactical-box border hover:border-[var(--tactical-accent-lime)]/40 clip-chamfer-sm"
							>
								<Edit3 className="w-3.5 h-3.5" />
								<span>{tUI("common.edit") || "Sửa"}</span>
							</button>
							<button
								type="button"
								onClick={() => setShowDeleteModal(true)}
								className="text-xs font-mono-tech uppercase text-red-400 hover:text-red-300 transition flex items-center gap-1 px-2.5 py-1 tactical-box border hover:border-red-500/40 clip-chamfer-sm"
							>
								<Trash2 className="w-3.5 h-3.5" />
								<span>{tUI("common.delete") || "Xóa"}</span>
							</button>
						</>
					)}
				</div>
			)}

			{/* Reply Form */}
			{isReplying && (
				<div className="ml-4 sm:ml-8 mt-3 pt-3 border-l-2 border-[var(--tactical-accent-cyan)] pl-4">
					<CommentForm
						buildId={comment.buildId}
						parentId={comment.id}
						championName={championName}
						replyToUsername={comment.displayName || comment.username}
						onCommentPosted={(c) => {
							setIsReplying(false);
							onPosted(c);
						}}
						onCancel={() => setIsReplying(false)}
						tUI={tUI}
					/>
				</div>
			)}

			{/* Nested replies */}
			{comment.replies && comment.replies.length > 0 && (
				<div className="ml-3 sm:ml-8 mt-4 pl-3 sm:pl-4 border-l-2 tactical-section space-y-3">
					{comment.replies.map((reply) => (
						<CommentItem
							key={reply.id}
							comment={reply}
							onDeleted={onDeleted}
							onUpdated={onUpdated}
							onPosted={onPosted}
							championName={championName}
							tUI={tUI}
							language={language}
						/>
					))}
				</div>
			)}

			{/* Delete Confirmation Modal */}
			{showDeleteModal && (
				<div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
					<div className="tactical-panel border-2 border-red-500/80 p-6 clip-chamfer max-w-md w-full shadow-[0_0_30px_rgba(239,68,68,0.25)] space-y-4">
						<div className="flex items-center space-x-2 text-red-400">
							<AlertTriangle className="w-5 h-5 shrink-0" />
							<h4 className="font-display text-xl uppercase italic tracking-wide tactical-text-main">
								{tUI("comments.deleteConfirmTitle") || "XÁC NHẬN XÓA BÌNH LUẬN"}
							</h4>
						</div>
						<p className="text-sm tactical-text-sub leading-relaxed">
							{tUI("comments.deleteWarning") ||
								"Hành động này không thể hoàn tác. Bạn có chắc chắn muốn xóa bình luận này không?"}
						</p>
						<div className="flex justify-end gap-3 pt-2 border-t tactical-section">
							<button
								type="button"
								onClick={() => setShowDeleteModal(false)}
								disabled={isDeleting}
								className="px-4 py-2 text-xs font-mono-tech uppercase tracking-wider tactical-text-dim hover:tactical-text-main tactical-box border clip-chamfer-sm transition"
							>
								{tUI("common.cancel") || "HỦY BỎ"}
							</button>
							<button
								type="button"
								onClick={handleDelete}
								disabled={isDeleting}
								className="px-5 py-2 text-xs font-mono-tech uppercase tracking-wider text-white bg-red-600 hover:bg-red-500 clip-chamfer-sm transition flex items-center gap-1.5 shadow-[0_0_15px_rgba(239,68,68,0.4)]"
							>
								{isDeleting ? (
									<Loader2 className="w-4 h-4 animate-spin" />
								) : (
									<Trash2 className="w-4 h-4" />
								)}
								<span>{tUI("common.delete") || "XÓA"}</span>
							</button>
						</div>
					</div>
				</div>
			)}
		</div>
	);
};

const ChampionCommunitySection = ({ champion, tUI, tDynamic, language }) => {
	const [comments, setComments] = useState([]);
	const [loading, setLoading] = useState(true);
	const [nextKey, setNextKey] = useState(null);
	const [isLoadingMore, setIsLoadingMore] = useState(false);

	const champName = tDynamic(champion, "name");
	const champId = champion?.championID;

	const fetchLatest = useCallback(
		async (isLoadMore = false) => {
			if (isLoadMore) setIsLoadingMore(true);
			else setLoading(true);

			try {
				let url = `${import.meta.env.VITE_API_URL}/api/comments/latest?limit=15`;
				if (champId) url += `&championID=${champId}`;
				if (isLoadMore && nextKey)
					url += `&lastKey=${encodeURIComponent(JSON.stringify(nextKey))}`;

				const res = await fetch(url);
				if (res.ok) {
					const data = await res.json();
					setComments((prev) =>
						isLoadMore ? [...prev, ...data.comments] : data.comments
					);
					setNextKey(data.nextKey);
				}
			} catch (err) {
				console.error("Fetch comments error:", err);
			} finally {
				setLoading(false);
				setIsLoadingMore(false);
			}
		},
		[champId, nextKey]
	);

	useEffect(() => {
		if (champId) {
			fetchLatest();
		}
	}, [champId]);

	const commentTree = useMemo(() => {
		const map = {};
		const roots = [];
		comments.forEach((c) => (map[c.id] = { ...c, replies: [] }));
		comments.forEach((c) => {
			if (c.parentId && map[c.parentId])
				map[c.parentId].replies.push(map[c.id]);
			else roots.push(map[c.id]);
		});
		return roots.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
	}, [comments]);

	if (!champion) return null;

	return (
		<section id="community" className="py-20 border-b tactical-section bg-hazard-stripes relative">
			<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
				{/* Section Header */}
				<div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
					<div>
						<div className="tactical-accent-lime font-bold uppercase tracking-widest text-xs sm:text-sm">
							// {tUI("championDetail.tactical.discussionSub") || "KÊNH TRUYỀN TIN // ĐÓNG GÓP Ý KIẾN & KINH NGHIỆM CHIẾN THUẬT"}
						</div>
						<h2 className="font-display text-5xl sm:text-6xl uppercase italic tactical-text-main mt-1 flex items-center gap-3">
							<MessageSquare className="w-10 h-10 tactical-accent-lime" />
							<span>{tUI("championDetail.tactical.discussionTitle") || "BÌNH LUẬN & THẢO LUẬN"}</span>
						</h2>
					</div>

					<span className="font-mono-tech text-xs tactical-accent-cyan tactical-box border px-3.5 py-2 clip-chamfer-sm self-start sm:self-end">
						VERIFIED DUELISTS // {comments.length} ENTRIES
					</span>
				</div>

				{/* Input Form Box */}
				<div className="tactical-panel border p-5 sm:p-7 clip-chamfer shadow-xl">
					<CommentForm
						onCommentPosted={(c) => setComments((p) => [c, ...p])}
						championName={champName}
						tUI={tUI}
					/>
				</div>

				{/* Comments List */}
				{loading ? (
					<div className="tactical-panel border p-12 clip-chamfer text-center space-y-3">
						<Loader2 className="w-8 h-8 animate-spin tactical-accent-lime mx-auto" />
						<div className="font-mono-tech text-xs uppercase tracking-widest tactical-text-dim">
							// TRANSMITTING FIELD COMMS...
						</div>
					</div>
				) : commentTree.length > 0 ? (
					<div className="space-y-4">
						{commentTree.map((root) => (
							<CommentItem
								key={root.id}
								comment={root}
								onDeleted={(id) =>
									setComments((p) => p.filter((c) => c.id !== id && c.parentId !== id))
								}
								onUpdated={(u) =>
									setComments((p) => p.map((c) => (c.id === u.id ? u : c)))
								}
								onPosted={(c) => setComments((p) => [c, ...p])}
								championName={champName}
								tUI={tUI}
								language={language}
							/>
						))}

						{/* Load More Button */}
						{nextKey && (
							<button
								type="button"
								onClick={() => fetchLatest(true)}
								disabled={isLoadingMore}
								className="w-full py-3.5 tactical-card hover:border-[var(--tactical-accent-lime)] font-mono-tech text-xs uppercase tracking-widest tactical-accent-lime transition flex items-center justify-center gap-2 clip-chamfer-sm shadow-lg disabled:opacity-50 mt-4 border"
							>
								{isLoadingMore ? (
									<>
										<Loader2 className="w-4 h-4 animate-spin" />
										<span>ĐANG TẢI THÊM BÌNH LUẬN...</span>
									</>
								) : (
									<>
										<ChevronDown className="w-4 h-4" />
										<span>XEM THÊM BÌNH LUẬN CŨ HƠN</span>
									</>
								)}
							</button>
						)}
					</div>
				) : (
					<div className="text-center py-16 tactical-text-dim font-mono-tech text-sm border-2 border-dashed tactical-card clip-chamfer p-8 space-y-2">
						<MessageSquare className="w-8 h-8 text-gray-400 mx-auto" />
						<div className="tactical-text-main font-display text-xl uppercase">
							CHƯA CÓ BÌNH LUẬN NÀO
						</div>
						<div className="text-xs tactical-text-dim">
							Hãy là người đầu tiên để lại ý kiến hoặc chia sẻ mẹo chiến thuật cho vị tướng này!
						</div>
					</div>
				)}
			</div>
		</section>
	);
};

export default ChampionCommunitySection;
