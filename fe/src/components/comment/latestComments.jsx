// src/components/comment/latestComments.jsx
import React, { useState, useEffect, useMemo, useCallback } from "react";
import {
	Send,
	MessageSquare,
	User,
	Loader2,
	Edit,
	Trash2,
	MapPin,
	ExternalLink,
} from "lucide-react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import Button from "../common/button";
import Modal from "../common/modal";

// --- Hiển thị vị trí bình luận (Champion hoặc Global) ---
const BuildLocation = ({ buildId, championName }) => {
	if (buildId === "global") {
		return (
			<span className='inline-flex items-center gap-1 text-[10px] bg-surface-hover text-text-secondary px-2 py-0.5 rounded-full border border-border ml-2'>
				<MapPin size={10} /> Bình luận tổng
			</span>
		);
	}
	return (
		<Link
			to={`/builds/detail/${buildId}`}
			className='inline-flex items-center gap-1 text-[10px] bg-primary-500/10 text-primary-500 px-2 py-0.5 rounded-full border border-primary-500/20 ml-2 hover:bg-primary-500/20 transition-colors'
		>
			<ExternalLink size={10} /> {championName}
		</Link>
	);
};

// --- Form nhập liệu: Xử lý Enter gửi bài và Shift+Enter xuống dòng ---
const CommentForm = ({
	onCommentPosted,
	parentId = null,
	replyToUsername = null,
	onCancel,
}) => {
	const { user, token } = useAuth();
	const navigate = useNavigate();
	const [content, setContent] = useState("");
	const [isSubmitting, setIsSubmitting] = useState(false);
	const apiUrl = import.meta.env.VITE_API_URL;

	const handleSubmit = async e => {
		if (e) e.preventDefault();
		if (!content.trim() || isSubmitting) return;

		setIsSubmitting(true);
		try {
			const res = await fetch(`${apiUrl}/api/builds/global/comments`, {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
					Authorization: `Bearer ${token}`,
				},
				body: JSON.stringify({
					content: content.trim(),
					parentId,
					replyToUsername,
				}),
			});

			if (res.ok) {
				const newComment = await res.json();
				onCommentPosted(newComment);
				setContent("");
				onCancel?.();
			}
		} catch (err) {
			console.error("Lỗi gửi bình luận:", err);
		} finally {
			setIsSubmitting(false);
		}
	};

	const handleKeyDown = e => {
		if (e.key === "Enter" && !e.shiftKey) {
			e.preventDefault();
			handleSubmit();
		}
	};

	if (!user) {
		return (
			<div className='text-center py-4 bg-surface-hover rounded-lg border border-dashed border-border'>
				<p className='text-text-secondary mb-3 text-sm'>
					Vui lòng đăng nhập để tham gia thảo luận.
				</p>
				<Button variant='outline' size='sm' onClick={() => navigate("/auth")}>
					Đăng nhập
				</Button>
			</div>
		);
	}

	return (
		<form onSubmit={handleSubmit} className='space-y-3'>
			<textarea
				value={content}
				onChange={e => setContent(e.target.value)}
				onKeyDown={handleKeyDown}
				placeholder={
					replyToUsername
						? `Trả lời @${replyToUsername}...`
						: "Viết bình luận (Enter để gửi)..."
				}
				className='w-full bg-surface-bg border border-border rounded-lg p-3 text-text-primary focus:ring-2 focus:ring-primary-500 outline-none min-h-[80px] transition-all resize-none'
				autoFocus={!!parentId}
			/>
			<div className='flex justify-between items-center'>
				<span className='text-[10px] text-text-secondary italic'>
					Nhấn Enter để gửi, Shift + Enter để xuống dòng
				</span>
				<div className='flex gap-2'>
					{onCancel && (
						<Button variant='ghost' size='sm' onClick={onCancel}>
							Hủy
						</Button>
					)}
					<Button
						type='submit'
						variant='primary'
						size='sm'
						disabled={isSubmitting || !content.trim()}
					>
						{isSubmitting ? (
							<Loader2 className='animate-spin' size={16} />
						) : (
							<Send size={18} />
						)}
						{parentId ? "Trả lời" : "Gửi"}
					</Button>
				</div>
			</div>
		</form>
	);
};

