/* =============================================================
 * FinEdu — 친구 프로필 (`/friend.html?id=N`)
 * ============================================================= */

import { api } from "./api.js";
import { renderMascotInto } from "./mascot.js";
import { sfx } from "./sfx.js";

const $ = (s) => document.querySelector(s);
const params = new URLSearchParams(location.search);
const id = Number(params.get("id"));

async function init() {
  if (!id) {
    document.body.innerHTML = `<main class="container" style="padding:80px 0;"><h1>잘못된 주소예요.</h1></main>`;
    return;
  }
  const me = await api.get("/auth/me.php");
  if (!me.ok || !me.data?.user) {
    window.location.replace("/login.html");
    return;
  }

  const res = await api.get(`/friends/profile.php?id=${id}`);
  if (!res.ok) {
    document.body.innerHTML = `<main class="container" style="padding:80px 0; text-align:center;"><h1>${res.error}</h1><p><a href="/friends.html">친구 목록으로 돌아가기</a></p></main>`;
    return;
  }
  render(res.data);
}

function render({ user, equipped, items }) {
  $("#profile-name").textContent = user.display_name;
  $("#profile-handle").textContent = "@" + user.username;
  $("#profile-xp").textContent  = user.xp.toLocaleString("ko-KR");
  $("#profile-streak").textContent = "D-" + user.streak_days;
  $("#profile-joined").textContent = (user.joined_at ?? "").slice(0, 10);

  renderMascotInto($("#profile-mascot"), { equipped, items, size: 320 });

  if (user.is_self) {
    $("#profile-remove")?.setAttribute("hidden", "");
    $("#profile-self-note")?.removeAttribute("hidden");
  }

  $("#profile-remove")?.addEventListener("click", async () => {
    if (!confirm("정말 친구를 끊을까요?")) return;
    const res = await api.post("/friends/remove.php", { friend_id: user.id });
    if (!res.ok) {
      if (window.toast) window.toast(res.error || "실패", { variant: "danger" });
      sfx.wrong();
      return;
    }
    if (window.toast) window.toast("친구를 끊었어요.");
    window.location.assign("/friends.html");
  });
}

init();
