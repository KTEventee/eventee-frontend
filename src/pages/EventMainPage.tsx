import { useNavigate, useLocation } from "react-router-dom";
import { useApp } from "../contexts/AppContext";
import EventeeButton from "../components/EventeeButton";
import {
  Home,
  Users,
  MessageCircle,
  FileText,
  Gamepad2,
  Heart,
  MoreVertical,
  Plus,
  Image as ImageIcon,
  X,
  PanelRightOpen,
  PanelRightClose,
  Send,
  UserCircle,
  ArrowLeft,
} from "lucide-react";
import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "../components/ui/dialog";
import { Textarea } from "../components/ui/textarea";
import { Label } from "../components/ui/label";

// Mock 데이터
type Comment = {
  id: string;
  author: string;
  content: string;
  timestamp: string;
  imageUrl?: string;
};

type PollOption = {
  id: string;
  text: string;
  votes: number;
};

type Post = {
  id: string;
  author: string;
  content: string;
  imageUrl?: string;
  likes: number;
  isLiked: boolean;
  comments: Comment[];
  type?: "normal" | "poll";
  pollOptions?: PollOption[];
  pollQuestion?: string;
  userVote?: string; // 사용자가 투표한 옵션 ID
};

type Team = {
  id: string;
  name: string;
  color: string;
  posts: Post[];
  isMyTeam?: boolean;
};

const mockTeams: Team[] = [
  {
    id: "1",
    name: "캐글업 1조",
    color: "#FFAB5D",
    isMyTeam: true,
    posts: [
      {
        id: "1",
        author: "작성자 닉네임",
        content: "고양이 모아는 위기 종류까",
        likes: 0,
        isLiked: false,
        comments: [],
      },
      {
        id: "1-poll",
        type: "poll",
        author: "작성자 닉네임",
        pollQuestion: "오늘 점심은 뭐가 좋을까요?",
        content:
          "개는 모든 사람의 공공주에게 좋아요.\n우선 보존 좋은 온도와와 주파일인 설정건이다면 교도 ★★\n여러분이든 와을 자리 착용로 주신다니요!",
        likes: 5,
        isLiked: false,
        comments: [],
        pollOptions: [
          { id: "opt1", text: "콩국수", votes: 60 },
          { id: "opt2", text: "순대국", votes: 40 },
        ],
        userVote: "opt1",
      },
      {
        id: "2",
        author: "작성자 닉네임",
        content: "두부 모래가 좋아요! 10년째 두부모래 사용 중~",
        imageUrl:
          "https://images.unsplash.com/photo-1574158622682-e40e69881006?w=400",
        likes: 0,
        isLiked: false,
        comments: [],
      },
      {
        id: "3",
        author: "작성자 닉네임",
        content: "좋아 모래가 좋아요",
        likes: 0,
        isLiked: false,
        comments: [],
      },
      {
        id: "4",
        author: "작성자 닉네임",
        content: "두부 모래 세운 싶어요!!",
        likes: 0,
        isLiked: false,
        comments: [],
      },
    ],
  },
  {
    id: "2",
    name: "캐글업 2조",
    color: "#E8E4D9",
    posts: [
      {
        id: "5",
        author: "작성자 닉네임",
        content: "두부 모래 세운 싶어요!!",
        likes: 0,
        isLiked: false,
        comments: [],
      },
      {
        id: "2-poll",
        type: "poll",
        author: "작성자 닉네임",
        pollQuestion: "주말 활동은 뭐가 좋을까요?",
        content: "주말 활동 투표해주세요!",
        likes: 3,
        isLiked: false,
        comments: [],
        pollOptions: [
          { id: "opt1", text: "등산", votes: 45 },
          { id: "opt2", text: "영화", votes: 55 },
        ],
      },
      {
        id: "6",
        author: "작성자 닉네임",
        content: "오늘 점심은 뭐가 좋을까요?",
        likes: 0,
        isLiked: false,
        comments: [],
      },
    ],
  },
  {
    id: "3",
    name: "캐글업 3조",
    color: "#E8E4D9",
    posts: [
      {
        id: "7",
        author: "작성자 닉네임",
        content: "고양이 모아는 위기 종류까",
        likes: 0,
        isLiked: false,
        comments: [],
      },
      {
        id: "8",
        author: "작성자 닉네임",
        content: "오늘 점심은 뭐가 좋을까요?",
        likes: 0,
        isLiked: false,
        comments: [],
      },
    ],
  },
  {
    id: "4",
    name: "캐글업 4조",
    color: "#E8E4D9",
    posts: [
      {
        id: "9",
        author: "작성자 닉네임",
        content: "고양이 모아는 위기 종류까",
        likes: 0,
        isLiked: false,
        comments: [],
      },
      {
        id: "10",
        author: "작성자 닉네임",
        content: "고양이 모아는 위기 종류까",
        likes: 0,
        isLiked: false,
        comments: [],
      },
    ],
  },
];