// --- Item hiển thị: Hiển thị ChampionName cho bình luận gốc ---
const CommentItem = ({
	comment,
	onDeleted,
	onUpdated,
	onPosted,
	isParentRoot = true,
}) => {
	const { user, token } = useAuth();
	const [isEditing, setIsEditing] = useState(false);
	const [editContent, setEditContent] = useState(comment.content);
	const [isReplying, setIsReplying] = useState(false);
	const [showDeleteModal, setShowDeleteModal] = useState(false);
	const [loadingAction, setLoadingAction] = useState(false);
	const apiUrl = import.meta.env.VITE_API_URL;

	const isOwner = user && comment.user_sub === user.sub;
	const isRoot = !comment.parentId;
	const indentClass =
		!isRoot && isParentRoot
			? "ml-6 sm:ml-12 border-l-2 border-border pl-4 mt-2"
			: "ml-0";

	const handleUpdate = async () => {
		setLoadingAction(true);
		try {
			const res = await fetch(
				`${apiUrl}/api/builds/${comment.buildId}/comments/${comment.id}`,
				{
					method: "PUT",
					headers: {
						"Content-Type": "application/json",
						Authorization: `Bearer ${token}`,
					},
					body: JSON.stringify({ content: editContent }),
				},
			);
			if (res.ok) {
				const updated = await res.json();
				onUpdated(updated);
				setIsEditing(false);
			}
		} catch (err) {
			console.error(err);
		} finally {
			setLoadingAction(false);
		}
	};

	const handleDelete = async () => {
		setLoadingAction(true);
		try {
			const res = await fetch(
				`${apiUrl}/api/builds/${comment.buildId}/comments/${comment.id}`,
				{
					method: "DELETE",
					headers: { Authorization: `Bearer ${token}` },
				},
			);
			if (res.ok) onDeleted(comment.id);
		} catch (err) {
			console.error(err);
		} finally {
			setLoadingAction(false);
			setShowDeleteModal(false);
		}
	};

	return (
		<div className={`py-4 ${indentClass}`}>
			<div className='flex justify-between items-start'>
				<div className='flex items-center flex-wrap gap-2'>
					<div className='w-8 h-8 rounded-full bg-surface-hover flex items-center justify-center border border-border'>
						<User size={16} className='text-text-secondary' />
					</div>
					<div className='flex items-center flex-wrap'>
						<span className='font-bold text-text-primary text-sm'>
							{comment.username}
						</span>
						{isRoot && (
							<BuildLocation
								buildId={comment.buildId}
								championName={comment.championName}
							/>
						)}
						<span className='ml-2 text-[10px] text-text-secondary uppercase'>
							{new Date(comment.createdAt).toLocaleString("vi-VN")}
						</span>
					</div>
				</div>
				{isOwner && (
					<div className='flex gap-1'>
						<button
							onClick={() => setIsEditing(true)}
							className='p-1 text-text-secondary hover:text-primary-500'
						>
							<Edit size={14} />
						</button>
						<button
							onClick={() => setShowDeleteModal(true)}
							className='p-1 text-red-500'
						>
							<Trash2 size={14} />
						</button>
					</div>
				)}
			</div>

			{isEditing ? (
				<div className='mt-2 space-y-2'>
					<textarea
						value={editContent}
						onChange={e => setEditContent(e.target.value)}
						className='w-full p-2 border border-border rounded bg-surface-bg text-sm outline-none'
					/>
					<div className='flex justify-end gap-2'>
						<Button
							size='sm'
							variant='ghost'
							onClick={() => setIsEditing(false)}
						>
							Hủy
						</Button>
						<Button
							size='sm'
							variant='primary'
							onClick={handleUpdate}
							disabled={loadingAction}
						>
							Lưu
						</Button>
					</div>
				</div>
			) : (
				<div className='mt-2 text-text-secondary text-sm sm:text-base whitespace-pre-wrap'>
					{comment.replyToUsername && (
						<span className='text-primary-500 font-bold mr-2'>
							@{comment.replyToUsername}
						</span>
					)}
					{comment.content}
				</div>
			)}

			<button
				onClick={() => setIsReplying(!isReplying)}
				className='mt-2 text-[11px] font-bold text-primary-500 hover:underline flex items-center gap-1'
			>
				<MessageSquare size={10} /> Trả lời
			</button>

			{isReplying && (
				<div className='mt-3'>
					<CommentForm
						parentId={comment.id}
						replyToUsername={comment.username}
						onCommentPosted={c => {
							onPosted(c);
							setIsReplying(false);
						}}
						onCancel={() => setIsReplying(false)}
					/>
				</div>
			)}

			{/* Hiển thị con đệ quy */}
			{comment.replies &&
				comment.replies.map(reply => (
					<CommentItem
						key={reply.id}
						comment={reply}
						onDeleted={onDeleted}
						onUpdated={onUpdated}
						onPosted={onPosted}
						isParentRoot={isRoot}
					/>
				))}

			<Modal
				isOpen={showDeleteModal}
				onClose={() => setShowDeleteModal(false)}
				title='Xóa bình luận?'
			>
				<p className='text-sm'>Hành động này không thể hoàn tác.</p>
				<div className='flex justify-end gap-3 mt-4'>
					<Button variant='ghost' onClick={() => setShowDeleteModal(false)}>
						Hủy
					</Button>
					<Button
						variant='danger'
						onClick={handleDelete}
						disabled={loadingAction}
					>
						Xóa
					</Button>
				</div>
			</Modal>
		</div>
	);
};

