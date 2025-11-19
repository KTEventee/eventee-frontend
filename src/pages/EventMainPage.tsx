//일단 api 불러온  버전임.

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
  Trash2
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
import { is } from "date-fns/locale";
//test용
type Comment = {
  id: string;
  author: string;
  content: string;
  timestamp: string;
  imageUrl?: string;  
  isWrite: boolean;
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
  type?: "text" | "vote";
  pollOptions?: PollOption[];
  pollQuestion?: string;
  userVote?: string; // 사용자가 투표한 옵션 ID
  isWrite: boolean;
};

type Team = {
  id: string;
  name: string;
  color: string;
  posts: Post[];
  isMyTeam?: boolean;
};

export default function EventMainPage() {
  console.log("EventMainPage mounted");
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useApp();
  const origin = "http://localhost:8080";

  // 이벤트 정보 (EventPasswordPage에서 전달받음)
  const eventTitle = location.state?.eventTitle || "이벤트";
  const eventCode = location.state?.eventCode || "";
  
  //todo event 읽어와야할 필요가 있음
  const eventId = location.state?.eventId || 7;
  const token = "eyJhbGciOiJIUzUxMiJ9.eyJ0eXBlIjoiYWNjZXNzIiwiaXNzIjoiY29tLnNlcnZlci5ldmVudGVlIiwiYXVkIjpbInRlc3RAdGVzdC5jb20iXSwiaWF0IjoxNzYzNTI0MjY1LCJleHAiOjE3NjM1MjYwNjV9.EwiwMVoBLsLDjvRWxplT7zH2XitUFvFu5lo1LYVl-8lR3hI19yO_B3wVOacg9g3iIEyAsAImvq4hT-vk_77hlw";

  console.log("eventId:"+eventId);

  const [teams, setTeams] = useState<Team[]>([]);
  useEffect(() => {
  async function loadGroups() {
    if (!eventId) return;

    try {
      // API 요청
      const res = await fetch(origin+`/api/v1/group/${eventId}`, {
        method: "GET",
         headers: {
          "Authorization": `Bearer ${token}`
        }
      });

      const data = await res.json();

      console.log("Group-res: "+res);

      if (!data.isSuccess) {
        console.error("그룹 불러오기 실패:", data.message);
        return;
      }

      const { myGroup, otherGroup } = data.result;

      const convertedTeams: Team[] = [
        ...(myGroup
          ? [{
              id: String(myGroup.groupId),
              name: myGroup.groupName,
              color: "#FFAB5D",
              posts: [],
              isMyTeam: true,
            }]
          : []),
        ...otherGroup.map((g: any) => ({
          id: String(g.groupId),
          name: g.groupName,
          color: "#E8E4D9",
          posts: [],
          isMyTeam: false,
        })),
      ];

      setTeams(convertedTeams);
      // 게시글도 바로 불러오기 (팀 정보가 세팅된 직후)
      await loadPostsForTeams(convertedTeams);
    } catch (err) {
      console.error("그룹 API 오류:", err);
    }
  }

  loadGroups();
}, [eventId]);
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
  const [postType, setPostType] = useState<"text" | "vote">(
    "text",
  );
  const [pollQuestion, setPollQuestion] = useState("");
  const [pollOption1, setPollOption1] = useState("");
  const [pollOption2, setPollOption2] = useState("");


  // posts 불러오는 재사용 가능한 함수
  const loadPostsForTeams = async (teamsArg?: Team[]) => {
    console.log("loadPostsForTeams 실행");
    try {
      const res = await fetch(origin + `/api/v1/post/${eventId}`, {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${token}`,
        },
      });

      const data = await res.json();
      if (!data.isSuccess) return;

      const postGroups = data.result.lists;
      const baseTeams = teamsArg ?? teams;

      const updatedTeams = baseTeams.map((team) => {
        const found = postGroups.find(
          (pg: any) => pg.groupNum === Number(team.id),
        );
        if (!found) return team;

        const convertedPosts: Post[] = found.posts.map((p: any) => {
          // 서버가 VoteLogResponseDto 형태로 보낼 때 처리
          const voteResp =
            p.votedLogs ??
            p.voteLogResponse ??
            p.voteLogResponseDto ??
            null;

          // pollOptions 구성
          let pollOptions: PollOption[] | undefined;
          if (p.voteContent) {
            const opts = p.voteContent.split("_");
            // 서버가 op1Percent/op2Percent를 줄 경우 퍼센트로 표시
            if (voteResp && typeof voteResp === "object" && typeof voteResp.op1Percent === "number") {
              const op1 = Math.round(Number(voteResp.op1Percent ?? 0));
              const op2 = Math.round(Number(voteResp.op2Percent ?? 0));
              pollOptions = [
                { id: "opt1", text: opts[0] ?? "옵션1", votes: op1 },
                { id: "opt2", text: opts[1] ?? "옵션2", votes: op2 },
              ];
            } else if (Array.isArray(p.votedLogs)) {
              // 혹시 이전 형태(배열)인 경우에 대비
              pollOptions = opts.map((opt: string, idx: number) => ({
                id: `opt${idx + 1}`,
                text: opt,
                votes: p.votedLogs.filter((log: any) => log.optionIndex === idx || log.voteNum === idx + 1).length,
              }));
            } else {
              // 그 외에는 0으로 초기화
              pollOptions = opts.map((opt: string, idx: number) => ({
                id: `opt${idx + 1}`,
                text: opt,
                votes: 0,
              }));
            }
          } else {
            pollOptions = undefined;
          }

          // userVote 결정: isVote가 true일 때만 voteNum을 사용
          let userVoteVal: string | undefined = undefined;
          if (voteResp && typeof voteResp === "object" && voteResp.isVote === true) {
            const voteNum =
              voteResp.voteNum ??
              voteResp.voteNUm ?? // possible typo
              voteResp.myVoteNum ??
              voteResp.myVote ??
              null;
            if (typeof voteNum === "number" || (!isNaN(Number(voteNum)) && voteNum !== null)) {
              userVoteVal = `opt${Number(voteNum)}`;
            } else {
              userVoteVal = "voted";
            }
          }

          return {
            id: String(p.postId),
            author: p.writerName,
            content: p.content,
            type: p.type === "vote" ? "vote" : "text",
            pollQuestion: p.voteTitle,
            pollOptions,
            userVote: userVoteVal,
            likes: 0,
            isLiked: false,
            isWrite: p.isWrite ?? false,
            comments: (p.comments ?? []).map((c: any) => ({
              id: String(c.commentId ?? c.id),
              author: c.writerName ?? c.writer,
              content: c.content,
              timestamp: c.createdAt,
              imageUrl: c.imageUrl ?? undefined,
              isWrite: c.isWrite ?? false,
            })),
          } as Post;
        });

        return { ...team, posts: convertedPosts };
      });

      setTeams(updatedTeams);
    } catch (err) {
      console.error("게시글 API 오류:", err);
    }
  };


const handleUpdatePost = async (
  teamId: string,
  postId: string,
  updatedContent: string,
  updatedType: "text" | "vote",
  updatedVoteTitle?: string,
  updatedOptions?: string[]
) => {
  try {
    // 보내는 body 구조 (백엔드 Request와 정확히 맞춤)
    const body = {
      postId: Number(postId),
      groupId: Number(teamId),
      type: updatedType === "vote" ? "vote" : "text",
      content: updatedContent,
      voteTitle: updatedType === "vote" ? updatedVoteTitle : null,
      voteContent:
        updatedType === "vote" && updatedOptions
          ? updatedOptions.join("_") // ["A","B","C"] → "A_B_C"
          : null,
    };

    const res = await fetch(origin+`/api/v1/post`, {
      method: "PATCH",
      headers: {
          "Authorization": `Bearer ${token}`
        },
      body: JSON.stringify(body),
    });

    const data = await res.json();

    if (!data.isSuccess) {
      console.error("게시글 수정 실패:", data.message);
      return;
    }

    const updated = data.result; // 서버에서 반환한 수정된 PostDto

    // ------------------------------
    // 변환 → 기존 loadPosts 로직과 동일하게
    // ------------------------------
    const convertedPost: Post = {
        id: String(updated.postId),
        author: updated.writerName,
        content: updated.content,

        likes: 0,
        isLiked: false,
        isWrite: updated.isWrite,

        type: updated.type === "vote" ? "vote" : "text",
        pollQuestion: updated.voteTitle,
        pollOptions: (() => {
          // updated.votedLogs 는 VoteLogResponseDto일 수 있음
          const voteResp =
            updated.votedLogs ?? updated.voteLogResponse ?? updated.voteLogResponseDto ?? null;

          if (updated.voteContent) {
            const opts = updated.voteContent.split("_");
            if (voteResp && typeof voteResp === "object" && typeof voteResp.op1Percent === "number") {
              return [
                { id: "opt1", text: opts[0] ?? "옵션1", votes: Math.round(Number(voteResp.op1Percent ?? 0)) },
                { id: "opt2", text: opts[1] ?? "옵션2", votes: Math.round(Number(voteResp.op2Percent ?? 0)) },
              ];
            } else if (Array.isArray(updated.votedLogs)) {
              return opts.map((opt: string, idx: number) => ({
                id: `opt${idx + 1}`,
                text: opt,
                votes: updated.votedLogs.filter((log: any) => log.optionIndex === idx || log.voteNum === idx + 1).length,
              }));
            } else {
              return opts.map((opt: string, idx: number) => ({ id: `opt${idx + 1}`, text: opt, votes: 0 }));
            }
          }
          return undefined;
        })(),

        comments: (updated.comments ?? []).map((c: any) => ({
          id: c.commentId,
          author: c.writerName,
          content: c.content,
          timestamp: new Date().toISOString(),
        })),
      };

    // ------------------------------
    // teams 상태에서 해당 post만 교체
    // ------------------------------
    setTeams(
      teams.map((team) =>
        team.id === teamId
          ? {
              ...team,
              posts: team.posts.map((post) =>
                post.id === postId ? convertedPost : post
              ),
            }
          : team
      )
    );
  } catch (err) {
    console.error("게시글 수정 API 오류:", err);
  }
};

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

  const handleAddPost = async () => {
    console.log("selectedTeamId:", selectedTeamId);
    console.log("newPostContent:", newPostContent);
    if (!newPostContent.trim() || !selectedTeamId) return;

    const isPoll = postType === "vote";

    // 🔥 백엔드 요청 DTO 정확히 맞춘 body
    const body = {
      groupId: Number(selectedTeamId),
      type: isPoll ? "vote" : "text",
      content: newPostContent,
      voteTitle: isPoll ? pollQuestion : null,
      voteContent: isPoll ? `${pollOption1}_${pollOption2}` : null,
    };

    try {
      const res = await fetch(origin+"/api/v1/post", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify(body),
      });

      const data = await res.json();
      if (!data.isSuccess) {
        console.error("게시글 생성 실패:", data.message);
        return;
      }

      // 서버에 성공적으로 작성되면 API에서 최신 게시글을 다시 불러와 반영
      await loadPostsForTeams();

      // 입력창 초기화
      setNewPostContent("");
      setSelectedTeamId("");
      setShowAddPostDialog(false);
      setPollQuestion("");
      setPollOption1("");
      setPollOption2("");
      setPostType("text");

    } catch (err) {
      console.error("게시글 생성 API 오류:", err);
    }    
  };

  const handleAddComment = async (teamId: string, postId: string) => {
  const commentText = commentInputs[postId];
  if (!commentText?.trim()) return;

  try {
    // 서버로 댓글 전송 (DTO: CommentUpdateDto(long id, String content))
    const body = {
      postId: Number(postId),
      content: commentText,
    };

    const res = await fetch(origin+"/api/v1/comment", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
      },
      body: JSON.stringify(body),
    });

    const data = await res.json();

    if (!data.isSuccess) {
      console.error("댓글 생성 실패:", data.message);
      return;
    }

    // 서버 반영된 최신 게시글을 다시 불러와 상태 갱신
    await loadPostsForTeams();

    // 댓글 입력창 초기화
    setCommentInputs({ ...commentInputs, [postId]: "" });
    setCommentImages({ ...commentImages, [postId]: null });
  } catch (err) {
    console.error("댓글 생성 API 오류:", err);
  }
};

const handleDeleteComment = async (
  commentId: string,
) => {
  try {
    const res = await fetch(origin+`/api/v1/comment/${commentId}`, {
      method: "DELETE",
      headers: {
        "Authorization": `Bearer ${token}`,
      },
    });

    const data = await res.json();
    if (!data.isSuccess) {
      console.error("댓글 삭제 실패:", data.message);
      return;
    }

    // 삭제 후 최신 상태로 갱신
    await loadPostsForTeams();
  } catch (err) {
    console.error("댓글 삭제 API 오류:", err);
  }
};

  const handleCommentInputChange = (
    postId: string,
    value: string,
  ) => {
    setCommentInputs({ ...commentInputs, [postId]: value });
  };

  const handleVote = async (
  teamId: string,
  postId: string,
  optionId: string,
) => {
  // 현재 포스트 찾기
  const team = teams.find((t) => t.id === teamId);
  const post = team?.posts.find((p) => p.id === postId);
  if (!post || !post.pollOptions) return;

  // 이미 투표한 상태면 무시 (중복 선택 방지)
  if (post.userVote) {
    console.log("이미 투표되어 있음, 추가 투표 불가:", post.userVote);
    return;
  }

  // 낙관적 업데이트를 위한 백업
  const prevTeams = teams;

  // 낙관적 UI 업데이트: pollUsesPercent면 퍼센트 직접 변경하지 않고 userVote만 설정
  setTeams((prev) =>
    prev.map((t) =>
      t.id === teamId
        ? {
            ...t,
            posts: t.posts.map((p) => {
              if (p.id !== postId) return p;
              return {
                ...p,
                userVote: optionId,
                pollOptions: p.pollUsesPercent
                  ? p.pollOptions // 퍼센트 기반이면 그대로 (서버 응답으로 갱신할 것)
                  : p.pollOptions.map((opt) =>
                      opt.id === optionId
                        ? { ...opt, votes: opt.votes + 1 }
                        : opt,
                    ),
              };
            }),
          }
        : t,
    ),
  );

  // voteText 결정 (옵션 텍스트 우선, 없으면 optN -> N)
  const option = post.pollOptions.find((o) => o.id === optionId);
  let voteText = option?.text ?? optionId;
  const m = /^opt(\d+)$/.exec(optionId);
  if (!option?.text && m) voteText = m[1];

  const body = {
    postId: Number(postId),
    voteText,
  };

  try {
    const res = await fetch(origin + "/api/v1/post/vote", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      const txt = await res.text().catch(() => "");
      console.error("투표 HTTP 오류:", res.status, txt);
      setTeams(prevTeams); // 롤백
      return;
    }

    const data = await res.json();
    if (!data.isSuccess) {
      console.error("투표 실패:", data.message, data);
      setTeams(prevTeams); // 롤백
      return;
    }

    // 서버의 최신 투표 로그/퍼센트로 재로딩하여 정확히 반영
    await loadPostsForTeams();
  } catch (err) {
    console.error("투표 API 오류:", err);
    setTeams(prevTeams); // 롤백
  }
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
                      {post.type === "vote" &&
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
                                    <div className="flex items-center gap-2 justify-between">
                                      <div className="flex items-center gap-2">
                                        <span className="text-xs text-gray-600">
                                          {comment.author}
                                        </span>
                                        <span className="text-xs text-gray-400">
                                          {comment.timestamp}
                                        </span>
                                      </div>
                                      {comment.isWrite && (
                                        <button
                                          onClick={() => handleDeleteComment(comment.id)}
                                          aria-label="댓글 삭제"
                                          className="ml-2 p-1 rounded hover:bg-red-50 transition-colors"
                                        >
                                          <Trash2 className="w-4 h-4 text-red-500" />
                                        </button>
                                      )}
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
                                id={`comment-image-text-${post.id}`}
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
                                      `comment-image-text-${post.id}`,
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
                      게시글 추가
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
                  {postType === "text"
                    ? "일반 게시글"
                    : "투표 게시글"}
                </button>
                {showPostTypeMenu && (
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