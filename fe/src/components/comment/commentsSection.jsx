// src/components/build/commentsSection.jsx
import React, { useState, useEffect, useMemo, useCallback } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext.jsx";
import { Edit, Trash2, MessageSquare } from "lucide-react";
import Modal from "../common/modal.jsx";
import Button from "../common/button.jsx";

// --- Form viết bình luận ---
const CommentForm = ({
	buildId,
	onCommentPosted,
	parentId = null,
	replyToUsername = null,
	onCancel,
}) => {
	const { user, token } = useAuth();
	const [content, setContent] = useState("");
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [error, setError] = useState("");
	const apiUrl = import.meta.env.VITE_API_URL;

	const handleKeyDown = e => {
		if (e.key === "Enter" && !e.shiftKey) {
			e.preventDefault();
			handleSubmit(e);
		}
	};

	const handleSubmit = async e => {
		e.preventDefault();
		if (!content.trim()) return;
		if (!user) {
			setError("Bạn cần đăng nhập để bình luận.");
			return;
		}

		setIsSubmitting(true);
		setError("");

		try {
			const res = await fetch(`${apiUrl}/api/builds/${buildId}/comments`, {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
					Authorization: `Bearer ${token}`,
				},
				body: JSON.stringify({ content, parentId, replyToUsername }),
			});

			if (res.ok) {
				const newComment = await res.json();
				onCommentPosted(newComment);
				setContent("");
				onCancel?.();
			} else {
				const errData = await res.json();
				throw new Error(errData.error || "Không thể gửi bình luận");
			}
		} catch (err) {
			console.error("Comment submit error:", err);
			setError(err.message || "Có lỗi xảy ra khi gửi bình luận");
		} finally {
			setIsSubmitting(false);
		}
	};

	if (!user && !parentId) {
		return (
			<p className='text-sm text-[var(--color-warning)] mb-4'>
				Vui lòng{" "}
				<Link
					to='/auth'
					className='underline text-blue-600 hover:text-blue-800'
				>
					đăng nhập
				</Link>{" "}
				để bình luận.
			</p>
		);
	}

	return (
		<form onSubmit={handleSubmit} className='flex flex-col gap-3 mb-6'>
			<textarea
				value={content}
				onChange={e => setContent(e.target.value)}
				onKeyDown={handleKeyDown}
				placeholder={
					replyToUsername
						? `Trả lời @${replyToUsername}...`
						: "Viết bình luận..."
				}
				className='w-full p-3 bg-surface-bg border border-border rounded-lg text-text-primary placeholder:text-text-secondary focus:border-primary-500 focus:outline-none resize-none'
				rows={4}
				disabled={isSubmitting}
				autoFocus={!!parentId}
			/>
			{error && <p className='text-sm text-red-600'>{error}</p>}
			<div className='flex justify-end gap-3'>
				{onCancel && (
					<Button variant='ghost' onClick={onCancel} disabled={isSubmitting}>
						Hủy
					</Button>
				)}
				<Button
					type='submit'
					variant='primary'
					disabled={isSubmitting || !content.trim()}
				>
					{isSubmitting ? "Đang gửi..." : "Gửi"}
				</Button>
			</div>
		</form>
	);
};