// --- Component chính: Quản lý State và Cây bình luận ---
const LatestComments = () => {
	const [allComments, setAllComments] = useState([]);
	const [nextKey, setNextKey] = useState(null);
	const [loading, setLoading] = useState(true);
	const [loadingMore, setLoadingMore] = useState(false);
	const apiUrl = import.meta.env.VITE_API_URL;

	const fetchLatest = useCallback(
		async (isLoadMore = false) => {
			try {
				if (isLoadMore) setLoadingMore(true);
				else setLoading(true);

				const url = new URL(`${apiUrl}/api/comments/latest`);
				if (isLoadMore && nextKey) url.searchParams.append("lastKey", nextKey);

				const res = await fetch(url);
				if (res.ok) {
					const data = await res.json();
					// data.comments lúc này chứa cả root và các reply liên quan từ Backend
					setAllComments(prev =>
						isLoadMore ? [...prev, ...data.comments] : data.comments,
					);
					setNextKey(data.nextKey);
				}
			} catch (err) {
				console.error(err);
			} finally {
				setLoading(false);
				setLoadingMore(false);
			}
		},
		[apiUrl, nextKey],
	);

	useEffect(() => {
		fetchLatest();
	}, []);

	// Xây dựng cây từ mảng phẳng (Bao gồm cả các reply đã load)
	const commentTree = useMemo(() => {
		const map = new Map();
		allComments.forEach(c => map.set(c.id, { ...c, replies: [] }));
		const roots = [];
		allComments.forEach(c => {
			if (c.parentId && map.has(c.parentId)) {
				map.get(c.parentId).replies.push(map.get(c.id));
			} else if (!c.parentId) {
				roots.push(map.get(c.id));
			}
		});
		return roots;
	}, [allComments]);

	const handlePosted = c => setAllComments(prev => [c, ...prev]);
	const handleUpdated = c =>
		setAllComments(prev => prev.map(x => (x.id === c.id ? { ...x, ...c } : x)));
	const handleDeleted = id =>
		setAllComments(prev => prev.filter(x => x.id !== id && x.parentId !== id));

	return (
		<div className='mt-4 border-t border-border pt-4 font-secondary'>
			<h2 className='text-xl sm:text-2xl font-bold mb-4 text-text-primary border-l-4 border-primary-500 pl-4 uppercase'>
				Thảo luận cộng đồng
			</h2>

			<div className='bg-surface-bg rounded-xl border border-border p-2 sm:p-6 shadow-sm'>
				<CommentForm onCommentPosted={handlePosted} />

				{loading ? (
					<div className='flex justify-center py-10'>
						<Loader2 className='animate-spin text-primary-500' />
					</div>
				) : (
					<div className='divide-y divide-border mt-6'>
						{commentTree.length > 0 ? (
							<>
								{commentTree.map(root => (
									<CommentItem
										key={root.id}
										comment={root}
										onDeleted={handleDeleted}
										onUpdated={handleUpdated}
										onPosted={handlePosted}
									/>
								))}
								{nextKey && (
									<div className='flex justify-center pt-6'>
										<Button
											variant='outline'
											onClick={() => fetchLatest(true)}
											disabled={loadingMore}
										>
											{loadingMore && (
												<Loader2 className='animate-spin mr-2' size={16} />
											)}
											Xem thêm bình luận
										</Button>
									</div>
								)}
							</>
						) : (
							<p className='text-center py-10 text-text-secondary italic'>
								Chưa có bình luận nào.
							</p>
						)}
					</div>
				)}
			</div>
		</div>
	);
};

export default LatestComments;
