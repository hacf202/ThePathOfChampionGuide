// src/components/comment/latestComments.jsx
import React, { useState, useEffect, useMemo, useCallback } from "react";
import {
	Send,
	MessageSquare,
	User,
	Calendar,
	Loader2,
	LogIn,
	Edit,
	Trash2,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import Button from "../common/button";
import Modal from "../common/modal";

// --- Form nhập liệu: Xử lý logic parentId và replyToUsername ---
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
		e.preventDefault();
		if (!content.trim() || isSubmitting) return;

		setIsSubmitting(true);
		try {
			// Sử dụng buildId "global" để định danh thảo luận chung
			const res = await fetch(`${apiUrl}/api/builds/global/comments`, {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
					Authorization: `Bearer ${token}`,
				},
				body: JSON.stringify({
					content: content.trim(),
					parentId, // ID của bình luận cha nếu là phản hồi
					replyToUsername, // Tên người được nhắc tới
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
				placeholder={
					replyToUsername
						? `Trả lời @${replyToUsername}...`
						: "Viết bình luận chung..."
				}
				className='w-full bg-surface-bg border border-border rounded-lg p-3 text-text-primary focus:ring-2 focus:ring-primary-500 outline-none min-h-[80px] transition-all resize-none'
				autoFocus={!!parentId}
			/>
			<div className='flex justify-end gap-2'>
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
		</form>
	);
};

// --- Item hiển thị: Xử lý logic @mention và thụt lề đệ quy ---
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

	const isOwner = user && comment.user_sub === user.sub; // Kiểm tra quyền sở hữu

	// Logic thụt lề giống commentsSection: Chỉ thụt vào 1 cấp nếu là con của root
	const isRoot = !comment.parentId;
	const indentClass =
		!isRoot && isParentRoot
			? "ml-6 sm:ml-12 border-l-2 border-border pl-4 mt-2"
			: "ml-0";

	const handleUpdate = async () => {
		setLoadingAction(true);
		try {
			const res = await fetch(
				`${apiUrl}/api/builds/global/comments/${comment.id}`,
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
				`${apiUrl}/api/builds/global/comments/${comment.id}`,
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
				<div className='flex items-center gap-2'>
					<div className='w-8 h-8 rounded-full bg-surface-hover flex items-center justify-center border border-border'>
						<User size={16} className='text-text-secondary' />
					</div>
					<div>
						<span className='font-bold text-text-primary text-sm'>
							{comment.username}
						</span>
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
						className='w-full p-2 border border-border rounded bg-surface-bg text-sm focus:border-primary-500 outline-none'
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
				<div className='mt-2 text-text-secondary text-sm sm:text-base leading-relaxed whitespace-pre-wrap'>
					{/* Kiểm tra replyToUsername để thêm @ */}
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
				<p className='text-sm'>
					Hành động này sẽ xóa vĩnh viễn bình luận của bạn.
				</p>
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

// --- Component chính: Chuyển đổi mảng phẳng thành cây ---
const LatestComments = () => {
	const [allComments, setAllComments] = useState([]);
	const [loading, setLoading] = useState(true);
	const apiUrl = import.meta.env.VITE_API_URL;

	const fetchLatest = useCallback(async () => {
		try {
			setLoading(true);
			// Gọi API lấy 100 bình luận mới nhất toàn hệ thống
			const res = await fetch(`${apiUrl}/api/comments/latest`);
			if (res.ok) {
				const data = await res.json();
				setAllComments(data || []);
			}
		} catch (err) {
			console.error(err);
		} finally {
			setLoading(false);
		}
	}, [apiUrl]);

	useEffect(() => {
		fetchLatest();
	}, [fetchLatest]);

	// Logic xây dựng cây bình luận từ mảng phẳng (Giống y hệt commentsSection.jsx)
	const commentTree = useMemo(() => {
		const map = new Map();
		allComments.forEach(c => map.set(c.id, { ...c, replies: [] }));
		const roots = [];
		allComments.forEach(c => {
			if (c.parentId && map.has(c.parentId)) {
				map.get(c.parentId).replies.push(map.get(c.id));
			} else {
				roots.push(map.get(c.id));
			}
		});
		return roots;
	}, [allComments]);

	const handlePosted = c => setAllComments(prev => [c, ...prev]);
	const handleUpdated = c =>
		setAllComments(prev => prev.map(x => (x.id === c.id ? c : x)));
	const handleDeleted = id =>
		setAllComments(prev => prev.filter(x => x.id !== id && x.parentId !== id));

	return (
		<div className='mt-4 border-t border-border pt-4 font-secondary'>
			<h2 className='text-xl sm:text-2xl font-bold mb-2 text-text-primary border-l-4 border-primary-500 pl-4 uppercase'>
				Thảo luận cộng đồng ({allComments.length})
			</h2>

			<div className='bg-surface-bg rounded-xl border border-border p-1 sm:p-6 shadow-sm'>
				<CommentForm onCommentPosted={handlePosted} />

				{loading ? (
					<div className='flex justify-center py-10'>
						<Loader2 className='animate-spin text-primary-500' />
					</div>
				) : (
					<div className='divide-y divide-border mt-6 max-h-[1000px] overflow-y-auto pr-2 custom-scrollbar'>
						{commentTree.length > 0 ? (
							commentTree.map(root => (
								<CommentItem
									key={root.id}
									comment={root}
									onDeleted={handleDeleted}
									onUpdated={handleUpdated}
									onPosted={handlePosted}
								/>
							))
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
