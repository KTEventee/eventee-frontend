import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useApp } from "../contexts/AppContext";
import { Button } from "../components/ui/button";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Users, Plus, Trash2, Layers } from "lucide-react";
import { format } from "date-fns";
import { apiFetch } from "../utils/apiFetch";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "../components/ui/dialog";

const API_URL = import.meta.env.VITE_API_URL;

export default function AdminDashboard() {
  const navigate = useNavigate();
  const { user, currentEvent } = useApp();

  const [adminEvent, setAdminEvent] = useState<any | null>(null);
  const [eventLoading, setEventLoading] = useState(true);

  const [participants, setParticipants] = useState<any[]>([]);
  const [loadingParticipants, setLoadingParticipants] = useState(false);
  const [participantsError, setParticipantsError] = useState(null);

  const [groups, setGroups] = useState<any[]>([]);
  const [groupLoading, setGroupLoading] = useState(false);
  const [groupError, setGroupError] = useState(null);

  const [newGroupName, setNewGroupName] = useState("");
  const [newGroupDesc, setNewGroupDesc] = useState("");

  if (!currentEvent || !user) return null;

  /* -------------------------------
      관리자 이벤트 상세 로드
  ------------------------------- */
  async function loadAdminEvent() {
    try {
      const res = await apiFetch(
        `${API_URL}/api/v1/events/admin/detail?eventId=${currentEvent.id}`,
        { method: "GET" }
      );
      const data = await res.json();

      if (data.isSuccess) {
        const e = data.result;
        setAdminEvent({
          id: e.eventId,
          title: e.title,
          description: e.description,
          inviteCode: e.inviteCode,
          startDate: new Date(e.startAt),
          endDate: new Date(e.endAt),
          participantCount: e.participantCount,
          groupCount: e.groupCount,
        });
      }
    } catch (e) {
      console.error("관리자 이벤트 상세조회 실패", e);
    } finally {
      setEventLoading(false);
    }
  }

  useEffect(() => {
    loadAdminEvent();
  }, []);

  if (eventLoading || !adminEvent)
    return <div className="text-center py-20 text-gray-500">불러오는 중...</div>;

  const event = adminEvent;

  /* -------------------------------
      참여자 목록 불러오기
  ------------------------------- */
  async function loadParticipants() {
    try {
      setLoadingParticipants(true);
      setParticipantsError(null);

      const res = await apiFetch(
        `${API_URL}/api/v1/events/admin/members?eventId=${event.id}`,
        { method: "GET" }
      );
      const data = await res.json();

      setParticipants(Array.isArray(data?.result) ? data.result : []);
    } catch {
      setParticipantsError("참여자 목록을 불러오지 못했습니다.");
    } finally {
      setLoadingParticipants(false);
    }
  }

  /* -------------------------------
      그룹 목록 불러오기
  ------------------------------- */
  async function loadGroups() {
    try {
      setGroupLoading(true);
      setGroupError(null);

      const res = await apiFetch(
        `${API_URL}/api/v1/events/${event.id}/groups`,
        { method: "GET" }
      );
      const data = await res.json();

      setGroups(Array.isArray(data?.result?.groups) ? data.result.groups : []);
    } catch {
      setGroupError("그룹 목록을 불러오지 못했습니다.");
    } finally {
      setGroupLoading(false);
    }
  }

  /* -------------------------------
      그룹 생성
  ------------------------------- */
  async function createGroup() {
    if (!newGroupName.trim()) return alert("그룹명을 입력하세요");

    try {
      const res = await apiFetch(`${API_URL}/api/v1/group/admin`, {
        method: "POST",
        body: JSON.stringify({
          eventId: event.id,
          groupName: newGroupName,
          groupDescription: newGroupDesc,
        }),
      });

      const data = await res.json();
      if (!data.isSuccess) return alert("그룹 생성 실패");

      setNewGroupName("");
      setNewGroupDesc("");

      await loadGroups();
      await loadAdminEvent(); 
    } catch {
      alert("그룹 추가 중 오류 발생");
    }
  }

  /* -------------------------------
      그룹 삭제
  ------------------------------- */
  async function deleteGroup(groupId: number) {
    if (!confirm("정말로 삭제하시겠습니까?")) return;

    try {
      const res = await apiFetch(`${API_URL}/api/v1/group/${groupId}`, {
        method: "DELETE",
      });
      const data = await res.json();

      if (!data.isSuccess) return alert("삭제 실패");

      await loadGroups();
      await loadAdminEvent();  
    } catch {
      alert("삭제 중 오류 발생");
    }
  }

  /* -------------------------------
      렌더링
  ------------------------------- */
  return (
    <div className="min-h-screen bg-[#F9F7F4] flex flex-col">
      {/* HEADER */}
      <header className="bg-[#E8E4D9] border-b border-[#D5D0C4] sticky top-0 z-10 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-5 flex items-center justify-between">
          <div className="space-y-1">
            <h1 className="text-xl font-semibold text-[#67594C]">
              EvenTee <span className="text-sm text-[#FFAB5D]">관리자</span>
            </h1>

            <h2 className="text-2xl font-bold text-[#67594C] leading-tight">
              {event.title}
            </h2>

            <p className="text-sm text-gray-600">
              {format(event.startDate, "yyyy.MM.dd")} ~{" "}
              {format(event.endDate, "yyyy.MM.dd")}
            </p>
          </div>

          <Button
            variant="outline"
            onClick={() =>
              navigate("/event-main", {
                state: {
                  eventId: event.id,
                  eventTitle: event.title,
                  eventCode: event.inviteCode,
                  nickname: user.nickname,
                },
              })
            }
          >
            이벤트 화면으로 돌아가기
          </Button>
        </div>
      </header>

      {/* MAIN */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-6 py-8">
        <Tabs
          defaultValue="overview"
          onValueChange={(v) => {
            if (v === "participants") loadParticipants();
            if (v === "groups") loadGroups();
            if (v === "notice") loadGroups();     // ← 공지 작성 탭에서도 그룹 로딩
          }}
        >
          <TabsList className="border-b border-[#DDD6CE] bg-transparent mb-6">
            <TabsTriggerStyled value="overview">대시보드</TabsTriggerStyled>
            <TabsTriggerStyled value="participants">참여자 관리</TabsTriggerStyled>
            <TabsTriggerStyled value="groups">그룹 관리</TabsTriggerStyled>
            <TabsTriggerStyled value="notice">공지 작성</TabsTriggerStyled>
          </TabsList>

          <TabsContent value="overview">
            <DashboardOverview
              event={event}
              reloadEvent={loadAdminEvent}
            />
          </TabsContent>

          <TabsContent value="participants">
            <ParticipantList
              loading={loadingParticipants}
              error={participantsError}
              participants={participants}
            />
          </TabsContent>

          <TabsContent value="groups">
            <GroupManagement
              loading={groupLoading}
              error={groupError}
              groups={groups}
              createGroup={createGroup}
              deleteGroup={deleteGroup}
              newGroupName={newGroupName}
              newGroupDesc={newGroupDesc}
              setNewGroupName={setNewGroupName}
              setNewGroupDesc={setNewGroupDesc}
            />
          </TabsContent>

          {/* 공지 작성 탭 렌더링 */}
          <TabsContent value="notice">
            <NoticeWriteTab groups={groups} event={event} />
          </TabsContent>
          
        </Tabs>
      </main>
    </div>
  );
}

/* ----------------------------------------------------
    TabsTrigger Styled
---------------------------------------------------- */
function TabsTriggerStyled({ value, children }: any) {
  return (
    <TabsTrigger
      value={value}
      className="px-4 pb-3 pt-2 text-sm text-gray-500
      data-[state=active]:border-b-2 data-[state=active]:border-[#67594C]
      data-[state=active]:text-[#67594C] data-[state=active]:font-semibold"
    >
      {children}
    </TabsTrigger>
  );
}

/* ----------------------------------------------------
    Dashboard Overview
---------------------------------------------------- */
function DashboardOverview({ event, reloadEvent }: any) {
  const [isEditOpen, setEditOpen] = useState(false);

  return (
    <>
      <Card className="p-6 bg-white border border-[#E8E4D9] shadow-sm rounded-xl">
        <CardHeader className="flex justify-between items-start">
          <div>
            <CardTitle className="text-[#67594C] text-2xl font-bold">
              {event.title}
            </CardTitle>
            <CardDescription className="text-gray-600 text-base leading-relaxed">
              {event.description || "이벤트 설명이 아직 없습니다."}
            </CardDescription>
          </div>

          <Button
            variant="outline"
            className="text-[#67594C] border-[#D7D2C8] hover:bg-[#F3EFE9]"
            onClick={() => setEditOpen(true)}
          >
            수정
          </Button>
        </CardHeader>

        <CardContent>
          <p className="text-sm text-gray-500">
            {format(event.startDate, "yyyy.MM.dd")} ~ {format(event.endDate, "yyyy.MM.dd")}
          </p>
        </CardContent>
      </Card>

      {/* Info Boxes */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
        <InfoBox label="초대 코드" value={event.inviteCode} color="#FFAB5D" icon={<Layers />} />
        <InfoBox label="참여자 수" value={event.participantCount ?? "-"} color="#A8CBAA" icon={<Users />} />
        <InfoBox label="그룹 수" value={event.groupCount ?? "-"} color="#C7D2FE" icon={<Layers />} />
      </div>

      <EditEventModal
        open={isEditOpen}
        onOpenChange={setEditOpen}
        event={event}
        reloadEvent={reloadEvent}
      />
    </>
  );
}

/* ----------------------------------------------------
    Info Box
---------------------------------------------------- */
function InfoBox({ label, value, color, icon }: any) {
  return (
    <Card
      className="p-6 rounded-xl shadow-sm border border-[#E8E4D9] flex flex-col gap-3"
      style={{ backgroundColor: `${color}22` }}
    >
      <div className="text-[#67594C]">{icon}</div>
      <p className="text-sm text-gray-600">{label}</p>
      <p className="text-3xl font-bold text-[#67594C]">{value}</p>
    </Card>
  );
}

/* ----------------------------------------------------
    Participant List
---------------------------------------------------- */
function ParticipantList({ loading, error, participants }: any) {
  if (loading) return <div className="text-center py-10 text-gray-500">불러오는 중...</div>;
  if (error) return <div className="text-center py-10 text-red-500">{error}</div>;
  if (!participants?.length)
    return <div className="text-center py-10 text-gray-500">참여자가 없습니다.</div>;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {participants.map((p: any) => (
        <Card
          key={p.id}
          className="w-full px-4 py-3 rounded-xl relative border border-[#E4E0D7]
          bg-gradient-to-br from-[#FCFBF9] to-[#F3F1EC] shadow-sm hover:shadow-md transition-all flex flex-col gap-2"
        >
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-full overflow-hidden bg-[#EFECE6] flex items-center justify-center shadow-sm">
              {p.profileImageUrl ? (
                <img src={p.profileImageUrl} className="w-full h-full object-cover" />
              ) : (
                <Users className="w-5 h-5 text-[#C6BEB0]" />
              )}
            </div>
            <div className="flex flex-col">
              <span className="text-[14px] font-semibold text-[#67594C]">{p.nickname}</span>
              <span className="text-[12px] text-gray-500 break-all">{p.email}</span>
            </div>
          </div>

          <span
            className={`absolute top-3 right-3 px-2 py-1 rounded-full text-[11px] font-medium ${
              p.role === "ADMIN"
                ? "bg-[#FFAB5D22] text-[#B46A2A] border border-[#FFAB5D55]"
                : "bg-[#E8E4D9] text-[#67594C] border border-[#D7D2C8]"
            }`}
          >
            {p.role === "ADMIN" ? "관리자" : "참여자"}
          </span>
        </Card>
      ))}
    </div>
  );
}

/* ----------------------------------------------------
    Group Management
---------------------------------------------------- */
function GroupManagement({
  loading,
  error,
  groups,
  createGroup,
  deleteGroup,
  newGroupName,
  newGroupDesc,
  setNewGroupName,
  setNewGroupDesc,
}: any) {
  return (
    <div className="space-y-6">
      {/* 그룹 생성 */}
      <Card className="p-6 border border-[#E8E4D9] shadow-sm rounded-xl">
        <CardTitle className="text-[#67594C] flex items-center gap-2 mb-4">
          <Layers className="w-5 h-5" />
          그룹 추가
        </CardTitle>

        <div className="space-y-3">
          <input
            placeholder="그룹명"
            value={newGroupName}
            onChange={(e) => setNewGroupName(e.target.value)}
            className="border border-[#DCD7CC] rounded-lg px-3 py-2 w-full bg-[#FAF9F6]"
          />
          <input
            placeholder="설명"
            value={newGroupDesc}
            onChange={(e) => setNewGroupDesc(e.target.value)}
            className="border border-[#DCD7CC] rounded-lg px-3 py-2 w-full bg-[#FAF9F6]"
          />

          <Button onClick={createGroup} className="w-full bg-[#67594C] hover:bg-[#594C41]">
            <Plus className="w-4 h-4 mr-1" /> 그룹 추가하기
          </Button>
        </div>
      </Card>

      {/* 그룹 리스트 */}
      {loading ? (
        <div className="text-center py-10 text-gray-500">불러오는 중...</div>
      ) : error ? (
        <div className="text-center py-10 text-red-500">{error}</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {groups.map((g: any) => (
            <Card
              key={g.groupId}
              className="p-5 flex justify-between items-start border border-[#E8E4D9] rounded-xl shadow-sm bg-white"
            >
              <div>
                <CardTitle className="text-[#67594C] text-lg">{g.groupName}</CardTitle>
                <CardDescription className="text-gray-600">{g.groupDescription}</CardDescription>
              </div>

              <Button variant="destructive" onClick={() => deleteGroup(g.groupId)}>
                <Trash2 className="w-4 h-4" />
              </Button>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

/* ----------------------------------------------------
    Notice Write Tab (관리자 공지 작성)
---------------------------------------------------- */
function NoticeWriteTab({ groups, event }) {
  const [postType, setPostType] = useState<"TEXT" | "VOTE">("TEXT");
  const [content, setContent] = useState("");
  const [voteTitle, setVoteTitle] = useState("");
  const [voteOption1, setVoteOption1] = useState("");
  const [voteOption2, setVoteOption2] = useState("");
  const [selectedGroups, setSelectedGroups] = useState<number[]>([]);
  const API_URL = import.meta.env.VITE_API_URL;

  const toggleGroup = (groupNo: number) => {
    setSelectedGroups((prev) =>
      prev.includes(groupNo)
        ? prev.filter((id) => id !== groupNo)
        : [...prev, groupNo]
    );
  };

  const handleSubmit = async () => {
    if (!content.trim()) return alert("내용을 입력하세요.");
    if (selectedGroups.length === 0) return alert("공지 배포 그룹을 선택하세요.");

    const body = {
      type: postType,
      content,
      voteTitle: postType === "VOTE" ? voteTitle : null,
      voteContent:
        postType === "VOTE"
          ? [voteOption1, voteOption2].filter(Boolean).join("_")
          : null,
      groupNums: selectedGroups.join("_"),
    };

    try {
      const res = await apiFetch(`${API_URL}/api/v1/post/admin`, {
        method: "POST",
        body: JSON.stringify(body),
      });
      const data = await res.json();

      if (!data.isSuccess) return alert("공지 등록 실패");

      alert("공지 등록 완료!");
      setContent("");
      setVoteTitle("");
      setVoteOption1("");
      setVoteOption2("");
      setSelectedGroups([]);
      setPostType("TEXT");
    } catch (err) {
      console.error(err);
      alert("오류 발생");
    }
  };

  return (
    <Card className="p-6 bg-white rounded-xl border border-[#E8E4D9] shadow-sm">
      <CardTitle className="text-[#67594C] text-xl mb-4">공지 작성</CardTitle>

      {/* 타입 선택 */}
      <div className="flex gap-3 mb-4">
        <button
          onClick={() => setPostType("TEXT")}
          className={`px-3 py-2 rounded-lg border ${
            postType === "TEXT"
              ? "bg-[#67594C] text-white"
              : "bg-white text-gray-700 border-gray-300"
          }`}
        >
          일반 공지
        </button>
        <button
          onClick={() => setPostType("VOTE")}
          className={`px-3 py-2 rounded-lg border ${
            postType === "VOTE"
              ? "bg-[#67594C] text-white"
              : "bg-white text-gray-700 border-gray-300"
          }`}
        >
          투표 공지
        </button>
      </div>

      {/* 내용 */}
      <div className="space-y-2 mb-6">
        <label className="text-sm text-gray-600">내용</label>
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          className="w-full min-h-[130px] border border-[#DCD7CC] rounded-lg px-3 py-2 bg-[#FAF9F6]"
        />
      </div>

      {/* 투표 옵션 */}
      {postType === "VOTE" && (
        <div className="space-y-4 mb-6">
          <div className="space-y-1">
            <label className="text-sm text-gray-600">투표 질문</label>
            <input
              value={voteTitle}
              onChange={(e) => setVoteTitle(e.target.value)}
              className="w-full border border-[#DCD7CC] rounded-lg px-3 py-2"
            />
          </div>

          <div className="space-y-1">
            <label className="text-sm text-gray-600">옵션 1</label>
            <input
              value={voteOption1}
              onChange={(e) => setVoteOption1(e.target.value)}
              className="w-full border border-[#DCD7CC] rounded-lg px-3 py-2"
            />
          </div>

          <div className="space-y-1">
            <label className="text-sm text-gray-600">옵션 2</label>
            <input
              value={voteOption2}
              onChange={(e) => setVoteOption2(e.target.value)}
              className="w-full border border-[#DCD7CC] rounded-lg px-3 py-2"
            />
          </div>
        </div>
      )}

      {/* 그룹 선택 */}
      <div className="mb-6">
        <p className="text-sm text-gray-600 mb-2">공지 배포 그룹 선택</p>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {groups.map((g) => (
            <button
              key={g.groupId}
              onClick={() => toggleGroup(g.groupNo)}
              className={`border rounded-lg p-3 text-left ${
                selectedGroups.includes(g.groupNo)
                  ? "bg-[#67594C] text-white border-[#67594C]"
                  : "bg-white border-gray-300 text-gray-800"
              }`}
            >
              <p className="text-sm font-medium">{g.groupName}</p>
              <p className="text-xs text-gray-500">{g.groupDescription}</p>
            </button>
          ))}
        </div>
      </div>

      {/* 등록 */}
      <div className="flex justify-end">
        <Button
          onClick={handleSubmit}
          className="bg-[#67594C] hover:bg-[#594C41] text-white px-6"
        >
          공지 등록
        </Button>
      </div>
    </Card>
  );
}

/* ----------------------------------------------------
    Edit Event Modal
---------------------------------------------------- */
function EditEventModal({ open, onOpenChange, event, reloadEvent }: any) {
  const [title, setTitle] = useState(event.title);
  const [description, setDescription] = useState(event.description);
  const [startAt, setStartAt] = useState(new Date(event.startDate));
  const [endAt, setEndAt] = useState(new Date(event.endDate));

  async function handleSave() {
    try {
      const body = {
        eventId: event.id,
        title,
        description,
        startAt,
        endAt,
      };

      const res = await apiFetch(`${API_URL}/api/v1/events/admin`, {
        method: "PATCH",
        body: JSON.stringify(body),
      });

      const data = await res.json();
      if (!data.isSuccess) {
        alert("이벤트 수정 실패");
        return;
      }

      alert("수정 완료!");
      onOpenChange(false);
      await reloadEvent(); 
    } catch {
      alert("수정 중 오류 발생");
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-white border border-[#E8E4D9] rounded-xl max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-[#67594C] text-xl font-semibold">
            이벤트 정보 수정
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 mt-4">
          <div className="space-y-1">
            <label className="text-sm text-gray-600">이벤트 이름</label>
            <input
              className="w-full border border-[#DCD7CC] rounded-lg px-3 py-2 bg-[#FAF9F6]"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          <div className="space-y-1">
            <label className="text-sm text-gray-600">설명</label>
            <textarea
              className="w-full border border-[#DCD7CC] rounded-lg px-3 py-2 bg-[#FAF9F6]"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          <div className="flex gap-3">
            <div className="flex-1">
              <label className="text-sm text-gray-600">시작일</label>
              <input
                type="date"
                className="w-full border border-[#DCD7CC] rounded-lg px-3 py-2 bg-[#FAF9F6]"
                value={format(startAt, "yyyy-MM-dd")}
                onChange={(e) => setStartAt(new Date(e.target.value))}
              />
            </div>

            <div className="flex-1">
              <label className="text-sm text-gray-600">종료일</label>
              <input
                type="date"
                className="w-full border border-[#DCD7CC] rounded-lg px-3 py-2 bg-[#FAF9F6]"
                value={format(endAt, "yyyy-MM-dd")}
                onChange={(e) => setEndAt(new Date(e.target.value))}
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-2 mt-6">
          <Button variant="outline" className="text-gray-500 border-[#DCD7CC]" onClick={() => onOpenChange(false)}>취소</Button>
          <Button className="bg-[#67594C] hover:bg-[#594C41]" onClick={handleSave}>저장하기</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
