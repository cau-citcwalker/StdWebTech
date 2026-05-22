/* =============================================================
 * FinEdu — API 클라이언트
 *
 * 페이지 전역에서 사용하는 fetch 래퍼. 세션 쿠키를 포함해서
 * 우리 PHP 백엔드로 JSON 요청을 보낸다.
 * ============================================================= */

const API_BASE = "/api";

/**
 * JSON 요청 헬퍼. 응답이 2xx 가 아니면 throw.
 *  성공:  { ok: true,  data }
 *  실패:  { ok: false, error, status }
 */
async function apiRequest(path, { method = "GET", body, headers } = {}) {
  const opts = {
    method,
    headers: {
      Accept: "application/json",
      ...(body ? { "Content-Type": "application/json" } : {}),
      ...headers,
    },
    credentials: "same-origin",
  };
  if (body !== undefined) opts.body = JSON.stringify(body);

  let res;
  try {
    res = await fetch(`${API_BASE}${path}`, opts);
  } catch (networkErr) {
    return { ok: false, error: "네트워크 오류로 연결하지 못했어요.", status: 0 };
  }

  let payload = null;
  try {
    payload = await res.json();
  } catch (_) {
    /* 빈 응답 허용 */
  }

  if (!res.ok) {
    return {
      ok: false,
      status: res.status,
      error: payload?.error || `요청 실패 (HTTP ${res.status})`,
    };
  }
  return { ok: true, data: payload?.data ?? payload ?? null };
}

export const api = {
  get:  (path) => apiRequest(path),
  post: (path, body) => apiRequest(path, { method: "POST", body }),
  put:  (path, body) => apiRequest(path, { method: "PUT", body }),
  del:  (path) => apiRequest(path, { method: "DELETE" }),
};
