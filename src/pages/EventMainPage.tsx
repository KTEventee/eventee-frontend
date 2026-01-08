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
import axios from 'axios';
import SockJS from 'sockjs-client';
import Stomp from 'stompjs';

type Comment = {
  id: string;
  author: string;
  content: string;
  timestamp: string;
  imageUrl?: string;
  isWrite: boolean;
};

type PollOption = {
  id: string;          // "opt1", "opt2" …
  text: string;        // 옵션 텍스트
  votes: number;       // 득표 수
  percent?: number;    // (백엔드에서 주는 percent, UI에서는 안 써도 됨)
  isMine?: boolean;    // 내가 찍은 옵션인지 여부
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
  userVote?: string;       // "opt1" 같은 형식
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
  nickname?: string; // 이벤트 내 닉네임
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
  const { user } = useApp();
  const [stompClient, setStompClient] = useState<any>(null);

  const API_URL = import.meta.env.VITE_API_URL;

  const eventTitle = location.state?.eventTitle || "이벤트";
  const eventCode = location.state?.eventCode || "";
  const eventId = location.state?.eventId || 7;

  console.log("[EventMainPage] 렌더링 시작", {
    locationState: location.state,
    eventTitle,
    eventCode,
    eventId,
    user,
  });

  const [eventInfo, setEventInfo] = useState<EventInfo | null>(null);
  const [teams, setTeams] = useState<Team[]>([]);

  const [showAddPostDialog, setShowAddPostDialog] = useState(false);
  const [newPostContent, setNewPostContent] = useState("");
  const [selectedTeamId, setSelectedTeamId] = useState<string>("");
  const [commentInputs, setCommentInputs] = useState<{ [key: string]: string }>({});
  const [newPostImage, setNewPostImage] = useState<string | null>(null);
  const [commentImages, setCommentImages] = useState<{ [key: string]: string | null }>({});
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
  const [cannonLoading, setCannonLoading] = useState(false);

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
    console.log("[EventMainPage] useEffect(eventId) 실행", { eventId });
    loadEventGroups();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [eventId]);

  useEffect(() => {
    console.log("[EventMainPage] eventInfo 변경됨", eventInfo);
  }, [eventInfo]);

  useEffect(() => {
    console.log("[EventMainPage] teams 변경됨", teams);
  }, [teams]);

  // 대포게임 관련 코드 
  
  useEffect(() => {
        const socket = new SockJS('https://api.eventee.cloud/ws');
        const client = Stomp.over(socket);
        client.connect({}, () => {
          client.subscribe(`/sub/game/${eventId}/result`, (msg: any) => {
            console.log('💥 결과:', msg.body);
            alert(msg.body);
          });
        });
        setStompClient(client);

        return () => {
          if (client) {
            try {
              client.disconnect(() => {});
            } catch (e) {
              console.warn('[EventMainPage] client.disconnect error', e);
            }
          }
        };
    }, [eventId]);

  // 대포게임: 이벤트 참여자 닉네임 목록 조회 (있으면 사용, 없으면 admin endpoint로 폴백)
  const getEventMemberNicknames = async (): Promise<string[]> => {
    try {
  
      const tryUrl = `${API_URL}/api/v1/event/events/admin/members/nickname?eventId=${eventId}`;
        try {
          console.log("[EventMainPage] 멤버 닉네임 조회 시도", tryUrl);
          const res = await apiFetch(tryUrl, { method: "GET" });
          if (!res.ok) {
            console.warn("[EventMainPage] 멤버 조회 HTTP 비정상", { tryUrl, status: res.status });
            throw new Error(`HTTP ${res.status}`);
          }
          const data = await res.json();
          console.log("[EventMainPage] 멤버 조회 응답", { tryUrl, data });

          const root = data?.result ?? data?.data ?? data;
          if (Array.isArray(root)) return root.map(String);

          const arr = root?.members ?? root?.nicknames ?? root?.result ?? null;
          if (Array.isArray(arr)) return arr.map((v: any) => String(v));
        } catch (innerErr) {
          console.warn("[EventMainPage] 멤버 조회 예외, 다음 엔드포인트로 폴백", innerErr);
        }
      

      return [];
    } catch (err) {
      console.error("[EventMainPage] 멤버 닉네임 조회 실패:", err);
      return [];
    }
  };

  // 대포 게임 시작: 닉네임 목록을 보내면 서버가 한명을 골라 WebSocket으로 결과 전송
  const handleCannonGame = async () => {
    try {
      console.log("[EventMainPage] 대포 게임 시작 요청");
      const nicknames = await getEventMemberNicknames();
      console.log("[EventMainPage] 전송할 닉네임 목록", nicknames);
      if (!nicknames || nicknames.length === 0) {
        console.warn("[EventMainPage] 전송할 닉네임이 없습니다.");
        return;
      }

      const res = await apiFetch(`${API_URL}/api/v1/game/${eventId}/cannon`, {
        method: "GET",
        body: JSON.stringify(nicknames),
      });

      console.log("[EventMainPage] 대포 게임 API 응답", res);
      const data = await res.json();
      console.log("[EventMainPage] 대포 게임 응답 JSON", data);
      if (!data?.isSuccess) {
        console.warn("[EventMainPage] 대포 게임 시작 실패", data);
        return;
      }

      console.log("[EventMainPage] 대포 게임 요청 성공, 서버에서 결과 전송 대기");
    } catch (err) {
      console.error("[EventMainPage] 대포 게임 요청 오류:", err);
    }
  };

  const assignGroupColor = (groupNo?: number) => {
    const palette = ["#FFAB5D", "#E8E4D9", "#F5D0C5", "#C7D2FE", "#FDE68A"];
    if (!groupNo) return palette[0];
    return palette[(groupNo - 1) % palette.length];
  };

  const loadEventGroups = async () => {
    try {
      console.log("[EventMainPage] 이벤트 그룹 목록 조회 시작", { eventId, API_URL });
      const res = await apiFetch(`${API_URL}/api/v1/event/events/${eventId}/groups`, {
        method: "GET",
      });

      console.log("[EventMainPage] 이벤트 그룹 목록 fetch 응답 객체", res);
      const data = await res.json();
      console.log("[EventMainPage] 이벤트 그룹 목록 응답 JSON", data);

      if (!data.isSuccess) {
        console.warn("[EventMainPage] 이벤트 그룹 목록 응답 isSuccess=false", data);
        return;
      }

      const {
        title,
        eventTitle: legacyEventTitle,
        description,
        eventDescription,
        startAt,
        endAt,
        thumbnailUrl,
        teamCount,
        groups,
        role,
        nickname, // ✅ 백엔드에서 넘어오는 이벤트 내 닉네임 기대
      } = data.result;

      const resolvedTitle = title ?? legacyEventTitle ?? eventTitle;
      const resolvedDescription = description ?? eventDescription;

      console.log("[EventMainPage] 파싱된 이벤트 정보", {
        eventId,
        resolvedTitle,
        resolvedDescription,
        startAt,
        endAt,
        thumbnailUrl,
        teamCount,
        role,
        nickname,
      });

      setEventInfo({
        eventId,
        title: resolvedTitle,
        description: resolvedDescription,
        startAt,
        endAt,
        thumbnailUrl,
        teamCount,
        role,
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

      console.log("[EventMainPage] 변환된 팀 목록", convertedTeams);

      setTeams(convertedTeams);

      const teamsWithPosts = await Promise.all(
        convertedTeams.map(async (team) => {
          const posts = await fetchGroupPosts(team.id);
          console.log("[EventMainPage] 팀별 게시글 로딩 완료", {
            teamId: team.id,
            teamName: team.name,
            posts,
          });
          return { ...team, posts };
        })
      );

      console.log("[EventMainPage] 게시글 포함 팀 목록 최종", teamsWithPosts);
      setTeams(teamsWithPosts);
    } catch (err) {
      console.error("이벤트 그룹 API 오류:", err);
    }
  };


  // ==========================
  // 대포쏘기 
  // ==========================
  // const handleCannonGame = async () => {
  //       try {
  //           const response = await axios.post(`/api/v1/game/${eventId}/cannon`, userNicknames);
  //           console.log('Game started:', response.data);
  //       } catch (error) {
  //           console.error('Error starting game:', error);
  //       }
  //   };

    // 밑에꺼 추가해야 실행됨.
    // <div>
    //         {/* Other components and content */}
    //         <h2>게임 시작하기</h2>
    //         <button onClick={handleCannonGame}>대포쏘기 게임 시작</button>
    //     </div>

  const openGroupEditDialog = (team: Team) => {
    console.log("[EventMainPage] 그룹 수정 다이얼로그 오픈", team);
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
    console.log("[EventMainPage] 그룹 수정 다이얼로그 닫기");
    setGroupEditDialogOpen(false);
    setGroupEditForm({
      groupId: "",
      groupName: "",
      groupDescription: "",
      imgUrl: "",
      leader: "",
    });
  };

  const handleGroupEditInputChange = (field: keyof GroupEditFormState, value: string) => {
    console.log("[EventMainPage] 그룹 수정 인풋 변경", { field, value });
    setGroupEditForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmitGroupEdit = async () => {
    if (!groupEditForm.groupId || !groupEditForm.groupName.trim()) {
      console.warn("[EventMainPage] 그룹 수정 필수값 누락", groupEditForm);
      return;
    }

    const payload = {
      groupId: Number(groupEditForm.groupId),
      groupName: groupEditForm.groupName.trim(),
      groupDescription: groupEditForm.groupDescription ?? "",
      imgUrl: groupEditForm.imgUrl ?? "",
      leader: groupEditForm.leader ?? "",
    };

    try {
      console.log("[EventMainPage] 그룹 수정 요청", payload);
      const res = await apiFetch(`${API_URL}/api/v1/group`, {
        method: "PUT",
        body: JSON.stringify(payload),
      });

      console.log("[EventMainPage] 그룹 수정 fetch 응답", res);
      const data = await res.json();
      console.log("[EventMainPage] 그룹 수정 응답 JSON", data);
      if (!data.isSuccess) {
        console.warn("[EventMainPage] 그룹 수정 실패 isSuccess=false", data);
        return;
      }

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
  // Post 변환 함수
  // ==========================
    const convertPost = (p: any): Post => {
      const rawType = (p.type ?? "").toString();
  const hasVoteFields =
    Array.isArray(p.pollOptions) ||
    Array.isArray(p.voteOptions) ||
    (typeof p.voteContent === "string" && p.voteContent.includes("_")) ||
    p.voteTitle != null;

  const isVote =
    rawType.toLowerCase() === "vote" ||
    rawType.toUpperCase() === "VOTE" ||
    hasVoteFields;

  // 원래 옵션 소스 결정
  let optionsArr: any[] | undefined = undefined;
  if (Array.isArray(p.pollOptions)) optionsArr = p.pollOptions;
  else if (Array.isArray(p.voteOptions)) optionsArr = p.voteOptions;

  // 서버가 voteOptions에 하나의 객체로 오고 그 객체의 text가 "a_b" 같은 형태이면 분리
  if (
    Array.isArray(optionsArr) &&
    optionsArr.length === 1 &&
    typeof optionsArr[0].text === "string" &&
    optionsArr[0].text.includes("_")
  ) {
    const parts = optionsArr[0].text
      .split("_")
      .map((s: string) => s.trim())
      .filter(Boolean)
      .slice(0, 2); // 옵션은 2개만 사용
    optionsArr = parts.map((text: string, idx: number) => ({
      optionNo: idx + 1,
      text,
      votes: 0,
      percent: 0,
      isMine: false,
    }));
  }

  // 문자열 형태(voteContent)도 "_"로 분리
  if (!optionsArr && typeof p.voteContent === "string") {
    const parts = p.voteContent
      .split("_")
      .map((s: string) => s.trim())
      .filter(Boolean)
      .slice(0, 2);
    optionsArr = parts.map((text: string, idx: number) => ({ _text: text, _idx: idx }));
  }

  // 표준 PollOption 배열 생성
  const pollOptions: PollOption[] | undefined = Array.isArray(optionsArr)
    ? optionsArr.map((opt: any, idx: number) => {
        const optionNo = opt.optionNo ?? opt.optionNoString ?? opt.optionIndex ?? opt._idx ?? (idx + 1);
        const id = `opt${optionNo}`;
        const text = opt.text ?? opt.optionText ?? opt.option ?? opt._text ?? String(opt);
        const votes = Number(opt.votes ?? opt.count ?? 0);
        const percent = opt.percent ?? opt.rate ?? undefined;
        const isMine = Boolean(opt.isMine ?? opt.isMineFlag ?? false);
        return { id, text, votes, percent, isMine } as PollOption;
      })
    : undefined;

  // userVote 대응
  const userVoteRaw = p.userVote ?? p.voteSelected ?? p.myVote ?? undefined;
  const userVote =
    isVote && userVoteRaw != null
      ? typeof userVoteRaw === "number"
        ? `opt${userVoteRaw}`
        : userVoteRaw.toString().startsWith("opt")
        ? userVoteRaw.toString()
        : `opt${userVoteRaw}`
      : undefined;

  const comments = (p.comments ?? []).map((c: any) => ({
    id: String(c.commentId ?? c.id ?? ""),
    author: c.writerNickname ?? c.author ?? c.nickname ?? "익명",
    content: c.content ?? c.text ?? "",
    timestamp: c.createdAt ?? c.createdAtAt ?? c.timestamp ?? "",
    imageUrl: c.imageUrl ?? c.img ?? undefined,
    isWrite: Boolean(c.isMine ?? c.isWrite ?? false),
  }));

  return {
    id: String(p.postId ?? p.id ?? ""),
    author: p.author ?? p.writerNickname ?? p.writer ?? "알 수 없음",
    content: p.content ?? p.text ?? "",
    type: isVote ? "vote" : "text",
    pollQuestion: p.pollQuestion ?? p.voteTitle ?? p.voteQuestion ?? undefined,
    pollOptions: pollOptions && pollOptions.length > 0 ? pollOptions : undefined,
    userVote,
    createdAt: p.createdAt ?? p.createdAtAt ?? undefined,
    comments,
    likes: Number(p.likes ?? 0),
    isLiked: Boolean(p.isLiked ?? false),
    isWrite: Boolean(p.isMine ?? p.isWrite ?? false),
  };
    };




  const fetchGroupPosts = async (groupId: string): Promise<Post[]> => {
    try {
      console.log("[EventMainPage] 그룹 게시글 조회 시작", { eventId, groupId });
      const res = await apiFetch(
        `${API_URL}/api/v1/content/posts/${eventId}/gourps/${groupId}`,
        {
          method: "GET",
        }
      );

      console.log("[EventMainPage] 그룹 게시글 fetch 응답", res);
      const data = await res.json();
      console.log("[EventMainPage] 그룹 게시글 응답 JSON", { groupId, data });

      if (!data.isSuccess) {
        console.warn("[EventMainPage] 그룹 게시글 응답 isSuccess=false", {
          groupId,
          data,
        });
        return [];
      }

      const maybe = (obj: any) => obj ?? undefined;
    const root = maybe(data) || maybe(data.data) || {};

    // 우선 result 경로를 잡아둠
    const result = root.result ?? root;

    let posts: any[] = [];

    if (Array.isArray(result.posts)) {
      posts = result.posts;
    } else if (Array.isArray(result.lists)) {
      // lists 배열에서 현재 groupId (숫자/문자 둘다 대응)와 매칭되는 항목의 posts 사용
      const gidNum = Number(groupId);
      const found = result.lists.find((it: any) =>
        Number(it.groupNum) === gidNum ||
        String(it.groupId) === String(groupId) ||
        String(it.groupId) === String(Number(groupId))
      );
      posts = (found?.posts ?? []);
    } else if (Array.isArray(root.lists)) {
      // 혹시 루트가 바로 lists인 경우
      const gidNum = Number(groupId);
      const found = root.lists.find((it: any) =>
        Number(it.groupNum) === gidNum ||
        String(it.groupId) === String(groupId)
      );
      posts = (found?.posts ?? []);
    } else {
      // fallback: maybe result itself is an array of posts
      if (Array.isArray(result)) posts = result;
      else posts = [];
    }

    console.log("[EventMainPage] 파싱된 posts", { groupId, posts });

    if (!posts || posts.length === 0) {
      // 빈 배열이면 호출자에서 빈 상태로 처리하도록 빈 반환
      return [];
    }

      const converted = posts.map((post: any) => convertPost(post));
      return converted;
    } catch (err) {
      console.error("그룹 게시글 API 오류:", err);
      return [];
    }
  };

  // ==========================
  // 게시글 생성
  // ==========================
  const resetPostForm = () => {
    console.log("[EventMainPage] 게시글 폼 리셋");
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
    if (!teamId) {
      console.warn("[EventMainPage] refreshTeamPosts teamId 없음");
      return;
    }
    console.log("[EventMainPage] 팀 게시글 새로고침 시작", { teamId });
    const posts = await fetchGroupPosts(teamId);
    setTeams((prev) =>
      prev.map((team) => (team.id === teamId ? { ...team, posts } : team))
    );
  };

  const closePostDialog = () => {
    console.log("[EventMainPage] 게시글 다이얼로그 닫기");
    setShowAddPostDialog(false);
    resetPostForm();
  };

  const openPostDialog = (teamId: string, post?: Post) => {
    console.log("[EventMainPage] 게시글 다이얼로그 오픈", { teamId, post });
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
    if (!newPostContent.trim() || !selectedTeamId) {
      console.warn("[EventMainPage] 게시글 저장 필수값 누락", {
        newPostContent,
        selectedTeamId,
      });
      return;
    }

    const isPoll = postType === "vote";

    const body: Record<string, any> = {
      groupId: Number(selectedTeamId),
      eventId: eventId,
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

    if (editingPost) {
      body.postId = Number(editingPost.id);
    }

    try {
      console.log("[EventMainPage] 게시글 저장 요청", {
        mode: editingPost ? "update" : "create",
        body,
      });
      const res = await apiFetch(`${API_URL}/api/v1/content/posts`, {
        method: editingPost ? "PATCH" : "POST",
        body: JSON.stringify(body),
      });

      console.log("[EventMainPage] 게시글 저장 fetch 응답", res);
      const data = await res.json();
      console.log("[EventMainPage] 게시글 저장 응답 JSON", data);
      if (!data.isSuccess) {
        console.warn("[EventMainPage] 게시글 저장 실패 isSuccess=false", data);
        return;
      }

      await refreshTeamPosts(selectedTeamId);
      closePostDialog();
    } catch (err) {
      console.error("게시글 저장 오류:", err);
    }
  };

  // ==========================
  // 댓글 생성
  // ==========================
  const handleAddComment = async (teamId: string, postId: string) => {
    const commentText = commentInputs[postId];
    if (!commentText?.trim()) {
      console.warn("[EventMainPage] 댓글 내용 없음", { postId, commentText });
      return;
    }

    const body = {
      postId: Number(postId),
      content: commentText,
    };

    try {
      console.log("[EventMainPage] 댓글 생성 요청", body);
      const res = await apiFetch(`${API_URL}/api/v1/content/comments`, {
        method: "POST",
        body: JSON.stringify(body),
      });

      console.log("[EventMainPage] 댓글 생성 fetch 응답", res);
      const data = await res.json();
      console.log("[EventMainPage] 댓글 생성 응답 JSON", data);
      if (!data.isSuccess) {
        console.warn("[EventMainPage] 댓글 생성 실패 isSuccess=false", data);
        return;
      }

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
      console.log("[EventMainPage] 댓글 삭제 요청", { commentId });
      const res = await apiFetch(`${API_URL}/api/v1/comment/${commentId}`, {
        method: "DELETE",
      });

      console.log("[EventMainPage] 댓글 삭제 fetch 응답", res);
      const data = await res.json();
      console.log("[EventMainPage] 댓글 삭제 응답 JSON", data);
      if (!data.isSuccess) {
        console.warn("[EventMainPage] 댓글 삭제 실패 isSuccess=false", data);
        return;
      }

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
    if (!post || !post.pollOptions) {
      console.warn("[EventMainPage] 투표 대상 게시글/옵션 없음", {
        teamId,
        postId,
        post,
      });
      return;
    }

    const option = post.pollOptions.find((o) => o.id === optionId);
    const voteText = option?.text ?? optionId;

    try {
      console.log("[EventMainPage] 투표 요청", {
        postId,
        voteText,
      });
      const res = await apiFetch(`${API_URL}/api/v1/content/posts/vote`, {
        method: "POST",
        body: JSON.stringify({
          postId: Number(postId),
          voteText,
        }),
      });

      console.log("[EventMainPage] 투표 fetch 응답", res);
      const data = await res.json();
      console.log("[EventMainPage] 투표 응답 JSON", data);
      if (!data.isSuccess) {
        console.warn("[EventMainPage] 투표 실패 isSuccess=false", data);
        return;
      }

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
      console.log("[EventMainPage] 게시글 삭제 요청", { postId });
      const res = await apiFetch(`${API_URL}/api/v1/content/posts/${postId}`, {
        method: "DELETE",
      });

      console.log("[EventMainPage] 게시글 삭제 fetch 응답", res);
      const data = await res.json();
      console.log("[EventMainPage] 게시글 삭제 응답 JSON", data);
      if (!data.isSuccess) {
        console.warn("[EventMainPage] 게시글 삭제 실패 isSuccess=false", data);
        return;
      }

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

  const isEventHost = (eventInfo?.role ?? user?.role)?.toUpperCase() === "HOST";
  console.log("[EventMainPage] isEventHost 계산", {
    eventRole: eventInfo?.role,
    userRole: user?.role,
    isEventHost,
  });

  // ✅ 이벤트 닉네임 우선 사용 (join 응답의 nickname)
  const displayNickname =
    eventInfo?.nickname ??
    location.state?.eventNickname ?? // 혹시 state로도 넘어온 경우 대비
    user?.nickname ??
    user?.email ??
    "닉네임";

  // ===================================================
  // ==================== UI 시작 ======================
  // ===================================================

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
                console.log("[EventMainPage] 운영자 페이지 버튼 클릭", {
                  eventId,
                });
                navigate("/admin-dashboard", { state: { eventId } });
              }}
            >
              운영자 페이지
            </EventeeButton>
          )}

          <EventeeButton
            variant="ghost"
            onClick={async () => {
              try {
                setCannonLoading(true);
                await handleCannonGame();
              } finally {
                setCannonLoading(false);
              }
            }}
            disabled={cannonLoading}
            title="대포 게임 시작"
          >
            {cannonLoading ? "대포 중..." : "대포쏘기"}
          </EventeeButton>

          <button
            type="button"
            onClick={() => {
              console.log(
                "[EventMainPage] 헤더 프로필 영역 클릭 → 마이페이지 이동"
              );
              navigate("/my-page");
            }}
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
              {/* ✅ 이벤트 닉네임 사용 */}
              <p className="text-sm font-medium text-gray-800">
                {displayNickname}
              </p>
              {/* 아래는 계정 이메일 그대로 유지 */}
              <p className="text-xs text-gray-500">
                {user?.email || "마이페이지 이동"}
              </p>
            </div>
          </button>
        </div>
      </div>

      {/* 메인 컨텐츠 */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* 팀 컬럼 */}
        <div className="flex-1 overflow-x-auto px-4 py-6">
          <div className="flex gap-4 min-w-min">
            {teams.map((team) => (
              <div key={team.id} className="w-[280px] flex-shrink-0">
                <div
                  className={`rounded-t-xl px-4 py-3 flex items-center justify-between ${
                    team.isMyTeam ? "ring-2 ring-[#67594C]" : ""
                  }`}
                  style={{ backgroundColor: team.color }}
                >
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm">{team.name}</h3>
                    <button
                      onClick={() => openGroupEditDialog(team)}
                      className="p-1 rounded hover:bg-white/40 transition"
                      title="그룹 정보 수정"
                    >
                      <Pencil className="w-3 h-3 text-gray-700" />
                    </button>
                    {team.isMyTeam && (
                      <span className="text-xs bg.white/40 px-2 py-0.5 rounded">
                        내 팀
                      </span>
                    )}
                  </div>
                </div>

                {/* Post 리스트 */}
                <div className="space-y-3 mt-3">
                  {team.posts.map((post) => (
                    <div
                      key={post.id}
                      className="bg-white rounded-lg shadow-sm p-4 hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-full bg-gray-300"></div>
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

                      {/* 투표 게시글 */}
                      {post.type === "vote" && post.pollOptions ? (
                        <>
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

                          <p className="text-xs text-gray-600 mb-4 whitespace-pre-line">
                            {post.content}
                          </p>

                          <div className="grid grid-cols-2 gap-2 mb-3">
                            {post.pollOptions.map((option) => {
                              const totalVotes = post.pollOptions!.reduce(
                                (sum, opt) => sum + opt.votes,
                                0
                              );

                              const percentage =
                                totalVotes > 0
                                  ? Math.round(
                                      (option.votes / totalVotes) * 100
                                    )
                                  : 0;

                              const isVoted = post.userVote === option.id;

                              return (
                                <button
                                  key={option.id}
                                  onClick={() => handleVote(team.id, post.id, option.id)}
                                  className="rounded-lg p-4 text-center transition-all"
                                  style={{
                                    backgroundColor: option.isMine
                                      ? "#67594C"        // ✔ 선택된 색
                                      : "#E5E7EB",       // 기본 색

                                    color: option.isMine ? "white" : "#6B7280",
                                    border: option.isMine ? "2px solid #67594C" : "1px solid #D1D5DB",
                                    opacity: option.isMine ? 1 : 0.7,
                                  }}
                                >
                                  <div className="text-sm mb-1">{option.text}</div>
                                  <div>{percentage}%</div>
                                </button>

                              );
                            })}
                          </div>
                        </>
                      ) : (
                        <>
                          {/* 내용 */}
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
                            <div className="border-t pt-3 mb-3 space-y-2">
                              {post.comments.map((comment) => (
                                <div key={comment.id} className="flex gap-2">
                                  <div className="w-5 h-5 rounded-full bg-gray-200"></div>
                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-center justify-between gap-2">
                                      <div className="flex items-center gap-2">
                                        <span className="text-xs text-gray-600">
                                          {comment.author}
                                        </span>
                                          <span className="text-xs text-gray-400">
                                            {formatDateOnly(comment.timestamp)}
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
                                        [post.id]: reader.result as string,
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
                  ))}

                  <div className="bg-gray-50 rounded-lg p-3 text-center">
                    <button
                      onClick={() => {
                        console.log(
                          "[EventMainPage] 팀 카드 내 게시글 추가 버튼 클릭",
                          {
                            teamId: team.id,
                          }
                        );
                        openPostDialog(team.id);
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
      </div>

      {/* 게시글 추가 다이얼로그 */}
      <Dialog
        open={showAddPostDialog}
        onOpenChange={(open) => {
          console.log("[EventMainPage] 게시글 다이얼로그 openChange", open);
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
                    console.log(
                      "[EventMainPage] 게시글 작성 팀 선택 변경",
                      e.target.value
                    );
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
                  className="w-full mt-2 h-[51px] rounded-[15px] border border-gray-300 px-4 bg-white flex items-center justify-between"
                  onClick={() =>
                    setShowPostTypeMenu((prev) => !prev)
                  }
                >
                  {postType === "text" ? "일반 게시글" : "투표 게시글"}
                </button>

                {showPostTypeMenu && (
                  <div className="absolute left-0 top-full w-full bg-white border border-gray-300 rounded-b-[15px] z-10">
                    <button
                      className="w-full px-4 py-2 text-left hover:bg-gray-100"
                      onClick={() => {
                        console.log(
                          "[EventMainPage] 게시글 유형 선택: text"
                        );
                        setPostType("text");
                        setShowPostTypeMenu(false);
                      }}
                    >
                      일반 게시글
                    </button>
                    <button
                      className="w-full px-4 py-2 text-left hover:bg-gray-100"
                      onClick={() => {
                        console.log(
                          "[EventMainPage] 게시글 유형 선택: vote"
                        );
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

      <Dialog
        open={groupEditDialogOpen}
        onOpenChange={(open) => {
          console.log("[EventMainPage] 그룹 수정 다이얼로그 openChange", open);
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