export default function EventMainPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useApp();

  // 이벤트 정보 (EventPasswordPage에서 전달받음)
  const eventTitle = location.state?.eventTitle || "이벤트";
  const eventCode = location.state?.eventCode || "";

  const [teams, setTeams] = useState<Team[]>(mockTeams);
  const [showChatSidebar, setShowChatSidebar] = useState(false);
  const [showAddPostDialog, setShowAddPostDialog] =
    useState(false);
  const [newPostContent, setNewPostContent] = useState("");
  const [selectedTeamId, setSelectedTeamId] =
    useState<string>("");
  const [commentInputs, setCommentInputs] = useState<{
    [key: string]: string;
  }>({});
  const [newPostImage, setNewPostImage] = useState<
    string | null
  >(null);
  const [commentImages, setCommentImages] = useState<{
    [key: string]: string | null;
  }>({});
  const [showPostTypeMenu, setShowPostTypeMenu] =
    useState(false);
  const [postType, setPostType] = useState<"normal" | "poll">(
    "normal",
  );
  const [pollQuestion, setPollQuestion] = useState("");
  const [pollOption1, setPollOption1] = useState("");
  const [pollOption2, setPollOption2] = useState("");

  // TODO: 백엔드 연동 필요
  // API: GET /api/events/:eventId/teams-posts
  // Response: { teams: Team[], myTeamId: string }
  // 컴포넌트 마운트 시 이벤트의 팀별 게시글 데이터 가져오기
  // useEffect(() => {
  //   fetch(`/api/events/${eventId}/teams-posts`)
  //     .then(res => res.json())
  //     .then(data => setTeams(data.teams));
  // }, [eventId]);

  const myTeam = teams.find((team) => team.isMyTeam);

  const handleLike = (teamId: string, postId: string) => {
    // TODO: 백엔드 연동 필요
    // API: POST /api/posts/:postId/like
    // body: { teamId }
    // Response: { success: boolean, likes: number }

    setTeams(
      teams.map((team) => {
        if (team.id === teamId) {
          return {
            ...team,
            posts: team.posts.map((post) => {
              if (post.id === postId) {
                return {
                  ...post,
                  isLiked: !post.isLiked,
                  likes: post.isLiked
                    ? post.likes - 1
                    : post.likes + 1,
                };
              }
              return post;
            }),
          };
        }
        return team;
      }),
    );
  };

  const handleAddPost = () => {
    if (!newPostContent.trim() || !selectedTeamId) return;

    // 투표 게시글인 경우 추가 검증
    if (postType === "poll") {
      if (
        !pollQuestion.trim() ||
        !pollOption1.trim() ||
        !pollOption2.trim()
      ) {
        return;
      }
    }

    // TODO: API 호출
    // POST /api/events/:eventCode/posts
    // body: { teamId: selectedTeamId, content: newPostContent }

    const newPost: Post = {
      id: Date.now().toString(),
      author: user?.nickname || "익명",
      content: newPostContent,
      imageUrl: newPostImage || undefined,
      likes: 0,
      isLiked: false,
      comments: [],
      type: postType,
      pollQuestion:
        postType === "poll" ? pollQuestion : undefined,
      pollOptions:
        postType === "poll"
          ? [
              { id: "opt1", text: pollOption1, votes: 0 },
              { id: "opt2", text: pollOption2, votes: 0 },
            ]
          : undefined,
    };

    setTeams(
      teams.map((team) => {
        if (team.id === selectedTeamId) {
          return {
            ...team,
            posts: [newPost, ...team.posts],
          };
        }
        return team;
      }),
    );

    setNewPostContent("");
    setSelectedTeamId("");
    setNewPostImage(null);
    setPollQuestion("");
    setPollOption1("");
    setPollOption2("");
    setPostType("normal");
    setShowAddPostDialog(false);
  };

  const handleAddComment = (teamId: string, postId: string) => {
    const commentText = commentInputs[postId];
    if (!commentText?.trim()) return;

    // TODO: API 호출
    // POST /api/events/:eventCode/posts/:postId/comments
    // body: { content: commentText }

    const newComment: Comment = {
      id: Date.now().toString(),
      author: user?.nickname || "익명",
      content: commentText,
      timestamp: new Date().toLocaleTimeString("ko-KR", {
        hour: "2-digit",
        minute: "2-digit",
      }),
      imageUrl: commentImages[postId] || undefined,
    };

    setTeams(
      teams.map((team) => {
        if (team.id === teamId) {
          return {
            ...team,
            posts: team.posts.map((post) => {
              if (post.id === postId) {
                return {
                  ...post,
                  comments: [...post.comments, newComment],
                };
              }
              return post;
            }),
          };
        }
        return team;
      }),
    );

    // 댓글 입력창 초기화
    setCommentInputs({ ...commentInputs, [postId]: "" });
    setCommentImages({ ...commentImages, [postId]: null });
  };

  const handleCommentInputChange = (
    postId: string,
    value: string,
  ) => {
    setCommentInputs({ ...commentInputs, [postId]: value });
  };

  const handleVote = (
    teamId: string,
    postId: string,
    optionId: string,
  ) => {
    // TODO: API 호출
    // POST /api/events/:eventCode/posts/:postId/vote
    // body: { optionId: optionId }

    setTeams(
      teams.map((team) => {
        if (team.id === teamId) {
          return {
            ...team,
            posts: team.posts.map((post) => {
              if (post.id === postId && post.pollOptions) {
                const oldVote = post.userVote;
                return {
                  ...post,
                  userVote: optionId,
                  pollOptions: post.pollOptions.map((opt) => {
                    if (opt.id === optionId) {
                      return { ...opt, votes: opt.votes + 1 };
                    } else if (opt.id === oldVote) {
                      return { ...opt, votes: opt.votes - 1 };
                    }
                    return opt;
                  }),
                };
              }
              return post;
            }),
          };
        }
        return team;
      }),
    );
  };

  return (
    <div className="h-screen flex flex-col">
      {/* 헤더 */}
      <div className="bg-white border-b px-8 py-4 flex items-center justify-between sticky top-0 z-10">
        <div className="flex items-center gap-4">
          <h1 className="text-[30px] font-bold">
            Event<span style={{ color: "#67594C" }}>Tee</span>
          </h1>
          <div className="flex items-center gap-2"></div>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right">
            <p className="text-sm text-gray-600">
              KT대학교 Cloud학과 MT (11.03 ~ 11.04)
            </p>
            <p className="text-xs text-gray-500">
              총괄 : 케클업 (010-xxxx-xxxx)
            </p>
          </div>
        </div>
      </div>

      {/* 메인 컨텐츠 */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* 팀 칼럼 영역 */}
        <div className="flex-1 overflow-x-auto px-4 py-6">
          <div className="flex gap-4 min-w-min">
            {teams.map((team) => (
              <div
                key={team.id}
                className="w-[280px] flex-shrink-0"
              >
                {/* 팀 헤더 */}
                <div
                  className={`rounded-t-xl px-4 py-3 flex items-center justify-between ${team.isMyTeam ? "ring-2 ring-[#67594C]" : ""}`}
                  style={{ backgroundColor: team.color }}
                >
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm">{team.name}</h3>
                    {team.isMyTeam && (
                      <span className="text-xs bg-white/40 px-2 py-0.5 rounded">
                        내 팀
                      </span>
                    )}
                  </div>
                  <button className="p-1 hover:bg-white/20 rounded">
                    <MoreVertical className="w-4 h-4" />
                  </button>
                </div>

                {/* 포스트 리스트 */}
                <div className="space-y-3 mt-3">
                  {team.posts.map((post) => (
                    <div
                      key={post.id}
                      className="bg-white rounded-lg shadow-sm p-4 hover:shadow-md transition-shadow"
                    >
                      {/* 투표 게시글 */}
                      {post.type === "poll" &&
                      post.pollOptions ? (
                        <>
                          {/* 투표 제목과 좋아요 */}
                          <div className="flex items-start justify-between mb-2">
                            <h4
                              className="text-sm flex-1"
                              style={{
                                color: team.isMyTeam
                                  ? "#FFAB5D"
                                  : "#6B7280",
                              }}
                            >
                              {post.pollQuestion}
                            </h4>
                            <button
                              onClick={() =>
                                handleLike(team.id, post.id)
                              }
                              className="ml-2"
                            >
                              <Heart
                                className={`w-4 h-4 ${post.isLiked ? "fill-red-500 text-red-500" : "text-gray-400"}`}
                              />
                            </button>
                          </div>

                          {/* 투표 설명 */}
                          <p className="text-xs text-gray-600 mb-4 whitespace-pre-line">
                            {post.content}
                          </p>

                          {/* 투표 옵션 */}
                          <div className="grid grid-cols-2 gap-2 mb-3">
                            {post.pollOptions.map((option) => {
                              const totalVotes =
                                post.pollOptions!.reduce(
                                  (sum, opt) => sum + opt.votes,
                                  0,
                                );
                              const percentage =
                                totalVotes > 0
                                  ? Math.round(
                                      (option.votes /
                                        totalVotes) *
                                        100,
                                    )
                                  : 0;
                              const isVoted =
                                post.userVote === option.id;

                              return (
                                <button
                                  key={option.id}
                                  onClick={() =>
                                    handleVote(
                                      team.id,
                                      post.id,
                                      option.id,
                                    )
                                  }
                                  className="rounded-lg p-4 text-center transition-all"
                                  style={{
                                    backgroundColor:
                                      team.isMyTeam
                                        ? "#FFAB5D"
                                        : "#E5E7EB",
                                    opacity: isVoted ? 1 : 0.6,
                                  }}
                                >
                                  <div className="text-white">
                                    <div className="text-sm mb-1">
                                      {option.text}
                                    </div>
                                    <div>{percentage}%</div>
                                  </div>
                                </button>
                              );
                            })}
                          </div>

                          {/* 댓글 목록 */}
                          {post.comments.length > 0 && (
                            <div className="border-t pt-3 mb-3 space-y-2">
                              {post.comments.map((comment) => (
                                <div
                                  key={comment.id}
                                  className="flex gap-2"
                                >
                                  <div className="w-5 h-5 rounded-full bg-gray-200 flex-shrink-0"></div>
                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2">
                                      <span className="text-xs text-gray-600">
                                        {comment.author}
                                      </span>
                                      <span className="text-xs text-gray-400">
                                        {comment.timestamp}
                                      </span>
                                    </div>
                                    <p className="text-xs text-gray-800 mt-0.5">
                                      {comment.content}
                                    </p>
                                    {comment.imageUrl && (
                                      <img
                                        src={comment.imageUrl}
                                        alt="comment"
                                        className="w-full rounded-lg mt-2 object-cover max-h-40"
                                      />
                                    )}
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}

                          {/* 댓글 입력 */}
                          <div className="space-y-2">
                            {commentImages[post.id] && (
                              <div className="relative">
                                <img
                                  src={commentImages[post.id]!}
                                  alt="preview"
                                  className="w-full rounded-lg object-cover max-h-32"
                                />
                                <button
                                  onClick={() => {
                                    setCommentImages({
                                      ...commentImages,
                                      [post.id]: null,
                                    });
                                  }}
                                  className="absolute top-1 right-1 w-6 h-6 bg-black/50 rounded-full flex items-center justify-center hover:bg-black/70"
                                >
                                  <X className="w-4 h-4 text-white" />
                                </button>
                              </div>
                            )}
                            <div className="flex items-center gap-2 bg-gray-50 rounded-lg p-2">
                              <input
                                type="file"
                                accept="image/*"
                                id={`comment-image-poll-${post.id}`}
                                className="hidden"
                                onChange={(e) => {
                                  const file =
                                    e.target.files?.[0];
                                  if (file) {
                                    const reader =
                                      new FileReader();
                                    reader.onloadend = () => {
                                      setCommentImages({
                                        ...commentImages,
                                        [post.id]:
                                          reader.result as string,
                                      });
                                    };
                                    reader.readAsDataURL(file);
                                  }
                                }}
                              />
                              <button
                                className="text-gray-400 hover:text-gray-600"
                                onClick={() => {
                                  document
                                    .getElementById(
                                      `comment-image-poll-${post.id}`,
                                    )
                                    ?.click();
                                }}
                              >
                                <ImageIcon className="w-4 h-4" />
                              </button>
                              <input
                                type="text"
                                value={
                                  commentInputs[post.id] || ""
                                }
                                onChange={(e) =>
                                  handleCommentInputChange(
                                    post.id,
                                    e.target.value,
                                  )
                                }
                                onKeyPress={(e) => {
                                  if (e.key === "Enter") {
                                    handleAddComment(
                                      team.id,
                                      post.id,
                                    );
                                  }
                                }}
                                placeholder="댓글 입력..."
                                className="flex-1 bg-transparent text-xs outline-none"
                              />
                              <button
                                onClick={() =>
                                  handleAddComment(
                                    team.id,
                                    post.id,
                                  )
                                }
                                disabled={
                                  !commentInputs[
                                    post.id
                                  ]?.trim()
                                }
                                className="text-gray-400 hover:text-[#67594C] disabled:opacity-30 transition-colors"
                              >
                                <Send className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        </>
                      ) : (
                        <>
                          {/* 일반 게시글 */}
                          {/* 작성자 */}
                          <div className="flex items-center gap-2 mb-2">
                            <div className="w-6 h-6 rounded-full bg-gray-300"></div>
                            <span className="text-xs text-gray-600">
                              {post.author}
                            </span>
                          </div>

                          {/* 내용 */}
                          <p className="text-sm mb-3">
                            {post.content}
                          </p>

                          {/* 이미지 */}
                          {post.imageUrl && (
                            <img
                              src={post.imageUrl}
                              alt="post"
                              className="w-full rounded-lg mb-3 object-cover max-h-40"
                            />
                          )}

                          {/* 좋아요 */}
                          <div className="flex items-center justify-between mb-3">
                            <button
                              onClick={() =>
                                handleLike(team.id, post.id)
                              }
                              className="flex items-center gap-1 text-gray-600 hover:text-red-500 transition-colors"
                            >
                              <Heart
                                className={`w-4 h-4 ${post.isLiked ? "fill-red-500 text-red-500" : ""}`}
                              />
                              {post.likes > 0 && (
                                <span className="text-xs">
                                  {post.likes}
                                </span>
                              )}
                            </button>
                          </div>

                          {/* 댓글 목록 */}
                          {post.comments.length > 0 && (
                            <div className="border-t pt-3 mb-3 space-y-2">
                              {post.comments.map((comment) => (
                                <div
                                  key={comment.id}
                                  className="flex gap-2"
                                >
                                  <div className="w-5 h-5 rounded-full bg-gray-200 flex-shrink-0"></div>
                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2">
                                      <span className="text-xs text-gray-600">
                                        {comment.author}
                                      </span>
                                      <span className="text-xs text-gray-400">
                                        {comment.timestamp}
                                      </span>
                                    </div>
                                    <p className="text-xs text-gray-800 mt-0.5">
                                      {comment.content}
                                    </p>
                                    {comment.imageUrl && (
                                      <img
                                        src={comment.imageUrl}
                                        alt="comment"
                                        className="w-full rounded-lg mt-2 object-cover max-h-40"
                                      />
                                    )}
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}

                          {/* 댓글 입력 */}
                          <div className="space-y-2">
                            {commentImages[post.id] && (
                              <div className="relative">
                                <img
                                  src={commentImages[post.id]!}
                                  alt="preview"
                                  className="w-full rounded-lg object-cover max-h-32"
                                />
                                <button
                                  onClick={() => {
                                    setCommentImages({
                                      ...commentImages,
                                      [post.id]: null,
                                    });
                                  }}
                                  className="absolute top-1 right-1 w-6 h-6 bg-black/50 rounded-full flex items-center justify-center hover:bg-black/70"
                                >
                                  <X className="w-4 h-4 text-white" />
                                </button>
                              </div>
                            )}
                            <div className="flex items-center gap-2 bg-gray-50 rounded-lg p-2">
                              <input
                                type="file"
                                accept="image/*"
                                id={`comment-image-normal-${post.id}`}
                                className="hidden"
                                onChange={(e) => {
                                  const file =
                                    e.target.files?.[0];
                                  if (file) {
                                    const reader =
                                      new FileReader();
                                    reader.onloadend = () => {
                                      setCommentImages({
                                        ...commentImages,
                                        [post.id]:
                                          reader.result as string,
                                      });
                                    };
                                    reader.readAsDataURL(file);
                                  }
                                }}
                              />
                              <button
                                className="text-gray-400 hover:text-gray-600"
                                onClick={() => {
                                  document
                                    .getElementById(
                                      `comment-image-normal-${post.id}`,
                                    )
                                    ?.click();
                                }}
                              >
                                <ImageIcon className="w-4 h-4" />
                              </button>
                              <input
                                type="text"
                                value={
                                  commentInputs[post.id] || ""
                                }
                                onChange={(e) =>
                                  handleCommentInputChange(
                                    post.id,
                                    e.target.value,
                                  )
                                }
                                onKeyPress={(e) => {
                                  if (e.key === "Enter") {
                                    handleAddComment(
                                      team.id,
                                      post.id,
                                    );
                                  }
                                }}
                                placeholder="댓글 입력..."
                                className="flex-1 bg-transparent text-xs outline-none"
                              />
                              <button
                                onClick={() =>
                                  handleAddComment(
                                    team.id,
                                    post.id,
                                  )
                                }
                                disabled={
                                  !commentInputs[
                                    post.id
                                  ]?.trim()
                                }
                                className="text-gray-400 hover:text-[#67594C] disabled:opacity-30 transition-colors"
                              >
                                <Send className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        </>
                      )}
                    </div>
                  ))}

                  {/* 댓글 추가 영역 */}
                  <div className="bg-gray-50 rounded-lg p-3 text-center">
                    <button
                      onClick={() => {
                        setSelectedTeamId(team.id);
                        setShowAddPostDialog(true);
                      }}
                      className="text-sm text-gray-500 hover:text-gray-700"
                    >
                      댓글 추가
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 오른쪽 사이드바 */}
        {showChatSidebar && (
          <div className="w-80 bg-white border-l flex flex-col">
            {/* 헤더 */}
            <div className="border-b p-4">
              <h3
                className="text-sm"
                style={{ color: "#67594C" }}
              >
                팀원 채팅
              </h3>
            </div>

            {/* 팀원 채팅 목록 */}
            <div className="flex-1 overflow-y-auto p-4">
              <div className="space-y-3">
                {[
                  {
                    name: "작성자 닉네임",
                    message: "고양이 모아는 뭐가 좋을까요?",
                    time: "11:23",
                  },
                  {
                    name: "작성자 닉네임",
                    message: "고양이 모아는 뭐가 좋을까요?",
                    time: "10:15",
                  },
                  {
                    name: "작성자 닉네임",
                    message: "고양이 모아는 뭐가 좋을까요?",
                    time: "09:42",
                  },
                  {
                    name: "작성자 닉네임",
                    message: "고양이 모아는 뭐가 좋을까요?",
                    time: "어제",
                  },
                  {
                    name: "작성자 닉네임",
                    message: "고양이 모아는 뭐가 좋을까요?",
                    time: "어제",
                  },
                ].map((chat, idx) => (
                  <div
                    key={idx}
                    className="flex items-start gap-3 p-2 hover:bg-gray-50 rounded-lg cursor-pointer transition-colors"
                  >
                    <div className="w-10 h-10 rounded-full bg-gray-800 text-white flex items-center justify-center text-sm flex-shrink-0">
                      {chat.name.charAt(0)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm">
                          {chat.name}
                        </span>
                        <span className="text-xs text-gray-400">
                          {chat.time}
                        </span>
                      </div>
                      <p className="text-xs text-gray-600 truncate">
                        {chat.message}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* 프로필 카드 */}
        <div
          className="absolute right-4 top-4 z-20"
          style={{ right: showChatSidebar ? "324px" : "16px" }}
        >
          <div className="bg-white border shadow-lg rounded-2xl p-4 w-20 flex flex-col items-center gap-3">
            <button
              onClick={() => navigate("/mypage")}
              className="flex flex-col items-center gap-1 hover:opacity-70 transition-opacity"
            >
              <UserCircle
                className="w-8 h-8"
                style={{ color: "#67594C" }}
              />
            </button>
            <div className="text-center">
              <p
                className="text-xs"
                style={{ color: "#67594C" }}
              >
                {user?.nickname || "닉네임"}
              </p>
            </div>
            <button
              onClick={() =>
                setShowChatSidebar(!showChatSidebar)
              }
              className="flex flex-col items-center gap-1 hover:opacity-70 transition-opacity"
            >
              <MessageCircle
                className="w-8 h-8"
                style={{ color: "#67594C" }}
              />
            </button>
          </div>
        </div>
      </div>

      {/* 플로팅 버튼 - 새 포스트 추가 */}
      <button
        onClick={() => {
          setSelectedTeamId(myTeam?.id || "");
          setShowAddPostDialog(true);
        }}
        className="fixed left-8 bottom-8 w-12 h-12 rounded-full bg-[#67594C] text-white flex items-center justify-center shadow-lg hover:shadow-xl transition-shadow"
      >
        <Plus className="w-6 h-6" />
      </button>

      {/* 게시글 추가 다이얼로그 */}
      <Dialog
        open={showAddPostDialog}
        onOpenChange={setShowAddPostDialog}
      >
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>새 게시글 작성</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label htmlFor="team">팀 선택</Label>
              <select
                id="team"
                value={selectedTeamId}
                onChange={(e) =>
                  setSelectedTeamId(e.target.value)
                }
                className="w-full mt-2 h-[51px] rounded-[15px] border border-gray-300 px-4 bg-white"
              >
                <option value="">팀을 선택하세요</option>
                {teams.map((team) => (
                  <option key={team.id} value={team.id}>
                    {team.name} {team.isMyTeam ? "(내 팀)" : ""}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <Label htmlFor="content">내용</Label>
              <Textarea
                id="content"
                value={newPostContent}
                onChange={(e) =>
                  setNewPostContent(e.target.value)
                }
                placeholder="게시글 내용을 입력하세요"
                className="mt-2 min-h-[120px] rounded-[10px] resize-none"
              />
            </div>
            <div>
              <Label htmlFor="postType">게시글 유형</Label>
              <div className="relative">
                <button
                  className="w-full mt-2 h-[51px] rounded-[15px] border border-gray-300 px-4 bg-white flex items-center justify-between"
                  onClick={() =>
                    setShowPostTypeMenu(!showPostTypeMenu)
                  }
                >
                  {postType === "normal"
                    ? "일반 게시글"
                    : "투표 게시글"}
                </button>
                {showPostTypeMenu && (
                  <div className="absolute left-0 top-full w-full bg-white border border-gray-300 rounded-b-[15px] z-10">
                    <button
                      className="w-full px-4 py-2 text-left hover:bg-gray-100"
                      onClick={() => {
                        setPostType("normal");
                        setShowPostTypeMenu(false);
                      }}
                    >
                      일반 게시글
                    </button>
                    <button
                      className="w-full px-4 py-2 text-left hover:bg-gray-100"
                      onClick={() => {
                        setPostType("poll");
                        setShowPostTypeMenu(false);
                      }}
                    >
                      투표 게시글
                    </button>
                  </div>
                )}
              </div>
            </div>
            {postType === "poll" && (
              <>
                <div>
                  <Label htmlFor="pollQuestion">
                    투표 질문
                  </Label>
                  <input
                    type="text"
                    id="pollQuestion"
                    value={pollQuestion}
                    onChange={(e) =>
                      setPollQuestion(e.target.value)
                    }
                    placeholder="투표 질문을 입력하세요"
                    className="w-full mt-2 h-[51px] rounded-[15px] border border-gray-300 px-4 bg-white"
                  />
                </div>
                <div>
                  <Label htmlFor="pollOption1">
                    투표 옵션 1
                  </Label>
                  <input
                    type="text"
                    id="pollOption1"
                    value={pollOption1}
                    onChange={(e) =>
                      setPollOption1(e.target.value)
                    }
                    placeholder="투표 옵션 1을 입력하세요"
                    className="w-full mt-2 h-[51px] rounded-[15px] border border-gray-300 px-4 bg-white"
                  />
                </div>
                <div>
                  <Label htmlFor="pollOption2">
                    투표 옵션 2
                  </Label>
                  <input
                    type="text"
                    id="pollOption2"
                    value={pollOption2}
                    onChange={(e) =>
                      setPollOption2(e.target.value)
                    }
                    placeholder="투표 옵션 2을 입력하세요"
                    className="w-full mt-2 h-[51px] rounded-[15px] border border-gray-300 px-4 bg-white"
                  />
                </div>
              </>
            )}
          </div>
          <div className="flex gap-2 justify-end">
            <EventeeButton
              variant="ghost"
              onClick={() => {
                setShowAddPostDialog(false);
                setNewPostContent("");
                setSelectedTeamId("");
                setNewPostImage(null);
                setPollQuestion("");
                setPollOption1("");
                setPollOption2("");
              }}
            >
              취소
            </EventeeButton>
            <EventeeButton
              onClick={handleAddPost}
              disabled={
                !newPostContent.trim() || !selectedTeamId
              }
            >
              작성하기
            </EventeeButton>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}