// --- Thành phần hiển thị một mục bình luận ---
const CommentItem = ({
	comment,
	onCommentDeleted,
	onCommentUpdated,
	onCommentPosted,
	buildId,
	userDisplayNames,
	isParentRoot = true, // Logic để xác định cấp độ thụt lề
}) => {
	const { user, token } = useAuth();
	const [isEditing, setIsEditing] = useState(false);
	const [editContent, setEditContent] = useState(comment.content);
	const [isReplying, setIsReplying] = useState(false);
	const [showDeleteModal, setShowDeleteModal] = useState(false);
	const [isUpdating, setIsUpdating] = useState(false);
	const [isDeleting, setIsDeleting] = useState(false);

	const apiUrl = import.meta.env.VITE_API_URL;
	const isOwner = user && comment.user_sub === user.sub;

	const displayName = userDisplayNames[comment.username] || comment.username;
	const replyToName = comment.replyToUsername
		? userDisplayNames[comment.replyToUsername] || comment.replyToUsername
		: null;

	// XÁC ĐỊNH LOGIC THỤT LỀ:
	// 1. Bình luận gốc (parentId === null): Không thụt lề.
	// 2. Bình luận trả lời cho gốc (isParentRoot === true): Thụt vào 1 cấp.
	// 3. Bình luận trả lời cho reply (isParentRoot === false): Không thụt thêm.
	const isRoot = !comment.parentId;
	const indentClass =
		!isRoot && isParentRoot
			? "ml-6 sm:ml-12 border-l-2 border-border pl-4 mt-2"
			: "ml-0";

	const handleUpdate = async () => {
		if (!editContent.trim()) return;
		setIsUpdating(true);
		try {
			const res = await fetch(
				`${apiUrl}/api/builds/${buildId}/comments/${comment.id}`,
				{
					method: "PUT",
					headers: {
						"Content-Type": "application/json",
						Authorization: `Bearer ${token}`,
					},
					body: JSON.stringify({ content: editContent }),
				},
			);
			if (!res.ok) throw new Error("Không thể sửa");
			const updated = await res.json();
			onCommentUpdated(updated);
			setIsEditing(false);
		} catch (err) {
			alert("Lỗi: " + err.message);
		} finally {
			setIsUpdating(false);
		}
	};

	const handleDelete = async () => {
		setIsDeleting(true);
		try {
			const res = await fetch(
				`${apiUrl}/api/builds/${buildId}/comments/${comment.id}`,
				{
					method: "DELETE",
					headers: { Authorization: `Bearer ${token}` },
				},
			);
			if (!res.ok) throw new Error("Không thể xóa");
			onCommentDeleted(comment.id);
		} catch (err) {
			alert("Lỗi: " + err.message);
		} finally {
			setIsDeleting(false);
			setShowDeleteModal(false);
		}
	};

	return (
		<div className={`py-4 ${indentClass}`}>
			<div className='flex items-start justify-between'>
				<div className='flex flex-col'>
					<div className='flex items-center gap-2'>
						<span className='font-semibold text-text-primary'>
							{displayName}
						</span>
						<span className='text-[10px] sm:text-xs text-text-secondary'>
							{new Date(comment.createdAt).toLocaleString()}
							{comment.updatedAt && " (đã sửa)"}
						</span>
					</div>
				</div>
				{isOwner && (
					<div className='flex gap-1'>
						<button
							onClick={() => setIsEditing(true)}
							className='p-1.5 text-text-secondary hover:text-primary-500 transition-colors'
						>
							<Edit size={14} />
						</button>
						<button
							onClick={() => setShowDeleteModal(true)}
							className='p-1.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 rounded transition-colors'
						>
							<Trash2 size={14} />
						</button>
					</div>
				)}
			</div>

			{isEditing ? (
				<form
					onSubmit={e => {
						e.preventDefault();
						handleUpdate();
					}}
					className='mt-3'
				>
					<textarea
						value={editContent}
						onChange={e => setEditContent(e.target.value)}
						className='w-full p-3 border border-border rounded-lg bg-surface-bg focus:border-primary-500 focus:outline-none'
						rows={3}
						autoFocus
					/>
					<div className='flex justify-end gap-2 mt-2'>
						<Button
							variant='ghost'
							size='sm'
							onClick={() => setIsEditing(false)}
							disabled={isUpdating}
						>
							Hủy
						</Button>
						<Button
							variant='primary'
							size='sm'
							type='submit'
							disabled={isUpdating || !editContent.trim()}
						>
							{isUpdating ? "Lưu..." : "Lưu"}
						</Button>
					</div>
				</form>
			) : (
				<div className='mt-1.5 text-text-secondary whitespace-pre-wrap break-words text-sm sm:text-base'>
					{replyToName && (
						<span className='inline-block mr-2 text-primary-500 dark:text-primary-400 font-bold'>
							@{replyToName}
						</span>
					)}
					{comment.content}
				</div>
			)}

			<div className='mt-2'>
				<button
					onClick={() => setIsReplying(!isReplying)}
					className='flex items-center text-xs text-primary-500 hover:underline font-medium'
				>
					<MessageSquare size={12} className='mr-1' />
					Trả lời
				</button>
			</div>

			{isReplying && (
				<div className='mt-4'>
					<CommentForm
						buildId={buildId}
						parentId={comment.id}
						replyToUsername={comment.username}
						onCommentPosted={c => {
							onCommentPosted(c);
							setIsReplying(false);
						}}
						onCancel={() => setIsReplying(false)}
					/>
				</div>
			)}

			{/* Render Replies đệ quy */}
			{comment.replies && comment.replies.length > 0 && (
				<div className='mt-2 space-y-1'>
					{comment.replies.map(reply => (
						<CommentItem
							key={reply.id}
							comment={reply}
							buildId={buildId}
							onCommentDeleted={onCommentDeleted}
							onCommentUpdated={onCommentUpdated}
							onCommentPosted={onCommentPosted}
							userDisplayNames={userDisplayNames}
							isParentRoot={isRoot} // Truyền trạng thái root của cha xuống con
						/>
					))}
				</div>
			)}

			<Modal
				isOpen={showDeleteModal}
				onClose={() => setShowDeleteModal(false)}
				title='Xóa bình luận?'
			>
				<p>Bạn có chắc chắn muốn xóa bình luận này?</p>
				<div className='flex justify-end gap-3 mt-5'>
					<Button variant='ghost' onClick={() => setShowDeleteModal(false)}>
						Hủy
					</Button>
					<Button variant='danger' onClick={handleDelete} disabled={isDeleting}>
						{isDeleting ? "Đang xóa..." : "Xóa"}
					</Button>
				</div>
			</Modal>
		</div>
	);
};

