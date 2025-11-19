import { useEffect, useState } from "react";
import { apiFetch } from "../utils/apiFetch";
import { useApp } from "../contexts/AppContext";

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

    console.log("=== [UPLOAD START] ===");
    console.log("file:", file);
    console.log("contentType:", file.type);
    console.log("contentLength:", file.size);

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
      console.log("Presigned JSON:", presignedJson);

      if (!presignedJson.isSuccess) {
        alert("Presigned URL 발급 실패");
        return;
      }

      const { url, key } = presignedJson.result;

      // S3 PUT 업로드
      const uploadResponse = await fetch(url, {
        method: "PUT",
        headers: { "Content-Type": file.type },
        body: file,
      });

      if (!uploadResponse.ok) {
        console.error("S3 업로드 실패:", uploadResponse);
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
      console.log("Confirm JSON:", confirmJson);

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
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white w-96 max-w-[90%] p-6 rounded-2xl shadow-lg">
        <h2 className="text-xl font-semibold mb-4" style={{ color: "#67594C" }}>
          프로필 수정
        </h2>

        {/* 닉네임 */}
        <div className="mb-5">
          <label className="text-sm text-gray-600 mb-1 block">닉네임</label>
          <input
            value={nickname}
            onChange={(e) => setNickname(e.target.value)}
            className="w-full border rounded-lg px-3 py-2"
          />

          <button
            onClick={handleNicknameUpdate}
            className="mt-2 w-full bg-[#67594C] text-white py-2 rounded-lg"
          >
            닉네임 변경
          </button>
        </div>

        {/* 프로필 이미지 */}
        <div className="mb-5">
          <label className="text-sm text-gray-600 mb-2 block">프로필 이미지</label>

          <input
            type="file"
            accept="image/*"
            className="mb-3"
            onChange={(e) => setFile(e.target.files?.[0] ?? null)}
          />

          <button
            onClick={handleUploadImage}
            className="w-full bg-[#67594C] text-white py-2 rounded-lg mb-2"
            disabled={loading}
          >
            {loading ? "업로드 중..." : "이미지 변경"}
          </button>

          <button
            onClick={handleDeleteImage}
            className="w-full border border-red-400 text-red-500 py-2 rounded-lg"
          >
            이미지 삭제
          </button>
        </div>

        <button
          onClick={onClose}
          className="w-full mt-4 bg-gray-200 py-2 rounded-lg hover:bg-gray-300"
        >
          닫기
        </button>
      </div>
    </div>
  );
}
