import { useEffect, useState } from "react";
import { apiFetch } from "../utils/apiFetch";
import { useApp } from "../contexts/AppContext";
import { X } from "lucide-react";

type ProfileEditModalProps = {
  open: boolean;
  onClose: () => void;
};

export default function ProfileEditModal({ open, onClose }: ProfileEditModalProps) {
  const { user, setUser } = useApp();
  const API_URL = import.meta.env.VITE_API_URL;

  const [nickname, setNickname] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  // 모달 열릴 때 닉네임 초기화
  useEffect(() => {
    if (open && user) {
      setNickname(user.nickname ?? "");
    }
  }, [open, user]);

  if (!open || !user) return null;

  // 닉네임 변경
  const handleNicknameUpdate = async () => {
    if (!nickname.trim()) {
      alert("닉네임을 입력해주세요.");
      return;
    }

    const res = await apiFetch(
      `${API_URL}/api/v1/member/nickname?nickname=${encodeURIComponent(nickname)}`,
      { method: "PATCH" }
    );
    const json = await res.json();

    if (!json.isSuccess) {
      alert(json.message ?? "닉네임 변경에 실패했습니다.");
      return;
    }

    setUser(prev => ({ ...(prev || {}), nickname: json.result }));
    alert("닉네임이 변경되었습니다.");
  };

  // 프로필 이미지 업로드
  const handleUploadImage = async () => {
    if (!file) return alert("변경할 이미지를 선택해주세요.");

    setLoading(true);

    try {
      // Presigned URL 요청
      const presigned = await apiFetch(
        `${API_URL}/api/v1/member/profile-image/presigned-url`,
        {
          method: "POST",
          body: JSON.stringify({
            contentType: file.type,
            contentLength: file.size,
          }),
        }
      );

      const presignedJson = await presigned.json();

      if (!presignedJson.isSuccess) {
        alert("Presigned URL 발급 실패");
        return;
      }

      const { url, key } = presignedJson.result;

      // S3 업로드
      const uploadResponse = await fetch(url, {
        method: "PUT",
        headers: { "Content-Type": file.type },
        body: file,
      });

      if (!uploadResponse.ok) {
        alert("S3 업로드 실패");
        return;
      }

      // 업로드 확정
      const confirm = await apiFetch(
        `${API_URL}/api/v1/member/profile-image/confirm`,
        {
          method: "POST",
          body: JSON.stringify({
            key,
            contentType: file.type,
            size: file.size,
          }),
        }
      );

      const confirmJson = await confirm.json();

      if (!confirmJson.isSuccess) {
        alert("프로필 반영에 실패했습니다.");
        return;
      }

      setUser(prev => ({
        ...(prev || {}),
        profileImageUrl: confirmJson.result,
      }));

      alert("프로필 이미지가 변경되었습니다.");
      setFile(null);

    } catch (err) {
      console.error("예외 발생:", err);
    } finally {
      setLoading(false);
    }
  };

  // 프로필 이미지 삭제
  const handleDeleteImage = async () => {
    try {
      const res = await apiFetch(`${API_URL}/api/v1/member/profile-image`, {
        method: "DELETE",
      });

      const json = await res.json();
      if (!json.isSuccess) {
        alert(json.message ?? "프로필 이미지 삭제 실패");
        return;
      }

      setUser(prev => ({
        ...(prev || {}),
        profileImageUrl: null,
      }));

      alert("프로필 이미지가 삭제되었습니다.");
    } catch (err) {
      console.error("삭제 중 오류:", err);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center">

      <div className="bg-white w-[420px] max-w-[90%] p-8 rounded-3xl shadow-xl border border-gray-100 relative">

        {/* 닫기 버튼 */}
        <button
          onClick={onClose}
          className="absolute right-5 top-5 p-1 hover:bg-gray-100 rounded-full transition"
        >
          <X size={20} className="text-gray-600" />
        </button>

        <h2 className="text-[22px] font-semibold mb-6 text-[#67594C]">
          프로필 수정
        </h2>

        {/* 닉네임 */}
        <div className="mb-8">
          <label className="block text-sm text-gray-600 mb-2">닉네임</label>

          <input
            value={nickname}
            onChange={(e) => setNickname(e.target.value)}
            className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm focus:ring-2 ring-[#67594C] outline-none"
          />

          <button
            onClick={handleNicknameUpdate}
            className="mt-3 w-full bg-[#67594C] text-white py-3 rounded-xl text-sm hover:bg-[#564a3f] transition"
          >
            닉네임 변경
          </button>
        </div>

        {/* 프로필 이미지 */}
        <div className="mb-8">
          <label className="block text-sm text-gray-600 mb-2">프로필 이미지</label>

          <input
            type="file"
            accept="image/*"
            className="mb-4 text-sm"
            onChange={(e) => setFile(e.target.files?.[0] ?? null)}
          />

          <button
            onClick={handleUploadImage}
            disabled={loading}
            className="w-full bg-[#67594C] text-white py-3 rounded-xl text-sm hover:bg-[#54473C] transition mb-2 disabled:opacity-60"
          >
            {loading ? "업로드 중..." : "이미지 업로드"}
          </button>

          <button
            onClick={handleDeleteImage}
            className="w-full border border-red-400 text-red-500 py-3 rounded-xl text-sm hover:bg-red-50 transition"
          >
            이미지 삭제
          </button>
        </div>

      </div>
    </div>
  );
}
