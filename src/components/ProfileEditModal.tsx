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

  useEffect(() => {
    if (open && user) {
      setNickname(user.nickname ?? "");
    }
  }, [open, user]);

  if (!open || !user) return null;


  const requestPresignedUrl = async (file: File) => {
    const res = await apiFetch(
      `${API_URL}/api/v1/member/members/presigned-url`,
      {
        method: "POST",
        body: JSON.stringify({
          contentType: file.type,
          contentLength: file.size,
        }),
      }
    );

    const json = await res.json();
    if (!json.isSuccess) throw new Error("Presigned URL 발급 실패");

    return {
      url: json.result.url,
      key: json.result.key,
    };
  };


  const confirmProfileImage = async (
    key: string,
    file: File
  ) => {
    const res = await apiFetch(
      `${API_URL}/api/v1/member/members/confirm`,
      {
        method: "POST",
        body: JSON.stringify({
          key,
          contentType: file.type,
          size: file.size,
        }),
      }
    );

    const json = await res.json();
    if (!json.isSuccess) {
      throw new Error("프로필 반영 실패");
    }

    return json.result; // imageUrl
  };



  const handleNicknameUpdate = async () => {
    if (!nickname.trim()) {
      alert("닉네임을 입력해주세요.");
      return;
    }

    const res = await apiFetch(
      `${API_URL}/api/v1/member/members/nickname?nickname=${encodeURIComponent(nickname)}`,
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

  const handleUploadImage = async () => {
    if (!file) return alert("변경할 이미지를 선택해주세요.");

    if (!file.type.startsWith("image/")) {
      alert("이미지 파일만 업로드할 수 있습니다.");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert("이미지는 5MB 이하만 업로드 가능합니다.");
      return;
    }

    setLoading(true);

    try {
      // 1. presigned url
      const { url, key } = await requestPresignedUrl(file);

      // 2. S3 업로드
      await uploadToS3(url, file);

      // 3. confirm
      const imageUrl = await confirmProfileImage(key, file);

      // 4. 전역 상태 반영
      setUser(prev => ({
        ...(prev || {}),
        profileImageUrl: imageUrl,
      }));

      alert("프로필 이미지가 변경되었습니다.");
      setFile(null);

    } catch (e) {
      console.error(e);
      alert("프로필 이미지 업로드 중 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  };


  // 프로필 이미지 삭제
  const handleDeleteImage = async () => {
    const res = await apiFetch(
      `${API_URL}/api/v1/member/members`,
      { method: "DELETE" }
    );

    const json = await res.json();
    if (!json.isSuccess) {
      alert(json.message ?? "이미지 삭제 실패");
      return;
    }

    setUser(prev => ({
      ...(prev || {}),
      profileImageUrl: null,
    }));

    alert("프로필 이미지가 삭제되었습니다.");
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