// --- Component Chính ---
const CommentsSection = ({ buildId }) => {
	const [comments, setComments] = useState([]);
	const [loadingComments, setLoadingComments] = useState(true);
	const [userDisplayNames, setUserDisplayNames] = useState({});
	const apiUrl = import.meta.env.VITE_API_URL;

	const fetchComments = useCallback(async () => {
		setLoadingComments(true);
		try {
			const res = await fetch(`${apiUrl}/api/builds/${buildId}/comments`);
			if (!res.ok) throw new Error();
			const data = await res.json();
			setComments(data);
		} catch (e) {
			console.error("Fetch comments error:", e);
		} finally {
			setLoadingComments(false);
		}
	}, [buildId, apiUrl]);

	useEffect(() => {
		fetchComments();
	}, [fetchComments]);

	// Xây dựng cấu trúc cây bình luận từ mảng phẳng
	const rootComments = useMemo(() => {
		const map = new Map();
		comments.forEach(c => map.set(c.id, { ...c, replies: [] }));

		const roots = [];
		comments.forEach(c => {
			if (c.parentId && map.has(c.parentId)) {
				map.get(c.parentId).replies.push(map.get(c.id));
			} else {
				roots.push(map.get(c.id));
			}
		});
		return roots;
	}, [comments]);

	const handlePosted = c => setComments(p => [...p, c]);
	const handleDeleted = id =>
		setComments(p => p.filter(c => c.id !== id && c.parentId !== id));
	const handleUpdated = c =>
		setComments(p => p.map(x => (x.id === c.id ? c : x)));

	return (
		<div className='mt-10'>
			<h2 className='text-xl sm:text-2xl font-bold mb-6 text-text-primary border-l-4 border-primary-500 pl-4'>
				Bình luận ({comments.length})
			</h2>

			<div className='bg-surface-bg rounded-xl border border-border p-4 sm:p-6 shadow-sm'>
				<CommentForm buildId={buildId} onCommentPosted={handlePosted} />

				{loadingComments ? (
					<div className='flex justify-center py-10'>
						<div className='animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500'></div>
					</div>
				) : rootComments.length === 0 ? (
					<div className='text-center py-10 opacity-60'>
						<MessageSquare size={48} className='mx-auto mb-3' />
						<p>Chưa có bình luận nào. Hãy là người đầu tiên!</p>
					</div>
				) : (
					<div className='divide-y divide-border'>
						{rootComments.map(c => (
							<CommentItem
								key={c.id}
								comment={c}
								buildId={buildId}
								onCommentDeleted={handleDeleted}
								onCommentUpdated={handleUpdated}
								onCommentPosted={handlePosted}
								userDisplayNames={userDisplayNames}
								isParentRoot={true} // Gốc luôn được coi là ParentRoot
							/>
						))}
					</div>
				)}
			</div>
		</div>
	);
};

export default CommentsSection;
