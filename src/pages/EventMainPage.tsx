import { useNavigate, useLocation } from "react-router-dom";
import { useApp } from "../contexts/AppContext";
import EventeeButton from "../components/EventeeButton";
import {
  Plus,
  Image as ImageIcon,
  X,
  Send,
  Trash2,
  Pencil,
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
import { apiFetch } from "../utils/apiFetch";

type Comment = {
  id: string;
  author: string;
  content: string;
  timestamp: string;
  imageUrl?: string;
  isWrite: boolean;
};

type PollOption = {
  id: string; // "opt1", "opt2" …
  text: string;
  votes: number;
  percent?: number;
  isMine?: boolean;
};

type Post = {
  id: string;
  author: string;
  content: string;
  imageUrl?: string;
  likes: number;
  isLiked: boolean;
  comments: Comment[];
  type?: "text" | "vote";
  pollOptions?: PollOption[];
  pollQuestion?: string;
  userVote?: string;
  isWrite: boolean;
  pollUsesPercent?: boolean;
  createdAt?: string;
};

type Team = {
  id: string;
  name: string;
  color: string;
  posts: Post[];
  isMyTeam?: boolean;
  groupNum?: number;
  groupNo?: number;
  description?: string;
  leader?: string;
  img?: string;
};

type EventInfo = {
  eventId: number;
  title: string;
  description?: string;
  startAt?: string;
  endAt?: string;
  thumbnailUrl?: string;
  teamCount?: number;
  role?: string;
  nickname?: string;
};

type GroupEditFormState = {
  groupId: string;
  groupName: string;
  groupDescription: string;
  imgUrl: string;
  leader: string;
};

export default function EventMainPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, setCurrentEvent, currentEvent } = useApp();


  const API_URL = import.meta.env.VITE_API_URL;

  const eventTitle = location.state?.eventTitle || "이벤트";
  const eventCode = location.state?.eventCode || "";
  const eventId = location.state?.eventId || 7;

  const [eventInfo, setEventInfo] = useState<EventInfo | null>(null);
  const [teams, setTeams] = useState<Team[]>([]);

  // location.state 없으면 currentEvent 사용
  useEffect(() => {
    if (!location.state && currentEvent) {
      const restoredState = {
        eventId: Number(currentEvent.id),
        eventTitle: currentEvent.title,
        eventCode: currentEvent.inviteCode,
        nickname: user?.nickname,
      };

      navigate("/event-main", { state: restoredState, replace: true });
    }
  }, []);


  

  const [showAddPostDialog, setShowAddPostDialog] = useState(false);
  const [newPostContent, setNewPostContent] = useState("");
  const [selectedTeamId, setSelectedTeamId] = useState<string>("");
  const [commentInputs, setCommentInputs] = useState<{ [key: string]: string }>(
    {}
  );
  const [newPostImage, setNewPostImage] = useState<string | null>(null);
  const [commentImages, setCommentImages] = useState<{
    [key: string]: string | null;
  }>({});
  const [showPostTypeMenu, setShowPostTypeMenu] = useState(false);
  const [postType, setPostType] = useState<"text" | "vote">("text");
  const [pollQuestion, setPollQuestion] = useState("");
  const [pollOption1, setPollOption1] = useState("");
  const [pollOption2, setPollOption2] = useState("");
  const [editingPost, setEditingPost] = useState<{ id: string; teamId: string } | null>(null);
  const [isPostTeamLocked, setIsPostTeamLocked] = useState(false);
  const [groupEditDialogOpen, setGroupEditDialogOpen] = useState(false);
  const [groupEditForm, setGroupEditForm] = useState<GroupEditFormState>({
    groupId: "",
    groupName: "",
    groupDescription: "",
    imgUrl: "",
    leader: "",
  });

  const formatDateOnly = (isoString: string) => {
    if (!isoString) return "";
    const date = new Date(isoString);
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, "0");
    const d = String(date.getDate()).padStart(2, "0");
    return `${y}. ${m}. ${d}`;
  };

  const formatEventPeriod = (start?: string, end?: string) => {
    if (!start || !end) return "";
    const s = new Date(start);
    const e = new Date(end);
    const format = (d: Date) => {
      const yyyy = d.getFullYear();
      const mm = String(d.getMonth() + 1).padStart(2, "0");
      const dd = String(d.getDate()).padStart(2, "0");
      return `${yyyy}-${mm}-${dd}`;
    };
    return `${format(s)} ~ ${format(e)}`;
  };

  // ==========================
  // 그룹 불러오기
  // ==========================
  useEffect(() => {
    loadEventGroups();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [eventId]);

  const assignGroupColor = (groupNo?: number) => {
    const palette = ["#FFAB5D", "#E8E4D9", "#F5D0C5", "#C7D2FE", "#FDE68A"];
    if (!groupNo) return palette[0];
    return palette[(groupNo - 1) % palette.length];
  };

  const loadEventGroups = async () => {
    try {
      const res = await apiFetch(`${API_URL}/api/v1/events/${eventId}/groups`, {
        method: "GET",
      });
      const data = await res.json();

      if (!data.isSuccess) return;

      const {
        title,
        eventTitle: legacyEventTitle,
        description,
        eventDescription,
        eventRole,
        startAt,
        endAt,
        thumbnailUrl,
        teamCount,
        groups,
        role,
        nickname,
      } = data.result;

      const resolvedTitle = title ?? legacyEventTitle ?? eventTitle;
      const resolvedDescription = description ?? eventDescription;

      setEventInfo({
        eventId,
        title: resolvedTitle,
        description: resolvedDescription,
        startAt,
        endAt,
        thumbnailUrl,
        teamCount,
        role: eventRole,
        nickname,
      });

      const convertedTeams: Team[] = (groups ?? []).map((g: any) => ({
        id: String(g.groupId),
        name: g.groupName,
        color: assignGroupColor(g.groupNo ?? g.groupId),
        posts: [],
        isMyTeam: Boolean(g.isMyGroup ?? g.isMine ?? false),
        groupNum: Number(g.groupNum ?? g.groupNo ?? g.groupId),
        groupNo: Number(g.groupNo ?? g.groupNum ?? g.groupId),
        description: g.groupDescription,
        leader: g.groupLeader,
        img: g.groupImg,
      }));

      setTeams(convertedTeams);

      const teamsWithPosts = await Promise.all(
        convertedTeams.map(async (team) => {
          const posts = await fetchGroupPosts(team.id);
          return { ...team, posts };
        })
      );

      setTeams(teamsWithPosts);
    } catch (err) {
      console.error("이벤트 그룹 API 오류:", err);
    }
  };

  const openGroupEditDialog = (team: Team) => {
    setGroupEditForm({
      groupId: team.id,
      groupName: team.name,
      groupDescription: team.description ?? "",
      imgUrl: team.img ?? "",
      leader: team.leader ?? "",
    });
    setGroupEditDialogOpen(true);
  };

  const closeGroupEditDialog = () => {
    setGroupEditDialogOpen(false);
    setGroupEditForm({
      groupId: "",
      groupName: "",
      groupDescription: "",
      imgUrl: "",
      leader: "",
    });
  };

  const handleGroupEditInputChange = (
    field: keyof GroupEditFormState,
    value: string
  ) => {
    setGroupEditForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmitGroupEdit = async () => {
    if (!groupEditForm.groupId || !groupEditForm.groupName.trim()) return;

    const payload = {
      groupId: Number(groupEditForm.groupId),
      groupName: groupEditForm.groupName.trim(),
      groupDescription: groupEditForm.groupDescription ?? "",
      imgUrl: groupEditForm.imgUrl ?? "",
      leader: groupEditForm.leader ?? "",
    };

    try {
      const res = await apiFetch(`${API_URL}/api/v1/group`, {
        method: "PUT",
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!data.isSuccess) return;

      setTeams((prev) =>
        prev.map((team) =>
          team.id === groupEditForm.groupId
            ? {
                ...team,
                name: payload.groupName,
                description: payload.groupDescription,
                img: payload.imgUrl,
                leader: payload.leader,
              }
            : team
        )
      );
      closeGroupEditDialog();
    } catch (err) {
      console.error("그룹 수정 오류:", err);
    }
  };

  // ==========================
  // Post 변환 함수 (백엔드 여러 버전 안전 대응)
  // ==========================
  const convertPost = (p: any): Post => {
    // voteOptions / pollOptions 모두 지원
    const rawVoteOptions: any[] = Array.isArray(p.voteOptions)
      ? p.voteOptions
      : Array.isArray(p.pollOptions)
      ? p.pollOptions
      : [];

    const isVote =
      (p.type ?? "").toString().toLowerCase() === "vote" ||
      !!p.voteTitle ||
      !!p.pollQuestion ||
      rawVoteOptions.length > 0;

    const pollOptions =
      rawVoteOptions.length > 0
        ? rawVoteOptions.map((opt: any) => ({
            id: `opt${opt.optionNo ?? opt.id ?? 1}`,
            text: opt.text,
            votes: opt.votes ?? 0,
            percent: opt.percent ?? 0,
            isMine: opt.isMine ?? false,
          }))
        : undefined;

    return {
      id: String(p.postId),
      author: p.writerName ?? p.author ?? "익명",
      content: p.content,
      type: isVote ? "vote" : "text",
      pollQuestion: p.voteTitle ?? p.pollQuestion ?? "",
      pollOptions: isVote ? pollOptions : undefined,
      createdAt: p.createdAt,
      comments: (p.comments ?? []).map((c: any) => ({
        id: String(c.commentId ?? c.id),
        author: c.writerNickname ?? c.writerName ?? c.author ?? "익명",
        content: c.content,
        timestamp: c.createdAt,
        isWrite: Boolean(c.isMine ?? c.isWrite),
      })),
      likes: 0,
      isLiked: false,
      isWrite: Boolean(p.isWrite ?? p.isMine),
    };
  };

  const fetchGroupPosts = async (groupId: string): Promise<Post[]> => {
    try {
      const res = await apiFetch(
        `${API_URL}/api/v1/events/${eventId}/groups/${groupId}/posts`,
        {
          method: "GET",
        }
      );

      const data = await res.json();

      console.log("posts raw data:", data.result);

      if (!data.isSuccess) return [];

      let rawPosts: any[] = [];

      // CASE 1: { posts: [...] }
      if (Array.isArray(data.result?.posts)) {
        rawPosts = data.result.posts;
      }
      // CASE 2: result 자체가 배열
      else if (Array.isArray(data.result)) {
        rawPosts = data.result;
      }
      // CASE 3: 단일 객체
      else if (data.result?.postId) {
        rawPosts = [data.result];
      }

      console.log("rawPosts:", rawPosts);

      return rawPosts.map((post: any) => convertPost(post));
    } catch (err) {
      console.error("그룹 게시글 API 오류:", err);
      return [];
    }
  };

  // ==========================
  // 게시글 생성 / 수정
  // ==========================
  const resetPostForm = () => {
    setNewPostContent("");
    setSelectedTeamId("");
    setNewPostImage(null);
    setPollQuestion("");
    setPollOption1("");
    setPollOption2("");
    setPostType("text");
    setEditingPost(null);
    setShowPostTypeMenu(false);
    setIsPostTeamLocked(false);
  };

  const refreshTeamPosts = async (teamId: string) => {
    if (!teamId) return;
    const posts = await fetchGroupPosts(teamId);
    setTeams((prev) =>
      prev.map((team) => (team.id === teamId ? { ...team, posts } : team))
    );
  };

  const closePostDialog = () => {
    setShowAddPostDialog(false);
    resetPostForm();
  };

  const openPostDialog = (teamId: string, post?: Post) => {
    if (post) {
      setEditingPost({ id: post.id, teamId });
      setNewPostContent(post.content);
      setPostType(post.type ?? "text");
      if (post.type === "vote" && post.pollOptions) {
        setPollQuestion(post.pollQuestion ?? "");
        setPollOption1(post.pollOptions[0]?.text ?? "");
        setPollOption2(post.pollOptions[1]?.text ?? "");
      } else {
        setPollQuestion("");
        setPollOption1("");
        setPollOption2("");
      }
    } else {
      resetPostForm();
    }

    if (teamId) {
      setSelectedTeamId(teamId);
      setIsPostTeamLocked(true);
    } else {
      setIsPostTeamLocked(false);
    }

    setShowAddPostDialog(true);
  };

  const handleSubmitPost = async () => {
    console.log("[handleSubmitPost] 호출됨");
    console.log("selectedTeamId:", selectedTeamId);
    console.log("editingPost:", editingPost);

    const isPoll = postType === "vote";

    const body: any = {
      type: isPoll ? "VOTE" : "TEXT",
      content: newPostContent,
      voteTitle: isPoll ? pollQuestion : null,
      voteContent: isPoll
        ? [pollOption1, pollOption2]
            .map((opt) => opt?.trim())
            .filter(Boolean)
            .join("_")
        : null,
    };

    if (!editingPost) {
      body.groupId = Number(selectedTeamId);
    }

    console.log("[handleSubmitPost] 요청 body:", body);

    try {
      const url = editingPost
        ? `${API_URL}/api/v1/post/${editingPost.id}`
        : `${API_URL}/api/v1/post`;

      console.log("[handleSubmitPost] request URL:", url);

      const res = await apiFetch(url, {
        method: editingPost ? "PATCH" : "POST",
        body: JSON.stringify(body),
      });

      console.log("[handleSubmitPost] response:", res);

      const data = await res.json();
      console.log("[handleSubmitPost] json:", data);

      if (!data.isSuccess) {
        console.warn("[handleSubmitPost] 실패:", data);
        return;
      }

      await refreshTeamPosts(selectedTeamId);
      closePostDialog();
    } catch (err) {
      console.error("[handleSubmitPost] 오류:", err);
    }
  };

  // ==========================
  // 댓글 생성
  // ==========================
  const handleAddComment = async (teamId: string, postId: string) => {
    const commentText = commentInputs[postId];
    if (!commentText?.trim()) return;

    const body = {
      postId: Number(postId),
      content: commentText,
    };

    try {
      const res = await apiFetch(`${API_URL}/api/v1/comment`, {
        method: "POST",
        body: JSON.stringify(body),
      });

      const data = await res.json();
      if (!data.isSuccess) return;

      await refreshTeamPosts(teamId);

      setCommentInputs({ ...commentInputs, [postId]: "" });
      setCommentImages({ ...commentImages, [postId]: null });
    } catch (err) {
      console.error("댓글 생성 오류:", err);
    }
  };

  // ==========================
  // 댓글 삭제
  // ==========================
  const handleDeleteComment = async (teamId: string, commentId: string) => {
    try {
      const res = await apiFetch(`${API_URL}/api/v1/comment/${commentId}`, {
        method: "DELETE",
      });

      const data = await res.json();
      if (!data.isSuccess) return;

      await refreshTeamPosts(teamId);
    } catch (err) {
      console.error("댓글 삭제 오류:", err);
    }
  };

  // ==========================
  // 투표
  // ==========================
  const handleVote = async (teamId: string, postId: string, optionId: string) => {
    const team = teams.find((t) => t.id === teamId);
    const post = team?.posts.find((p) => p.id === postId);
    if (!post || !post.pollOptions) return;

    const option = post.pollOptions.find((o) => o.id === optionId);
    const voteText = option?.text ?? optionId;

    try {
      const res = await apiFetch(`${API_URL}/api/v1/post/vote`, {
        method: "POST",
        body: JSON.stringify({
          postId: Number(postId),
          voteText,
        }),
      });

      const data = await res.json();
      if (!data.isSuccess) return;

      await refreshTeamPosts(teamId);
    } catch (err) {
      console.error("투표 오류:", err);
    }
  };

  // ==========================
  // 게시글 삭제
  // ==========================
  const handleDeletePost = async (teamId: string, postId: string) => {
    if (!window.confirm("게시글을 삭제하시겠어요?")) return;
    try {
      const res = await apiFetch(`${API_URL}/api/v1/post/${postId}`, {
        method: "DELETE",
      });

      const data = await res.json();
      if (!data.isSuccess) return;

      await refreshTeamPosts(teamId);
    } catch (err) {
      console.error("게시글 삭제 오류:", err);
    }
  };

  const myTeam = teams.find((team) => team.isMyTeam);
  const selectedTeam = teams.find((team) => team.id === selectedTeamId);
  const eventPeriod = formatEventPeriod(eventInfo?.startAt, eventInfo?.endAt);
  const headerTitleText = eventInfo?.title ?? eventTitle;
  const headerSubtitleText =
    eventInfo?.description ??
    (eventInfo?.teamCount
      ? `총 ${eventInfo.teamCount}개 팀`
      : eventCode
      ? `초대 코드: ${eventCode}`
      : "");

  const userInitial = (user?.nickname ?? user?.email ?? "U")
    .charAt(0)
    .toUpperCase();

  const isEventHost =
    (eventInfo?.role ?? user?.role)?.toUpperCase() === "HOST";

  const displayNickname = location.state?.nickname ?? eventInfo?.nickname ?? "닉네임";



  return (
    <div className="h-screen flex flex-col">
      {/* 헤더 */}
      <div className="bg-white border-b px-8 py-4 flex items-center justify-between sticky top-0 z-10">
        <div className="flex items-center gap-4">
          <h1 className="text-[30px] font-bold">
            Event<span style={{ color: "#67594C" }}>Tee</span>
          </h1>
          <div className="hidden sm:flex flex-col text-gray-600">
            <p className="text-sm">
              {headerTitleText}
              {eventPeriod && (
                <span className="ml-1 text-xs text-gray-500">
                  ({eventPeriod})
                </span>
              )}
            </p>
            {headerSubtitleText && (
              <p className="text-xs text-gray-500 mt-0.5">
                {headerSubtitleText}
              </p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-3">
          {isEventHost && (
            <EventeeButton
              variant="outline"
              onClick={() => {
                const eventData = {
                    id: String(eventInfo?.eventId),
                    title: eventInfo?.title ?? "",
                    description: eventInfo?.description ?? "",
                    inviteCode: eventCode,
                    startDate: eventInfo?.startAt ? new Date(eventInfo.startAt) : null,
                    endDate: eventInfo?.endAt ? new Date(eventInfo.endAt) : null,
                    createdBy: user?.id ?? "",
                  };

                  console.log(">>> setting event", eventData);

                  setCurrentEvent(eventData);  
                  localStorage.setItem("currentEvent", JSON.stringify(eventData));
                  navigate("/admin-dashboard");
              }}
            >
            운영자 페이지
            </EventeeButton>


          )}

          <button
            type="button"
            onClick={() => navigate("/my-page")}
            className="flex items-center gap-3 px-3 py-2 rounded-full bg-gray-50 hover:bg-gray-100 transition"
          >
            {user?.profileImageUrl ? (
              <img
                src={user.profileImageUrl}
                alt="프로필"
                className="w-10 h-10 rounded-full object-cover"
              />
            ) : (
              <div className="w-10 h-10 rounded-full bg-[#67594C] text-white flex items-center justify-center text-sm font-semibold">
                {userInitial}
              </div>
            )}

            <div className="text-left">
              <p className="text-sm font-medium text-gray-800">
                {displayNickname}
              </p>
              <p className="text-xs text-gray-500">
                {user?.email || "마이페이지 이동"}
              </p>
            </div>
          </button>
        </div>
      </div>

      {/* 메인 컨텐츠 */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* 팀 컬럼 영역 (가로 스크롤) */}
        <div className="flex-1 overflow-x-auto px-4 py-6">
          <div className="flex gap-4 min-w-min">
            {teams.map((team) => (
              <div key={team.id} className="w-[280px] flex-shrink-0">
                {/* 팀 헤더 */}
                {/* 팀 헤더 (이미지 + 이름 + 소개 + 수정 버튼) */}
                <div
                  className={`rounded-t-xl overflow-hidden ${
                    team.isMyTeam ? "ring-2 ring-[#67594C]" : ""
                  }`}
                  style={{ backgroundColor: team.color }}
                >
                  {/* 상단 이미지 영역 */}
                  <div className="w-full h-28 bg-gray-200">
                    <img
                      src={team.img || "/default-event.jpg"}
                      alt={`${team.name} 이미지`}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  {/* 텍스트 정보 */}
                  <div className="px-4 py-3 space-y-1">
                    <div className="flex items-center justify-between">
                      <h3 className="text-base font-semibold text-gray-900">
                        {team.name}
                      </h3>

                      <button
                        onClick={() => openGroupEditDialog(team)}
                        className="p-1 rounded hover:bg-white/40 transition"
                        title="그룹 정보 수정"
                      >
                        <Pencil className="w-4 h-4 text-gray-700" />
                      </button>
                    </div>

                    {team.description ? (
                      <p className="text-xs text-gray-700 whitespace-pre-line">
                        {team.description}
                      </p>
                    ) : (
                      <p className="text-xs text-gray-400 italic">소개가 없습니다</p>
                    )}
                  </div>
                </div>


                {/* 그룹 내부 스크롤 영역 */}
                <div
                  className="space-y-3 mt-3 overflow-y-auto pr-1"
                  style={{
                    maxHeight: "calc(100vh - 220px)",
                  }}
                >
                  {team.posts.map((post) => {
                    const isVotePost =
                      post.type === "vote" &&
                      Array.isArray(post.pollOptions) &&
                      post.pollOptions.length > 0;

                    return (
                      <div
                        key={post.id}
                        className="bg-white rounded-lg shadow-sm p-4 hover:shadow-md transition-shadow"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <div className="w-6 h-6 rounded-full bg-gray-300" />
                            <span className="text-xs text-gray-600">
                              {post.author}
                            </span>
                          </div>
                          {post.isWrite && (
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => openPostDialog(team.id, post)}
                                className="p-1 rounded hover:bg-gray-100"
                                title="게시글 수정"
                              >
                                <Pencil className="w-4 h-4 text-gray-500" />
                              </button>
                              <button
                                onClick={() =>
                                  handleDeletePost(team.id, post.id)
                                }
                                className="p-1 rounded hover:bg-red-50"
                                title="게시글 삭제"
                              >
                                <Trash2 className="w-4 h-4 text-red-500" />
                              </button>
                            </div>
                          )}
                        </div>

                        {isVotePost ? (
                          <>
                            {/* 투표 게시글 UI */}
                            <div className="flex items-start justify-between mb-2">
                              <h4
                                className="text-sm flex-1"
                                style={{
                                  color: team.isMyTeam ? "#FFAB5D" : "#6B7280",
                                }}
                              >
                                {post.pollQuestion}
                              </h4>
                            </div>

                            {post.content && (
                              <p className="text-xs text-gray-600 mb-4 whitespace-pre-line">
                                {post.content}
                              </p>
                            )}

                            <div className="grid grid-cols-2 gap-2 mb-3">
                              {post.pollOptions!.map((option) => {
                                const totalVotes = post.pollOptions!.reduce(
                                  (sum, opt) => sum + (opt.votes ?? 0),
                                  0
                                );

                                const percentage =
                                  totalVotes > 0
                                    ? Math.round(
                                        ((option.votes ?? 0) / totalVotes) *
                                          100
                                      )
                                    : option.percent ?? 0;

                                return (
                                  <button
                                    key={option.id}
                                    onClick={() =>
                                      handleVote(team.id, post.id, option.id)
                                    }
                                    className="rounded-lg p-4 text-center transition-all"
                                    style={{
                                      backgroundColor: option.isMine
                                        ? "#67594C"
                                        : "#E5E7EB",
                                      color: option.isMine
                                        ? "white"
                                        : "#6B7280",
                                      border: option.isMine
                                        ? "2px solid #67594C"
                                        : "1px solid #D1D5DB",
                                      opacity: option.isMine ? 1 : 0.8,
                                    }}
                                  >
                                    <div className="text-sm mb-1">
                                      {option.text}
                                    </div>
                                    <div>{percentage}%</div>
                                  </button>
                                );
                              })}
                            </div>
                          </>
                        ) : (
                          <>
                            {/* 일반 게시글 내용 */}
                            <p className="text-sm mb-3">{post.content}</p>

                            {/* 이미지 */}
                            {post.imageUrl && (
                              <img
                                src={post.imageUrl}
                                alt="post"
                                className="w-full rounded-lg mb-3 object-cover max-h-40"
                              />
                            )}

                            {/* 댓글 목록 */}
                            {post.comments.length > 0 && (
                              <div
                                className="border-t pt-3 mb-3 space-y-2 overflow-y-auto pr-1"
                                style={{
                                  maxHeight: "150px",
                                }}
                              >
                                {post.comments.map((comment) => (
                                  <div
                                    key={comment.id}
                                    className="flex gap-2"
                                  >
                                    <div className="w-5 h-5 rounded-full bg-gray-200" />
                                    <div className="flex-1 min-w-0">
                                      <div className="flex items-center justify-between gap-2">
                                        <div className="flex items-center gap-2">
                                          <span className="text-xs text-gray-600">
                                            {comment.author}
                                          </span>
                                          <span className="text-xs text-gray-400">
                                            {formatDateOnly(
                                              comment.timestamp
                                            )}
                                          </span>
                                        </div>
                                        {comment.isWrite && (
                                          <button
                                            onClick={() =>
                                              handleDeleteComment(
                                                team.id,
                                                comment.id
                                              )
                                            }
                                            className="p-1 hover:bg-red-50 rounded"
                                          >
                                            <Trash2 className="w-4 h-4 text-red-500" />
                                          </button>
                                        )}
                                      </div>

                                      <p className="text-xs text-gray-800 mt-1">
                                        {comment.content}
                                      </p>

                                      {comment.imageUrl && (
                                        <img
                                          src={comment.imageUrl}
                                          alt="comment"
                                          className="w-full rounded-lg mt-2 max-h-40 object-cover"
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
                                    onClick={() =>
                                      setCommentImages({
                                        ...commentImages,
                                        [post.id]: null,
                                      })
                                    }
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
                                  id={`comment-image-${post.id}`}
                                  className="hidden"
                                  onChange={(e) => {
                                    const file = e.target.files?.[0];
                                    if (file) {
                                      const reader = new FileReader();
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
                                        `comment-image-${post.id}`
                                      )
                                      ?.click();
                                  }}
                                >
                                  <ImageIcon className="w-4 h-4" />
                                </button>

                                <input
                                  type="text"
                                  value={commentInputs[post.id] || ""}
                                  onChange={(e) =>
                                    setCommentInputs({
                                      ...commentInputs,
                                      [post.id]: e.target.value,
                                    })
                                  }
                                  onKeyPress={(e) => {
                                    if (e.key === "Enter") {
                                      handleAddComment(team.id, post.id);
                                    }
                                  }}
                                  placeholder="댓글 입력..."
                                  className="flex-1 bg-transparent text-xs outline-none"
                                />

                                <button
                                  onClick={() =>
                                    handleAddComment(team.id, post.id)
                                  }
                                  disabled={!commentInputs[post.id]?.trim()}
                                  className="text-gray-400 hover:text-[#67594C] disabled:opacity-30 transition-colors"
                                >
                                  <Send className="w-4 h-4" />
                                </button>
                              </div>
                            </div>
                          </>
                        )}
                      </div>
                    );
                  })}

                  {/* 게시글 추가 버튼 */}
                  <div className="bg-gray-50 rounded-lg p-3 text-center">
                    <button
                      onClick={() => openPostDialog(team.id)}
                      className="text-sm text-gray-500 hover:text-gray-700"
                    >
                      게시글 추가
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 게시글 추가/수정 다이얼로그 */}
      <Dialog
        open={showAddPostDialog}
        onOpenChange={(open) => {
          if (!open) {
            closePostDialog();
          } else {
            setShowAddPostDialog(true);
          }
        }}
      >
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>
              {editingPost ? "게시글 수정" : "새 게시글 작성"}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div>
              <Label htmlFor="team">선택된 팀</Label>
              {selectedTeamId ? (
                <div className="w-full mt-2 rounded-[15px] border border-gray-200 px-4 py-3 bg-gray-50 flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-800">
                      {selectedTeam?.name ?? `팀 ID ${selectedTeamId}`}
                    </p>
                    {selectedTeam?.description && (
                      <p className="text-xs text-gray-500 mt-0.5 line-clamp-1">
                        {selectedTeam.description}
                      </p>
                    )}
                  </div>
                  {isPostTeamLocked && (
                    <span className="text-[11px] text-gray-400">
                      그룹 카드에서 변경
                    </span>
                  )}
                </div>
              ) : (
                <select
                  id="team"
                  value={selectedTeamId}
                  onChange={(e) => {
                    setSelectedTeamId(e.target.value);
                    setIsPostTeamLocked(false);
                  }}
                  className="w-full mt-2 h-[51px] rounded-[15px] border border-gray-300 px-4 bg-white"
                >
                  <option value="">팀을 선택하세요</option>
                  {teams.map((team) => (
                    <option key={team.id} value={team.id}>
                      {team.name} {team.isMyTeam ? "(내 팀)" : ""}
                    </option>
                  ))}
                </select>
              )}
            </div>

            <div>
              <Label htmlFor="content">내용</Label>
              <Textarea
                id="content"
                value={newPostContent}
                onChange={(e) => setNewPostContent(e.target.value)}
                placeholder="게시글 내용을 입력하세요"
                className="mt-2 min-h-[120px] rounded-[10px] resize-none"
              />
            </div>

            <div>
              <Label htmlFor="postType">게시글 유형</Label>
              <div className="relative">
                <button
                  className={`w-full mt-2 h-[51px] rounded-[15px] border border-gray-300 px-4 
                    ${
                      editingPost
                        ? "bg-gray-200 opacity-50 cursor-not-allowed"
                        : "bg-white"
                    } 
                    flex items-center justify-between`}
                  onClick={() => {
                    if (!editingPost) {
                      setShowPostTypeMenu((prev) => !prev);
                    }
                  }}
                  disabled={Boolean(editingPost)}
                >
                  {postType === "text" ? "일반 게시글" : "투표 게시글"}
                </button>

                {!editingPost && showPostTypeMenu && (
                  <div className="absolute left-0 top-full w-full bg-white border border-gray-300 rounded-b-[15px] z-10">
                    <button
                      className="w-full px-4 py-2 text-left hover:bg-gray-100"
                      onClick={() => {
                        setPostType("text");
                        setShowPostTypeMenu(false);
                      }}
                    >
                      일반 게시글
                    </button>
                    <button
                      className="w-full px-4 py-2 text-left hover:bg-gray-100"
                      onClick={() => {
                        setPostType("vote");
                        setShowPostTypeMenu(false);
                      }}
                    >
                      투표 게시글
                    </button>
                  </div>
                )}
              </div>
            </div>

            {postType === "vote" && (
              <>
                <div>
                  <Label>투표 질문</Label>
                  <input
                    type="text"
                    value={pollQuestion}
                    onChange={(e) => setPollQuestion(e.target.value)}
                    placeholder="투표 질문을 입력하세요"
                    className="w-full mt-2 h-[51px] rounded-[15px] border px-4 bg-white"
                  />
                </div>

                <div>
                  <Label>투표 옵션 1</Label>
                  <input
                    type="text"
                    value={pollOption1}
                    onChange={(e) => setPollOption1(e.target.value)}
                    placeholder="옵션 1"
                    className="w-full mt-2 h-[51px] rounded-[15px] border px-4 bg.white"
                  />
                </div>

                <div>
                  <Label>투표 옵션 2</Label>
                  <input
                    type="text"
                    value={pollOption2}
                    onChange={(e) => setPollOption2(e.target.value)}
                    placeholder="옵션 2"
                    className="w-full mt-2 h-[51px] rounded-[15px] border px-4 bg.white"
                  />
                </div>
              </>
            )}
          </div>

          <div className="flex justify-end gap-2">
            <EventeeButton variant="ghost" onClick={closePostDialog}>
              취소
            </EventeeButton>

            <EventeeButton
              onClick={handleSubmitPost}
              disabled={!newPostContent.trim() || !selectedTeamId}
            >
              {editingPost ? "수정하기" : "작성하기"}
            </EventeeButton>
          </div>
        </DialogContent>
      </Dialog>

      {/* 그룹 수정 다이얼로그 */}
      <Dialog
        open={groupEditDialogOpen}
        onOpenChange={(open) => {
          if (!open) {
            closeGroupEditDialog();
          } else {
            setGroupEditDialogOpen(true);
          }
        }}
      >
        <DialogContent className="sm:max-w-[480px]">
          <DialogHeader>
            <DialogTitle>그룹 정보 수정</DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-2">
            {groupEditForm.imgUrl && (
              <div className="w-full rounded-2xl overflow-hidden border">
                <img
                  src={groupEditForm.imgUrl}
                  alt="그룹 이미지 미리보기"
                  className="w-full h-40 object-cover"
                />
              </div>
            )}

            <div>
              <Label htmlFor="groupName">그룹 이름</Label>
              <input
                id="groupName"
                type="text"
                value={groupEditForm.groupName}
                onChange={(e) =>
                  handleGroupEditInputChange("groupName", e.target.value)
                }
                className="w-full mt-2 h-[48px] rounded-[12px] border border-gray-300 px-4 bg-white"
                placeholder="그룹 이름을 입력하세요"
              />
            </div>

            <div>
              <Label htmlFor="groupDescription">그룹 소개</Label>
              <Textarea
                id="groupDescription"
                value={groupEditForm.groupDescription}
                onChange={(e) =>
                  handleGroupEditInputChange(
                    "groupDescription",
                    e.target.value
                  )
                }
                className="mt-2 min-h-[90px] rounded-[12px]"
                placeholder="간단한 소개를 입력하세요"
              />
            </div>

            <div>
              <Label htmlFor="groupImg">이미지 URL</Label>
              <input
                id="groupImg"
                type="text"
                value={groupEditForm.imgUrl}
                onChange={(e) =>
                  handleGroupEditInputChange("imgUrl", e.target.value)
                }
                className="w-full mt-2 h-[48px] rounded-[12px] border border-gray-300 px-4 bg-white"
                placeholder="https://"
              />
              <p className="text-[11px] text-gray-400 mt-1">
                이미지 업로드 기능 준비 중입니다. URL을 직접 입력해주세요.
              </p>
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <EventeeButton variant="ghost" onClick={closeGroupEditDialog}>
              취소
            </EventeeButton>
            <EventeeButton
              onClick={handleSubmitGroupEdit}
              disabled={!groupEditForm.groupName.trim()}
            >
              저장
            </EventeeButton>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
