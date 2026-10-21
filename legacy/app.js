const STORAGE_KEY = "it-support-script-data-v1";
const AI_CONFIG_KEY = "it-support-ai-config-v1";
const BACKUP_KEY = "it-support-backups-v1";
const MAX_BACKUPS = 12;

const categories = [
  { id: "cks", name: "Chữ ký số", icon: "🔑", color: "#1c3f9f" },
  { id: "hddt", name: "Hóa đơn điện tử", icon: "▦", color: "#0f9d91" },
  { id: "bhxh", name: "Bảo hiểm xã hội", icon: "♜", color: "#7533e6" },
  { id: "canho", name: "Căn hộ cho thuê", icon: "🏢", color: "#0ea5e9" },
  { id: "dautu", name: "Môi giới Đầu tư", icon: "📈", color: "#16a34a" },
];

const priorityLabels = [
  { id: "common", name: "Thường gặp", color: "#2563eb" },
  { id: "urgent", name: "Khẩn cấp", color: "#dc2626" },
  { id: "remote", name: "Cần remote", color: "#0f766e" },
  { id: "escalate", name: "Cần leo thang", color: "#b45309" },
];

const seedIssues = [
  {
    id: crypto.randomUUID(),
    categoryId: "cks",
    name: "Máy không nhận USB Token",
    summary: "Driver / USB không nhận",
    steps: [
      "Rút Token ra, cắm vào cổng USB khác",
      "Kiểm tra đèn LED trên token có sáng không",
      "Mở Device Manager xem có dấu chấm than màu vàng không",
      "Gỡ và cài lại driver Token đúng nhà cung cấp",
      "Khởi động lại máy, mở lại phần mềm ký và thử ký lại",
    ],
    script:
      "Chào anh/chị! Em hỗ trợ lỗi máy không nhận Token nhé 🙏\n\n✅ Bước 1: Rút Token ra, cắm lại cổng USB KHÁC\n✅ Bước 2: Kiểm tra đèn LED trên token có sáng không?\n✅ Bước 3: Vào Start -> Device Manager -> xem có dấu ! vàng không\n✅ Bước 4: Nếu vẫn chưa nhận, em sẽ gửi link driver để anh/chị cài lại",
    escalation:
      "Token cắm cổng khác vẫn không nhận, LED không sáng hoặc Device Manager không xuất hiện thiết bị.",
    image: "",
  },
  {
    id: crypto.randomUUID(),
    categoryId: "cks",
    name: "Lỗi Java / Plugin ký số",
    summary: "Không ký được trên HTKK",
    steps: [
      "Kiểm tra phiên bản Java đang cài",
      "Gỡ các bản Java cũ hoặc trùng phiên bản",
      "Cài Java 8 32-bit cho HTKK nếu máy yêu cầu",
      "Thêm trang web thuế vào Security Exception Site List",
      "Mở lại trình duyệt hoặc phần mềm và ký lại",
    ],
    script:
      "Anh/chị kiểm tra giúp em phần Java/Plugin ký số nhé.\n\n✅ Gỡ các bản Java cũ\n✅ Cài lại Java đúng phiên bản\n✅ Thêm trang web vào danh sách bảo mật Java\n✅ Mở lại phần mềm và ký lại hồ sơ",
    escalation: "Đã cài lại Java đúng phiên bản nhưng plugin vẫn không tải hoặc trình duyệt báo chặn ký.",
    image: "",
  },
  {
    id: crypto.randomUUID(),
    categoryId: "cks",
    name: "Chứng thư số hết hạn",
    summary: "Cảnh báo Certificate Expired",
    steps: [
      "Mở phần mềm quản lý Token để xem hạn chứng thư",
      "Kiểm tra ngày giờ hệ thống trên máy tính",
      "Nếu chứng thư đã hết hạn, chuyển quy trình gia hạn",
      "Nếu chưa hết hạn, cập nhật lại driver hoặc chứng thư",
    ],
    script:
      "Anh/chị mở phần mềm quản lý Token giúp em để kiểm tra hạn chứng thư.\nNếu chứng thư đã hết hạn, bên em sẽ hỗ trợ quy trình gia hạn để ký tiếp hồ sơ.",
    escalation: "Khách cần ký gấp nhưng chứng thư hết hạn hoặc thông tin chứng thư sai với giấy phép kinh doanh.",
    image: "",
  },
  {
    id: crypto.randomUUID(),
    categoryId: "cks",
    name: "Quên PIN / Token bị khóa",
    summary: "Nhập sai PIN, token bị lock",
    steps: [
      "Hỏi khách đã nhập sai PIN bao nhiêu lần",
      "Kiểm tra token còn mở phần mềm quản lý được không",
      "Nếu còn PUK, hướng dẫn đổi lại PIN",
      "Nếu khóa hoàn toàn, chuyển bộ phận xử lý Token",
    ],
    script:
      "Trường hợp Token bị khóa do nhập sai PIN nhiều lần, anh/chị không nhập tiếp giúp em để tránh khóa sâu hơn. Em sẽ kiểm tra tình trạng Token và hướng dẫn bước mở khóa phù hợp.",
    escalation: "Token bị khóa hoàn toàn, không có PUK hoặc khách không nhớ thông tin đăng ký.",
    image: "",
  },
  {
    id: crypto.randomUUID(),
    categoryId: "cks",
    name: "Lỗi ký trong MISA",
    summary: "Không ký hóa đơn trong MISA",
    steps: [
      "Kiểm tra Token đã nhận trong Windows chưa",
      "Mở MISA bằng quyền Administrator",
      "Kiểm tra cấu hình mẫu số/ký hiệu/chứng thư trong MISA",
      "Cập nhật MISA meInvoice plugin nếu có thông báo",
    ],
    script:
      "Anh/chị mở MISA bằng Run as administrator giúp em, sau đó kiểm tra phần thiết lập chữ ký số. Nếu Token đã nhận nhưng MISA chưa ký được, em sẽ kiểm tra tiếp plugin ký hóa đơn.",
    escalation: "Token ký được ở phần mềm khác nhưng riêng MISA báo lỗi cấu hình hoặc plugin.",
    image: "",
  },
  {
    id: crypto.randomUUID(),
    categoryId: "hddt",
    name: "Không đăng nhập được phần mềm HĐ",
    summary: "Quên mật khẩu / sai tài khoản",
    steps: [
      "Xác nhận đúng đường dẫn phần mềm hóa đơn",
      "Kiểm tra tên đăng nhập, mã số thuế và email khôi phục",
      "Hướng dẫn đặt lại mật khẩu",
      "Kiểm tra tài khoản có bị khóa do nhập sai nhiều lần không",
    ],
    script:
      "Anh/chị gửi giúp em mã số thuế và email đăng nhập phần mềm hóa đơn. Em kiểm tra tài khoản và hướng dẫn đặt lại mật khẩu nếu cần.",
    escalation: "Tài khoản bị khóa, mất email khôi phục hoặc không có quyền quản trị.",
    image: "",
  },
  {
    id: crypto.randomUUID(),
    categoryId: "hddt",
    name: "Gửi hóa đơn thất bại",
    summary: "HĐ tạo xong nhưng không gửi được email",
    steps: [
      "Kiểm tra email người nhận có đúng định dạng không",
      "Kiểm tra cấu hình email gửi trong phần mềm",
      "Thử gửi lại một hóa đơn mẫu",
      "Nếu lỗi SMTP, đổi sang email gửi mặc định của hệ thống",
    ],
    script:
      "Hóa đơn đã lập nhưng gửi email chưa thành công. Anh/chị kiểm tra lại email người nhận giúp em, sau đó em sẽ hỗ trợ gửi lại từ hệ thống.",
    escalation: "Gửi lại nhiều lần không được hoặc hệ thống báo lỗi SMTP/tài khoản email gửi.",
    image: "",
  },
  {
    id: crypto.randomUUID(),
    categoryId: "hddt",
    name: "Hủy / điều chỉnh hóa đơn",
    summary: "HĐ sai thông tin cần hủy hoặc điều chỉnh",
    steps: [
      "Xác định hóa đơn đã gửi cơ quan thuế hay chưa",
      "Kiểm tra trạng thái mã của cơ quan thuế",
      "Chọn nghiệp vụ thay thế, điều chỉnh hoặc hủy theo tình huống",
      "Lập biên bản nếu quy trình khách yêu cầu",
    ],
    script:
      "Anh/chị cho em xin số hóa đơn và tình trạng đã cấp mã cơ quan thuế chưa. Em sẽ xác định giúp trường hợp này nên thay thế, điều chỉnh hay hủy.",
    escalation: "Hóa đơn đã kê khai, sai thông tin trọng yếu hoặc khách chưa rõ nghiệp vụ kế toán.",
    image: "",
  },
  {
    id: crypto.randomUUID(),
    categoryId: "hddt",
    name: "Lỗi ký số trên hóa đơn",
    summary: "Không ký được HĐ điện tử",
    steps: [
      "Kiểm tra Token đã nhận trong máy chưa",
      "Kiểm tra chứng thư số còn hạn và đúng MST",
      "Cài lại plugin ký của phần mềm hóa đơn",
      "Thử ký lại trên một hóa đơn nháp",
    ],
    script:
      "Anh/chị kiểm tra giúp em Token đã cắm vào máy và chứng thư còn hạn. Em sẽ hỗ trợ cài lại plugin ký hóa đơn nếu phần mềm vẫn báo lỗi.",
    escalation: "Chứng thư đúng nhưng hệ thống hóa đơn không nhận hoặc báo sai MST khi ký.",
    image: "",
  },
  {
    id: crypto.randomUUID(),
    categoryId: "bhxh",
    name: "Không vào được cổng BHXH",
    summary: "Lỗi kết nối / trang không tải được",
    steps: [
      "Kiểm tra mạng và thử mở bằng trình duyệt khác",
      "Xóa cache trình duyệt",
      "Kiểm tra trang BHXH có đang bảo trì không",
      "Thử đổi DNS hoặc dùng mạng khác",
    ],
    script:
      "Anh/chị thử mở cổng BHXH bằng trình duyệt khác giúp em. Nếu vẫn không vào được, em sẽ kiểm tra tiếp tình trạng mạng hoặc trang BHXH đang bảo trì.",
    escalation: "Nhiều máy/mạng đều không vào được hoặc cổng BHXH có thông báo bảo trì.",
    image: "",
  },
  {
    id: crypto.randomUUID(),
    categoryId: "bhxh",
    name: "Không ký số được hồ sơ BHXH",
    summary: "Lỗi ký số trên cổng dịch vụ công",
    steps: [
      "Kiểm tra Token đã nhận và chứng thư còn hạn",
      "Mở trình ký BHXH với quyền Administrator",
      "Cài lại extension hoặc plugin ký",
      "Thử ký hồ sơ khác để xác định lỗi theo hồ sơ hay hệ thống",
    ],
    script:
      "Anh/chị cắm Token và mở lại trình ký BHXH giúp em. Nếu hệ thống vẫn báo lỗi ký số, em sẽ hỗ trợ cài lại plugin ký và kiểm tra chứng thư.",
    escalation: "Token ký được nơi khác nhưng riêng BHXH không ký được, hoặc lỗi phát sinh sau khi cập nhật cổng.",
    image: "",
  },
  {
    id: crypto.randomUUID(),
    categoryId: "bhxh",
    name: "Nộp hồ sơ thất bại",
    summary: "Ký xong nhưng nộp không được",
    steps: [
      "Kiểm tra hồ sơ đã ký thành công chưa",
      "Xem thông báo lỗi trả về từ cổng BHXH",
      "Kiểm tra định dạng file và dung lượng hồ sơ",
      "Nộp lại sau 5-10 phút nếu cổng quá tải",
    ],
    script:
      "Hồ sơ đã ký nhưng nộp chưa thành công. Anh/chị chụp giúp em thông báo lỗi sau khi bấm nộp để em xác định do file hồ sơ hay do cổng BHXH.",
    escalation: "Cổng trả mã lỗi không rõ, nộp lại nhiều lần thất bại hoặc hồ sơ đến hạn gấp.",
    image: "",
  },
  {
    id: crypto.randomUUID(),
    categoryId: "bhxh",
    name: "Lỗi tài khoản / mật khẩu BHXH",
    summary: "Không đăng nhập được cổng BHXH",
    steps: [
      "Xác nhận mã đơn vị và tài khoản đăng nhập",
      "Kiểm tra caps lock, bộ gõ và mật khẩu gần nhất",
      "Hướng dẫn lấy lại mật khẩu qua email/số điện thoại đăng ký",
      "Kiểm tra tài khoản có bị khóa không",
    ],
    script:
      "Anh/chị gửi giúp em mã đơn vị BHXH và email/số điện thoại đăng ký tài khoản. Em sẽ kiểm tra hướng khôi phục mật khẩu phù hợp.",
    escalation: "Mất email/số điện thoại khôi phục hoặc tài khoản bị khóa cần làm việc với cơ quan BHXH.",
    image: "",
  },
];

let state = {
  activeCategoryId: "cks",
  activeIssueId: "",
  issues: [],
  editingImage: "",
  checklistState: {},
  viewCounts: {},
};

const $ = (selector) => document.querySelector(selector);
const categoryTabs = $("#categoryTabs");
const categoryTitle = $("#categoryTitle");
const issueList = $("#issueList");
const searchInput = $("#searchInput");
const emptyState = $("#emptyState");
const issueDetail = $("#issueDetail");
const toast = $("#toast");
const filterCategory = $("#filterCategory");
const filterPriority = $("#filterPriority");
let firebaseApp = null;
let firebaseAuth = null;
let firestoreDb = null;
let currentUser = null;
let cloudSaveTimer = null;
let appStarted = false;
let mobileFocusMode = false;

function getSerializableState() {
  return {
    activeCategoryId: state.activeCategoryId,
    activeIssueId: state.activeIssueId,
    issues: state.issues,
    checklistState: state.checklistState || {},
    viewCounts: state.viewCounts || {},
  };
}

function applySerializedState(data) {
  state.activeCategoryId = data?.activeCategoryId || "cks";
  state.activeIssueId = data?.activeIssueId || "";
  state.issues = Array.isArray(data?.issues) ? data.issues : seedIssues;
  state.checklistState = data?.checklistState || {};
  state.viewCounts = data?.viewCounts || {};
}

function getFirebaseSettings() {
  return window.APP_FIREBASE_CONFIG || {};
}

function normalizeEmail(email) {
  return String(email || "").trim().toLowerCase();
}

function isFirebaseConfigured() {
  const settings = getFirebaseSettings();
  const config = settings.firebaseConfig || {};
  return Boolean(
    settings.allowedEmail &&
      settings.allowedEmail !== "your-email@example.com" &&
      config.apiKey &&
      !String(config.apiKey).startsWith("YOUR_") &&
      config.projectId &&
      !String(config.projectId).startsWith("YOUR_")
  );
}

function showLoginScreen(message = "") {
  document.body.classList.add("auth-locked");
  document.body.classList.remove("auth-ready");
  $("#firebaseConfigAlert").textContent = message;
  $("#firebaseConfigAlert").classList.toggle("show", Boolean(message));
}

function showAppScreen() {
  document.body.classList.remove("auth-locked");
  document.body.classList.add("auth-ready");
}

function getCloudStateRef() {
  if (!firestoreDb || !currentUser) return null;
  return firestoreDb.collection("users").doc(currentUser.uid).collection("app").doc("main");
}

async function saveCloudState() {
  const ref = getCloudStateRef();
  if (!ref) return;
  await ref.set(
    {
      state: getSerializableState(),
      ownerEmail: currentUser.email,
      updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
    },
    { merge: true }
  );
}

function scheduleCloudSave() {
  if (!firestoreDb || !currentUser) return;
  window.clearTimeout(cloudSaveTimer);
  cloudSaveTimer = window.setTimeout(() => {
    saveCloudState().catch(() => showToast("Không đồng bộ được Firebase"));
  }, 500);
}

async function loadCloudState() {
  const ref = getCloudStateRef();
  if (!ref) return;
  const snapshot = await ref.get();
  if (snapshot.exists && snapshot.data()?.state) {
    applySerializedState(snapshot.data().state);
    saveState();
    return;
  }

  loadState();
  await saveCloudState();
}

function initFirebase() {
  if (window.location.protocol === "file:") {
    showLoginScreen("Firebase không hỗ trợ đăng nhập khi mở trực tiếp bằng file://. Hãy chạy qua http://localhost hoặc deploy Firebase Hosting.");
    return false;
  }
  if (!window.firebase) {
    showLoginScreen("Không tải được Firebase SDK. Hãy kiểm tra kết nối mạng hoặc chạy app qua Firebase Hosting.");
    return false;
  }
  if (!isFirebaseConfigured()) {
    showLoginScreen("Bạn cần dán Firebase config và email được phép vào file firebase-config.js.");
    return false;
  }
  if (!firebaseApp) {
    firebaseApp = firebase.initializeApp(getFirebaseSettings().firebaseConfig);
    firebaseAuth = firebase.auth();
    firestoreDb = firebase.firestore();
  }
  return true;
}

async function handleLogin(event) {
  event.preventDefault();
  if (!firebaseAuth) {
    showLoginScreen("Firebase chưa sẵn sàng. Không mở trực tiếp file index.html; hãy chạy bằng START_APP.bat hoặc qua Firebase Hosting.");
    return;
  }
  const email = normalizeEmail($("#loginEmailInput").value);
  const password = $("#loginPasswordInput").value;
  const allowedEmail = normalizeEmail(getFirebaseSettings().allowedEmail);
  if (email !== allowedEmail) {
    showLoginScreen(`Email này không được phép truy cập phần mềm. Email được phép: ${allowedEmail}`);
    return;
  }
  try {
    await firebaseAuth.signInWithEmailAndPassword(email, password);
  } catch (error) {
    showLoginScreen(getFirebaseLoginErrorMessage(error));
  }
}

function getFirebaseLoginErrorMessage(error) {
  const code = error?.code || "unknown";
  const messages = {
    "auth/invalid-credential":
      "Không đăng nhập được: email hoặc mật khẩu Firebase không đúng. Hãy kiểm tra Authentication > Users đã có user này chưa.",
    "auth/user-not-found":
      "Chưa có user này trong Firebase Authentication > Users. Hãy tạo user phongdepdanang@gmail.com trước.",
    "auth/wrong-password":
      "Mật khẩu không đúng. Đây là mật khẩu user Firebase, không nhất thiết là mật khẩu Gmail.",
    "auth/invalid-email": "Email không hợp lệ.",
    "auth/too-many-requests": "Firebase tạm khóa đăng nhập do thử sai nhiều lần. Chờ vài phút rồi thử lại.",
    "auth/network-request-failed": "Không kết nối được Firebase. Kiểm tra mạng hoặc chặn script/firewall.",
    "auth/api-key-not-valid": "Firebase API key không hợp lệ. Kiểm tra lại firebase-config.js.",
  };
  return `${messages[code] || "Đăng nhập không thành công. Kiểm tra Firebase Authentication."} (${code})`;
}

async function handleAuthUser(user) {
  const allowedEmail = normalizeEmail(getFirebaseSettings().allowedEmail);
  if (!user) {
    currentUser = null;
    showLoginScreen("");
    return;
  }
  if (normalizeEmail(user.email) !== allowedEmail) {
    await firebaseAuth.signOut();
    showLoginScreen(`Email này không được phép truy cập phần mềm. Email được phép: ${allowedEmail}`);
    return;
  }
  currentUser = user;
  await loadCloudState();
  if (!appStarted) {
    bindEvents();
    appStarted = true;
  }
  render();
  updateAiProviderStatus();
  createDailyBackupIfNeeded();
  showAppScreen();
}

function loadState() {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (!saved) {
    state.issues = seedIssues;
    state.activeIssueId = seedIssues[0].id;
    saveState();
    return;
  }

  try {
    const data = JSON.parse(saved);
    state = { ...state, ...data };
  } catch {
    state.issues = seedIssues;
    state.activeIssueId = seedIssues[0].id;
  }
}

function saveState() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(getSerializableState()));
  scheduleCloudSave();
}

function getBackups() {
  try {
    return JSON.parse(localStorage.getItem(BACKUP_KEY) || "[]");
  } catch {
    return [];
  }
}

function setBackups(backups) {
  localStorage.setItem(BACKUP_KEY, JSON.stringify(backups.slice(0, MAX_BACKUPS)));
}

function createBackup(reason = "Sao lưu thủ công", silent = false) {
  if (!state.issues.length) return null;
  const backup = {
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
    reason,
    data: {
      activeCategoryId: state.activeCategoryId,
      activeIssueId: state.activeIssueId,
      issues: state.issues,
      checklistState: state.checklistState || {},
      viewCounts: state.viewCounts || {},
    },
  };
  setBackups([backup, ...getBackups()]);
  renderBackupList();
  if (!silent) showToast("Đã tạo backup");
  return backup;
}

function createDailyBackupIfNeeded() {
  const backups = getBackups();
  const latestAuto = backups.find((backup) => backup.reason === "Sao lưu tự động hằng ngày");
  const oneDay = 24 * 60 * 60 * 1000;
  if (!latestAuto || Date.now() - new Date(latestAuto.createdAt).getTime() > oneDay) {
    createBackup("Sao lưu tự động hằng ngày", true);
  }
}

function formatBackupTime(value) {
  return new Intl.DateTimeFormat("vi-VN", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(new Date(value));
}

function downloadBackup(backup) {
  if (!backup) {
    showToast("Chưa có backup để tải");
    return;
  }
  const blob = new Blob([JSON.stringify(backup.data, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `backup-it-support-${backup.createdAt.slice(0, 10)}.json`;
  link.click();
  URL.revokeObjectURL(url);
}

function restoreBackup(id) {
  const backup = getBackups().find((item) => item.id === id);
  if (!backup) return;
  const ok = window.confirm(`Khôi phục dữ liệu từ bản backup lúc ${formatBackupTime(backup.createdAt)}? Dữ liệu hiện tại sẽ được sao lưu trước.`);
  if (!ok) return;
  createBackup("Trước khi khôi phục", true);
  state.activeCategoryId = backup.data.activeCategoryId || "cks";
  state.activeIssueId = backup.data.activeIssueId || "";
  state.issues = Array.isArray(backup.data.issues) ? backup.data.issues : [];
  state.checklistState = backup.data.checklistState || {};
  state.viewCounts = backup.data.viewCounts || {};
  saveState();
  $("#backupModal").close();
  render();
  showToast("Đã khôi phục backup");
}

function deleteBackup(id) {
  setBackups(getBackups().filter((backup) => backup.id !== id));
  renderBackupList();
  showToast("Đã xóa backup");
}

function renderBackupList() {
  const list = $("#backupList");
  if (!list) return;
  const backups = getBackups();
  if (!backups.length) {
    list.innerHTML = `<div class="no-results">Chưa có bản sao lưu nào.</div>`;
    return;
  }
  list.innerHTML = backups
    .map(
      (backup) => `
        <div class="backup-item">
          <div>
            <strong>${escapeHtml(backup.reason)}</strong>
            <span>${formatBackupTime(backup.createdAt)} · ${backup.data.issues?.length || 0} kịch bản</span>
          </div>
          <div class="backup-row-actions">
            <button class="secondary-btn" type="button" data-download-backup="${backup.id}">Tải</button>
            <button class="secondary-btn" type="button" data-restore-backup="${backup.id}">Khôi phục</button>
            <button class="icon-btn delete-btn" type="button" data-delete-backup="${backup.id}">×</button>
          </div>
        </div>
      `
    )
    .join("");
}

function renderStatsDashboard() {
  const total = state.issues.length;
  const urgent = state.issues.filter((issue) => issue.priorityLabels?.includes("urgent")).length;
  const escalate = state.issues.filter((issue) => issue.priorityLabels?.includes("escalate")).length;
  const remote = state.issues.filter((issue) => issue.priorityLabels?.includes("remote")).length;

  $("#statsSummary").innerHTML = [
    { label: "Tổng kịch bản", value: total, tone: "#2563eb" },
    { label: "Khẩn cấp", value: urgent, tone: "#dc2626" },
    { label: "Cần leo thang", value: escalate, tone: "#b45309" },
    { label: "Cần remote", value: remote, tone: "#0f766e" },
  ]
    .map(
      (item) => `
        <div class="stat-card" style="--stat-color:${item.tone}">
          <strong>${item.value}</strong>
          <span>${item.label}</span>
        </div>
      `
    )
    .join("");

  $("#statsByCategory").innerHTML = categories
    .map((category) => {
      const count = state.issues.filter((issue) => issue.categoryId === category.id).length;
      const percent = total ? Math.round((count / total) * 100) : 0;
      return `
        <div class="stat-row">
          <div>
            <strong>${category.icon} ${escapeHtml(category.name)}</strong>
            <span>${count} kịch bản</span>
          </div>
          <div class="stat-bar"><i style="width:${percent}%; background:${category.color}"></i></div>
        </div>
      `;
    })
    .join("");

  const topIssues = [...state.issues]
    .map((issue) => ({ issue, count: state.viewCounts?.[issue.id] || 0 }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  $("#statsTopIssues").innerHTML = topIssues.some((item) => item.count > 0)
    ? topIssues
        .map(({ issue, count }, index) => {
          const category = categories.find((item) => item.id === issue.categoryId);
          return `
            <button class="stat-row stat-clickable" type="button" data-stats-open="${issue.id}">
              <div>
                <strong>${index + 1}. ${escapeHtml(issue.name)}</strong>
                <span>${category?.icon || ""} ${escapeHtml(category?.name || "")}</span>
              </div>
              <em>${count} lượt mở</em>
            </button>
          `;
        })
        .join("")
    : `<div class="no-results">Chưa có dữ liệu lượt mở. Hãy mở vài kịch bản để dashboard ghi nhận.</div>`;
}

function getActiveCategory() {
  return categories.find((category) => category.id === state.activeCategoryId) || categories[0];
}

function getActiveIssue() {
  return state.issues.find((issue) => issue.id === state.activeIssueId);
}

function getIssueImages(issue) {
  if (!issue) return [];
  const images = Array.isArray(issue.images) ? issue.images.filter(Boolean) : [];
  if (images.length) return images;
  return issue.image ? [issue.image] : [];
}

function setIssueImages(issue, images) {
  const cleanImages = images.filter(Boolean);
  issue.images = cleanImages;
  issue.image = cleanImages[0] || "";
}

function normalizeSearchText(value) {
  return String(value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "d")
    .toLowerCase()
    .trim();
}

function recordIssueView(issueId) {
  if (!issueId) return;
  state.viewCounts = state.viewCounts || {};
  state.viewCounts[issueId] = (state.viewCounts[issueId] || 0) + 1;
  saveState();
}

function getAdvancedFilters() {
  return {
    category: filterCategory?.value || "current",
    priority: filterPriority?.value || "",
    remote: $("#filterRemote")?.checked || false,
    urgent: $("#filterUrgent")?.checked || false,
    hasNotes: $("#filterHasNotes")?.checked || false,
    noScript: $("#filterNoScript")?.checked || false,
    noImage: $("#filterNoImage")?.checked || false,
  };
}

function hasAdvancedFilters() {
  const filters = getAdvancedFilters();
  return (
    filters.category !== "current" ||
    Boolean(filters.priority) ||
    filters.remote ||
    filters.urgent ||
    filters.hasNotes ||
    filters.noScript ||
    filters.noImage
  );
}

function issueMatchesFilters(issue, filters, keyword) {
  if (filters.category !== "all" && filters.category !== "current" && issue.categoryId !== filters.category) {
    return false;
  }

  if (!keyword && filters.category === "current" && issue.categoryId !== state.activeCategoryId) {
    return false;
  }

  const issuePriorities = Array.isArray(issue.priorityLabels) ? issue.priorityLabels : [];
  if (filters.priority && !issuePriorities.includes(filters.priority)) return false;
  if (filters.remote && !issuePriorities.includes("remote")) return false;
  if (filters.urgent && !issuePriorities.includes("urgent")) return false;
  if (filters.hasNotes && !String(issue.internalNotes || "").trim()) return false;
  if (filters.noScript && String(issue.script || "").trim()) return false;
  if (filters.noImage && getIssueImages(issue).length) return false;

  return true;
}

function getFilteredIssues() {
  const keyword = normalizeSearchText(searchInput.value);
  const filters = getAdvancedFilters();
  return state.issues.filter((issue) => {
    if (!keyword && !hasAdvancedFilters()) return issue.categoryId === state.activeCategoryId;
    if (!issueMatchesFilters(issue, filters, keyword)) return false;
    if (!keyword) return true;
    const labels = getIssuePriorityLabels(issue).map((label) => label.name);
    const haystack = [
      issue.name,
      issue.summary,
      issue.script,
      issue.escalation,
      issue.internalNotes,
      ...(issue.steps || []),
      ...labels,
    ]
      .join(" ")
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/đ/g, "d")
      .replace(/Đ/g, "d")
      .toLowerCase();
    return haystack.includes(keyword);
  });
}

function renderTabs() {
  categoryTabs.innerHTML = categories
    .map((category) => {
      const active = category.id === state.activeCategoryId;
      const count = state.issues.filter((issue) => issue.categoryId === category.id).length;
      return `
        <button class="tab-btn ${active ? "active" : ""}" data-category="${category.id}" style="${
        active ? `background:${category.color}` : ""
      }">
          <span>${category.icon}</span>
          <span>${category.name}</span>
          <span class="tab-count">${count}</span>
        </button>
      `;
    })
    .join("");
}

function renderFilterOptions() {
  const selectedCategory = filterCategory.value || "current";
  const selectedPriority = filterPriority.value || "";
  filterCategory.innerHTML = [
    `<option value="current">Theo tab đang mở</option>`,
    `<option value="all">Tất cả nhóm</option>`,
    ...categories.map((category) => `<option value="${category.id}">${category.icon} ${escapeHtml(category.name)}</option>`),
  ].join("");
  filterCategory.value = [...filterCategory.options].some((option) => option.value === selectedCategory)
    ? selectedCategory
    : "current";

  filterPriority.innerHTML = [
    `<option value="">Tất cả nhãn</option>`,
    ...priorityLabels.map((label) => `<option value="${label.id}">${escapeHtml(label.name)}</option>`),
  ].join("");
  filterPriority.value = [...filterPriority.options].some((option) => option.value === selectedPriority)
    ? selectedPriority
    : "";
}

function resetAdvancedFilters() {
  filterCategory.value = "current";
  filterPriority.value = "";
  $("#filterRemote").checked = false;
  $("#filterUrgent").checked = false;
  $("#filterHasNotes").checked = false;
  $("#filterNoScript").checked = false;
  $("#filterNoImage").checked = false;
  renderIssues();
}

function renderIssueBadge(categoryId) {
  const category = categories.find((item) => item.id === categoryId);
  if (!category) return "";
  return `<span class="issue-badge" style="--badge-color:${category.color}">${escapeHtml(category.name)}</span>`;
}

function getIssuePriorityLabels(issue) {
  const ids = Array.isArray(issue?.priorityLabels) ? issue.priorityLabels : [];
  return ids.map((id) => priorityLabels.find((label) => label.id === id)).filter(Boolean);
}

function renderPriorityTags(issue, size = "compact") {
  const labels = getIssuePriorityLabels(issue);
  if (!labels.length) return "";
  return `<div class="priority-tags ${size}">${labels
    .map(
      (label) =>
        `<span class="priority-tag" style="--priority-color:${label.color}">${escapeHtml(label.name)}</span>`
    )
    .join("")}</div>`;
}

function renderIssues() {
  const category = getActiveCategory();
  const isGlobalSearch = Boolean(searchInput.value.trim() || hasAdvancedFilters());
  categoryTitle.textContent = isGlobalSearch ? "Kết quả tìm kiếm / lọc" : `${category.icon} ${category.name}`;
  categoryTitle.style.color = isGlobalSearch ? "#475467" : category.color;
  document.documentElement.style.setProperty("--blue", category.color);

  const issues = getFilteredIssues();
  if (!issues.some((issue) => issue.id === state.activeIssueId)) {
    state.activeIssueId = issues[0]?.id || "";
  }

  if (!issues.length) {
    state.activeIssueId = "";
    issueList.innerHTML = `<div class="no-results">${
      isGlobalSearch ? "Không tìm thấy kịch bản phù hợp." : "Chưa có kịch bản trong nhóm này. Bấm + Thêm để tạo mới."
    }</div>`;
    renderDetail();
    return;
  }

  issueList.innerHTML = issues
    .map(
      (issue) => `
      <button class="issue-item ${issue.id === state.activeIssueId ? "active" : ""}" data-issue="${issue.id}">
        <span class="issue-card-main">
          ${isGlobalSearch ? renderIssueBadge(issue.categoryId) : ""}
          <p class="issue-title">${escapeHtml(issue.name)}</p>
          <p class="issue-summary">${escapeHtml(issue.summary || "Chưa có mô tả")}</p>
          ${renderPriorityTags(issue)}
        </span>
        <span class="row-actions">
          <span class="open-row">Mở</span>
          <span class="icon-btn edit-row" data-edit="${issue.id}" title="Sửa">✎</span>
          <span class="icon-btn delete-btn" data-delete="${issue.id}" title="Xóa">×</span>
        </span>
      </button>
    `
    )
    .join("");

  renderDetail();
}

function getMobileSearchMatches() {
  const keyword = normalizeSearchText($("#mobileSearchInput").value);
  if (!keyword) return state.issues.slice(0, 12);

  return state.issues.filter((issue) => {
    const category = categories.find((item) => item.id === issue.categoryId);
    const labels = getIssuePriorityLabels(issue).map((label) => label.name);
    const haystack = normalizeSearchText(
      [
        category?.id,
        category?.name,
        issue.name,
        issue.summary,
        issue.script,
        issue.escalation,
        issue.internalNotes,
        ...(issue.steps || []),
        ...labels,
      ].join(" ")
    );
    return haystack.includes(keyword);
  });
}

function renderMobileSearchResults() {
  const results = getMobileSearchMatches();
  if (!results.length) {
    $("#mobileSearchResults").innerHTML = `<div class="mobile-search-empty">Không tìm thấy kịch bản phù hợp.</div>`;
    return;
  }

  $("#mobileSearchResults").innerHTML = categories
    .map((category) => {
      const items = results.filter((issue) => issue.categoryId === category.id);
      if (!items.length) return "";
      return `
        <section class="mobile-search-group">
          <div class="mobile-search-group-title" style="--group-color:${category.color}">
            <span>${category.icon}</span>
            <strong>${escapeHtml(category.name)}</strong>
            <em>${items.length}</em>
          </div>
          <div class="mobile-search-list">
            ${items
              .map(
                (issue) => `
                  <article class="mobile-search-card">
                    <div>
                      <h3>${escapeHtml(issue.name)}</h3>
                      <p>${escapeHtml(issue.summary || "Chưa có mô tả")}</p>
                      ${renderPriorityTags(issue)}
                    </div>
                    <button type="button" data-mobile-open-issue="${issue.id}">Mở</button>
                  </article>
                `
              )
              .join("")}
          </div>
        </section>
      `;
    })
    .join("");
}

function openMobileSearch() {
  leaveMobileFocusMode();
  updateMobileBottomNav("search");
  $("#mobileSearchScreen").classList.remove("hidden");
  document.body.classList.add("mobile-search-open");
  $("#mobileSearchInput").value = searchInput.value;
  renderMobileSearchResults();
  window.setTimeout(() => $("#mobileSearchInput").focus(), 80);
}

function closeMobileSearch() {
  $("#mobileSearchScreen").classList.add("hidden");
  document.body.classList.remove("mobile-search-open");
  updateMobileBottomNav();
}

function openIssueFromMobileSearch(issueId) {
  const issue = state.issues.find((item) => item.id === issueId);
  if (!issue) return;
  state.activeIssueId = issue.id;
  state.activeCategoryId = issue.categoryId;
  searchInput.value = "";
  recordIssueView(issue.id);
  saveState();
  closeMobileSearch();
  render();
  enterMobileFocusMode();
}

function renderDetail() {
  const issue = getActiveIssue();
  if (!issue) {
    emptyState.classList.remove("hidden");
    issueDetail.classList.add("hidden");
    document.body.classList.remove("mobile-detail-focus");
    $("#mobileCopyScriptBtn").classList.add("hidden");
    updateCopyImageButton(null);
    updateMobileBottomNav();
    return;
  }

  const category = categories.find((item) => item.id === issue.categoryId);
  emptyState.classList.add("hidden");
  issueDetail.classList.remove("hidden");
  document.body.classList.toggle("mobile-detail-focus", mobileFocusMode);
  $("#mobileCopyScriptBtn").classList.remove("hidden");
  updateMobileBottomNav();
  $("#detailCategory").textContent = `${category.icon} ${category.name}`;
  $("#detailName").textContent = issue.name;
  $("#detailSummary").textContent = issue.summary || "";
  $("#detailLabels").innerHTML = renderPriorityTags(issue, "detail");
  const checkedSteps = state.checklistState?.[issue.id] || {};
  $("#processSteps").innerHTML = (issue.steps || [])
    .map(
      (step, index) => `
        <li class="${checkedSteps[index] ? "done" : ""}">
          <label class="step-check">
            <input type="checkbox" data-step-index="${index}" ${checkedSteps[index] ? "checked" : ""} />
            <span>${escapeHtml(step)}</span>
          </label>
        </li>
      `
    )
    .join("");
  $("#zaloScript").textContent = issue.script || "Chưa có script.";
  $("#escalationText").textContent = issue.escalation || "Chưa có điều kiện leo thang.";
  $("#internalNotesText").textContent = issue.internalNotes || "Chưa có ghi chú nội bộ.";
  $("#imagePreview").innerHTML = issue.image
    ? `<img src="${issue.image}" alt="Ảnh lỗi minh họa" />`
    : `<span>▧</span><p>Chưa có ảnh minh họa</p>`;
  const issueImages = getIssueImages(issue);
  if (issueImages.length) {
    $("#imagePreview").innerHTML = `<div class="image-gallery">${issueImages
      .map(
        (image, index) => `
          <figure class="image-card">
            <img src="${image}" alt="Ảnh lỗi minh họa ${index + 1}" />
              <figcaption>
                <span>Ảnh ${index + 1}</span>
                <span class="image-card-actions">
                  <button type="button" data-copy-image-index="${index}">Copy</button>
                  <button class="danger-mini-btn" type="button" data-delete-image-index="${index}">Xóa</button>
                </span>
              </figcaption>
          </figure>
        `
      )
      .join("")}</div>`;
  }
  updateCopyImageButton(issue);
}

function updateCopyImageButton(issue) {
  $("#copyDetailImageBtn").disabled = !getIssueImages(issue).length;
}

function enterMobileFocusMode() {
  mobileFocusMode = true;
  document.body.classList.add("mobile-detail-focus");
  updateMobileBottomNav();
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function leaveMobileFocusMode() {
  mobileFocusMode = false;
  document.body.classList.remove("mobile-detail-focus");
  updateMobileBottomNav();
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function updateMobileBottomNav(active = mobileFocusMode ? "detail" : "groups") {
  const nav = $("#mobileBottomNav");
  if (!nav) return;
  nav.querySelectorAll("[data-mobile-nav]").forEach((button) => {
    button.classList.toggle("active", button.dataset.mobileNav === active);
  });
}

function openAiModal() {
  $("#aiResult").classList.remove("show");
  updateAiProviderStatus();
  $("#aiModal").showModal();
}

function escapeHtml(value) {
  return String(value || "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function showToast(message) {
  toast.textContent = message;
  toast.classList.add("show");
  window.setTimeout(() => toast.classList.remove("show"), 1800);
}

function getAiConfig() {
  try {
    const config = JSON.parse(localStorage.getItem(AI_CONFIG_KEY) || "{}");
    return {
      apiKey: config.apiKey || "",
      model: config.model || "openai/gpt-4o-mini",
    };
  } catch {
    return { apiKey: "", model: "openai/gpt-4o-mini" };
  }
}

function saveAiConfig() {
  const apiKey = $("#openRouterKeyInput").value.trim();
  const model = $("#openRouterModelInput").value.trim() || "openai/gpt-4o-mini";
  localStorage.setItem(AI_CONFIG_KEY, JSON.stringify({ apiKey, model }));
  updateAiProviderStatus();
  $("#aiConfigModal").close();
  showToast("Đã lưu cấu hình AI");
}

function clearAiConfig() {
  localStorage.removeItem(AI_CONFIG_KEY);
  $("#openRouterKeyInput").value = "";
  $("#openRouterModelInput").value = "openai/gpt-4o-mini";
  updateAiProviderStatus();
  showToast("Đã xóa API key");
}

function openAiConfigModal() {
  const config = getAiConfig();
  $("#openRouterKeyInput").value = config.apiKey;
  $("#openRouterModelInput").value = config.model;
  $("#aiConfigModal").showModal();
  $("#openRouterKeyInput").focus();
}

function updateAiProviderStatus() {
  const status = $("#aiProviderStatus");
  if (!status) return;
  const config = getAiConfig();
  status.textContent = config.apiKey
    ? `Đang dùng OpenRouter: ${config.model}`
    : "Đang dùng chẩn đoán nội bộ.";
}

function openIssueModal(issue) {
  state.editingImage = issue?.image || "";
  $("#modalTitle").textContent = issue ? "✎ Sửa lỗi" : "+ Thêm lỗi";
  $("#issueId").value = issue?.id || "";
  $("#nameInput").value = issue?.name || "";
  $("#summaryInput").value = issue?.summary || "";
  setPriorityInputs(issue?.priorityLabels || []);
  $("#stepsInput").value = (issue?.steps || []).join("\n");
  $("#scriptInput").value = issue?.script || "";
  $("#escalationInput").value = issue?.escalation || "";
  $("#internalNotesInput").value = issue?.internalNotes || "";
  $("#imageInput").value = "";
  updateDropZonePreview();
  $("#issueModal").showModal();
}

function closeIssueModal() {
  $("#issueModal").close();
}

function setPriorityInputs(selectedLabels) {
  const selected = new Set(selectedLabels);
  document.querySelectorAll("#priorityOptions input[type='checkbox']").forEach((input) => {
    input.checked = selected.has(input.value);
  });
}

function getSelectedPriorityLabels() {
  return [...document.querySelectorAll("#priorityOptions input[type='checkbox']:checked")].map((input) => input.value);
}

function updateDropZonePreview() {
  const dropZone = $("#dropZone");
  if (state.editingImage) {
    dropZone.innerHTML = `<img src="${state.editingImage}" alt="Ảnh đã chọn" style="max-width:100%;max-height:96px;object-fit:contain" /><small>Bấm để đổi ảnh</small>`;
  } else {
    dropZone.innerHTML = `<span>🖼</span><strong>Bấm để chọn ảnh</strong><small>hoặc kéo thả - hoặc dán Ctrl+V vào đây</small>`;
  }
}

function imageFileToDataUrl(file, maxSize = 1400, quality = 0.82) {
  return new Promise((resolve, reject) => {
    if (!file || !file.type.startsWith("image/")) {
      resolve("");
      return;
    }

    const reader = new FileReader();
    reader.onerror = reject;
    reader.onload = () => {
      const image = new Image();
      image.onerror = reject;
      image.onload = () => {
        const ratio = Math.min(1, maxSize / Math.max(image.width, image.height));
        const width = Math.max(1, Math.round(image.width * ratio));
        const height = Math.max(1, Math.round(image.height * ratio));
        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        const context = canvas.getContext("2d");
        context.drawImage(image, 0, 0, width, height);
        resolve(canvas.toDataURL("image/jpeg", quality));
      };
      image.src = reader.result;
    };
    reader.readAsDataURL(file);
  });
}

async function readImage(file) {
  if (!file || !file.type.startsWith("image/")) return;
  try {
    state.editingImage = await imageFileToDataUrl(file);
    updateDropZonePreview();
  } catch {
    showToast("Không đọc được ảnh");
  }
}

async function syncStateNow(successMessage) {
  saveState();
  try {
    await saveCloudState();
    if (successMessage) showToast(successMessage);
    return true;
  } catch {
    showToast("Chưa đồng bộ được Firebase. Thử ảnh nhỏ hơn hoặc kiểm tra mạng.");
    return false;
  }
}

async function uploadActiveIssueImage(file) {
  const issue = getActiveIssue();
  if (!issue || !file || !file.type.startsWith("image/")) return;
  showToast("Đang xử lý ảnh...");
  try {
    const imageData = await imageFileToDataUrl(file);
    createBackup("Trước khi cập nhật ảnh minh họa", true);
    issue.image = imageData;
    renderDetail();
    $("#detailImageInput").value = "";
    await syncStateNow("Đã tải ảnh và đồng bộ Firebase");
  } catch {
    showToast("Không tải được ảnh này");
  }
}

async function uploadActiveIssueImages(files) {
  const issue = getActiveIssue();
  const imageFiles = [...(files instanceof FileList ? files : [files])].filter((file) => file?.type?.startsWith("image/"));
  if (!issue || !imageFiles.length) return;
  showToast(`Đang xử lý ${imageFiles.length} ảnh...`);
  try {
    const imageDataList = [];
    for (const file of imageFiles) {
      imageDataList.push(await imageFileToDataUrl(file));
    }
    createBackup("Trước khi cập nhật ảnh minh họa", true);
    setIssueImages(issue, [...getIssueImages(issue), ...imageDataList]);
    renderDetail();
    $("#detailImageInput").value = "";
    await syncStateNow(`Đã tải ${imageDataList.length} ảnh và đồng bộ Firebase`);
  } catch {
    showToast("Không tải được ảnh này");
  }
}

async function deleteActiveIssueImage(index) {
  const issue = getActiveIssue();
  const images = getIssueImages(issue);
  const imageIndex = Number(index);
  if (!issue || !images[imageIndex]) return;
  const ok = window.confirm(`Xóa ảnh ${imageIndex + 1}?`);
  if (!ok) return;

  createBackup("Trước khi xóa ảnh minh họa", true);
  images.splice(imageIndex, 1);
  setIssueImages(issue, images);
  renderDetail();
  await syncStateNow("Đã xóa ảnh và đồng bộ Firebase");
}

function saveIssue(event) {
  event.preventDefault();
  const id = $("#issueId").value || crypto.randomUUID();
  const existingIssue = state.issues.find((item) => item.id === id);
  createBackup(existingIssue ? "Trước khi sửa kịch bản" : "Trước khi thêm kịch bản", true);
  const issue = {
    id,
    categoryId: existingIssue?.categoryId || state.activeCategoryId,
    name: $("#nameInput").value.trim(),
    summary: $("#summaryInput").value.trim(),
    priorityLabels: getSelectedPriorityLabels(),
    steps: $("#stepsInput").value.split("\n").map((step) => step.trim()).filter(Boolean),
    script: $("#scriptInput").value.trim(),
    escalation: $("#escalationInput").value.trim(),
    internalNotes: $("#internalNotesInput").value.trim(),
    image: state.editingImage || existingIssue?.image || "",
    images: state.editingImage ? [state.editingImage] : getIssueImages(existingIssue),
  };

  if (!issue.name) {
    showToast("Vui lòng nhập tên lỗi");
    return;
  }

  const index = state.issues.findIndex((item) => item.id === id);
  if (index >= 0) {
    state.issues[index] = issue;
  } else {
    state.issues.unshift(issue);
  }

  state.activeIssueId = id;
  saveState();
  closeIssueModal();
  render();
  showToast("Đã lưu lỗi");
}

function deleteIssue(id) {
  const issue = state.issues.find((item) => item.id === id);
  if (!issue) return;
  const ok = window.confirm(`Xóa lỗi "${issue.name}"?`);
  if (!ok) return;
  createBackup("Trước khi xóa kịch bản", true);
  state.issues = state.issues.filter((item) => item.id !== id);
  if (state.checklistState) {
    delete state.checklistState[id];
  }
  state.activeIssueId = getFilteredIssues()[0]?.id || "";
  saveState();
  render();
  showToast("Đã xóa lỗi");
}

function toggleChecklistStep(event) {
  const checkbox = event.target.closest("[data-step-index]");
  if (!checkbox) return;
  const issue = getActiveIssue();
  if (!issue) return;

  const stepIndex = checkbox.dataset.stepIndex;
  state.checklistState = state.checklistState || {};
  state.checklistState[issue.id] = state.checklistState[issue.id] || {};
  state.checklistState[issue.id][stepIndex] = checkbox.checked;
  saveState();
  renderDetail();
}

function resetChecklist() {
  const issue = getActiveIssue();
  if (!issue) return;
  state.checklistState = state.checklistState || {};
  delete state.checklistState[issue.id];
  saveState();
  renderDetail();
  showToast("Đã đặt lại checklist");
}

async function copyActiveScript() {
  const issue = getActiveIssue();
  if (!issue) return;
  await navigator.clipboard.writeText(issue.script || "");
  showToast("Đã copy script Zalo");
}

function dataUrlToBlob(dataUrl) {
  const [meta, payload] = String(dataUrl || "").split(",");
  const mime = meta.match(/data:(.*?);base64/)?.[1] || "image/png";
  const binary = atob(payload || "");
  const bytes = new Uint8Array(binary.length);
  for (let index = 0; index < binary.length; index += 1) {
    bytes[index] = binary.charCodeAt(index);
  }
  return new Blob([bytes], { type: mime });
}

function dataUrlToPngBlob(dataUrl) {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onerror = reject;
    image.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = image.naturalWidth || image.width;
      canvas.height = image.naturalHeight || image.height;
      const context = canvas.getContext("2d");
      context.drawImage(image, 0, 0);
      canvas.toBlob((blob) => {
        if (blob) resolve(blob);
        else reject(new Error("Cannot convert image"));
      }, "image/png");
    };
    image.src = dataUrl;
  });
}

async function copyActiveImage(index = 0) {
  const issue = getActiveIssue();
  const image = getIssueImages(issue)[Number(index) || 0];
  if (!image) {
    showToast("Chưa có ảnh để copy");
    return;
  }
  if (!navigator.clipboard || !window.ClipboardItem) {
    showToast("Trình duyệt này chưa hỗ trợ copy ảnh trực tiếp");
    return;
  }

  try {
    const blob = await dataUrlToPngBlob(image);
    await navigator.clipboard.write([new ClipboardItem({ "image/png": blob })]);
    showToast("Đã copy ảnh, có thể dán vào Zalo");
  } catch {
    window.open(image, "_blank", "noopener,noreferrer");
    showToast("Không copy được ảnh. Mình đã mở ảnh để bạn lưu/gửi thủ công.");
  }
}

function buildFullZaloMessage() {
  const issue = getActiveIssue();
  if (!issue) return "";

  const customerName = $("#customerNameInput").value.trim();
  const taxCode = $("#taxCodeInput").value.trim();
  const software = $("#softwareInput").value.trim();
  const values = {
    ten_khach: customerName,
    mst: taxCode,
    phan_mem: software,
  };
  const scriptTemplate = issue.script || "";
  const renderedScript = applyTemplateVariables(scriptTemplate, values);
  const usedVariables = getUsedTemplateVariables(scriptTemplate);
  const contextLines = [
    customerName && !usedVariables.has("ten_khach") ? `Khách hàng: ${customerName}` : "",
    taxCode && !usedVariables.has("mst") ? `Mã số thuế: ${taxCode}` : "",
    software && !usedVariables.has("phan_mem") ? `Phần mềm/hệ thống: ${software}` : "",
  ].filter(Boolean);
  const header = contextLines.length ? `${contextLines.join("\n")}\n\n` : "";

  return `${header}${renderedScript}`.trim();
}

function applyTemplateVariables(template, values) {
  return String(template || "").replace(/\{\{\s*(ten_khach|mst|phan_mem)\s*\}\}/gi, (_, key) => {
    const normalizedKey = key.toLowerCase();
    return values[normalizedKey] || "";
  });
}

function getUsedTemplateVariables(template) {
  const used = new Set();
  String(template || "").replace(/\{\{\s*(ten_khach|mst|phan_mem)\s*\}\}/gi, (_, key) => {
    used.add(key.toLowerCase());
    return "";
  });
  return used;
}

function updateFullZaloMessage() {
  $("#zaloMessageOutput").value = buildFullZaloMessage();
}

function openZaloModal() {
  const issue = getActiveIssue();
  if (!issue) return;
  $("#customerNameInput").value = "";
  $("#taxCodeInput").value = "";
  $("#softwareInput").value = "";
  $("#zaloMessageOutput").value = buildFullZaloMessage();
  $("#zaloModal").showModal();
  $("#customerNameInput").focus();
}

async function copyFullZaloMessage() {
  updateFullZaloMessage();
  const message = $("#zaloMessageOutput").value.trim();
  if (!message) {
    showToast("Chưa có nội dung để copy");
    return;
  }
  await navigator.clipboard.writeText(message);
  showToast("Đã copy tin nhắn Zalo");
}

function parseAiJson(content) {
  const cleaned = String(content || "")
    .replace(/^```json\s*/i, "")
    .replace(/^```\s*/i, "")
    .replace(/```$/i, "")
    .trim();
  const match = cleaned.match(/\{[\s\S]*\}/);
  return JSON.parse(match ? match[0] : cleaned);
}

async function diagnoseWithOpenRouter(text, config) {
  const issueCatalog = state.issues.map((issue) => ({
    id: issue.id,
    group: categories.find((category) => category.id === issue.categoryId)?.name || issue.categoryId,
    name: issue.name,
    summary: issue.summary,
    steps: issue.steps || [],
    escalation: issue.escalation || "",
    internalNotes: issue.internalNotes || "",
    labels: getIssuePriorityLabels(issue).map((label) => label.name),
  }));

  const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${config.apiKey}`,
      "Content-Type": "application/json",
      "HTTP-Referer": window.location.href,
      "X-Title": "IT Support Script",
    },
    body: JSON.stringify({
      model: config.model,
      temperature: 0.1,
      messages: [
        {
          role: "system",
          content:
            'Bạn là trợ lý phân loại lỗi cho phần mềm hỗ trợ nội bộ. Chọn kịch bản phù hợp nhất từ danh sách. Chỉ trả về JSON dạng {"issueId":"...","reason":"...","firstStep":"..."}. Nếu không có kịch bản phù hợp, trả về {"issueId":null,"reason":"...","firstStep":""}.',
        },
        {
          role: "user",
          content: `Mô tả lỗi khách gửi:\n${text}\n\nDanh sách kịch bản:\n${JSON.stringify(issueCatalog)}`,
        },
      ],
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText || `OpenRouter HTTP ${response.status}`);
  }

  const data = await response.json();
  const content = data?.choices?.[0]?.message?.content || "";
  const parsed = parseAiJson(content);
  const issue = state.issues.find((item) => item.id === parsed.issueId);
  return {
    issue,
    reason: parsed.reason || "",
    firstStep: parsed.firstStep || issue?.steps?.[0] || "",
  };
}

function renderAiSuggestion(issue, reason, firstStep, sourceLabel = "Khả năng cao") {
  const result = $("#aiResult");
  const category = categories.find((item) => item.id === issue.categoryId);
  result.innerHTML = `
    <h3>${sourceLabel}: ${escapeHtml(issue.name)}</h3>
    <p><strong>Nhóm:</strong> ${category.icon} ${category.name}</p>
    <p><strong>Mô tả:</strong> ${escapeHtml(issue.summary || "")}</p>
    ${reason ? `<p><strong>Lý do:</strong> ${escapeHtml(reason)}</p>` : ""}
    <p><strong>Bước đầu:</strong> ${escapeHtml(firstStep || issue.steps?.[0] || "Mở kịch bản để xem chi tiết.")}</p>
    <button class="secondary-btn" type="button" id="openSuggestedIssue">Mở kịch bản này</button>
  `;
  result.classList.add("show");
  $("#openSuggestedIssue").addEventListener("click", () => {
    state.activeCategoryId = issue.categoryId;
    state.activeIssueId = issue.id;
    saveState();
    $("#aiModal").close();
    render();
  });
}

async function diagnose() {
  const text = $("#aiInput").value.trim().toLowerCase();
  const result = $("#aiResult");
  if (!text) {
    showToast("Dán mô tả lỗi trước đã nhé");
    return;
  }

  const config = getAiConfig();
  updateAiProviderStatus();
  if (config.apiKey) {
    result.innerHTML = `<h3>Đang gọi OpenRouter...</h3><p>AI đang đối chiếu mô tả lỗi với danh sách kịch bản hiện có.</p>`;
    result.classList.add("show");
    try {
      const aiSuggestion = await diagnoseWithOpenRouter(text, config);
      if (aiSuggestion.issue) {
        renderAiSuggestion(aiSuggestion.issue, aiSuggestion.reason, aiSuggestion.firstStep, "AI gợi ý");
        return;
      }
      result.innerHTML = `
        <h3>AI chưa tìm thấy kịch bản phù hợp</h3>
        <p>${escapeHtml(aiSuggestion.reason || "Bạn có thể thêm kịch bản mới từ mô tả khách gửi.")}</p>
      `;
      result.classList.add("show");
      return;
    } catch (error) {
      result.innerHTML = `
        <h3>Không gọi được OpenRouter</h3>
        <p>App sẽ dùng chẩn đoán nội bộ bằng từ khóa. Kiểm tra lại API key, model hoặc kết nối mạng nếu cần.</p>
      `;
      result.classList.add("show");
    }
  }

  const scored = state.issues
    .map((issue) => {
      const haystack = [issue.name, issue.summary, issue.script, issue.escalation, issue.internalNotes, ...(issue.steps || [])]
        .join(" ")
        .toLowerCase();
      const score = text
        .split(/\s+/)
        .filter((word) => word.length > 2 && haystack.includes(word)).length;
      return { issue, score };
    })
    .sort((a, b) => b.score - a.score);

  const best = scored[0]?.score ? scored[0].issue : null;
  if (!best) {
    result.innerHTML = `
      <h3>Chưa tìm thấy kịch bản phù hợp</h3>
      <p>Gợi ý: thêm lỗi mới từ mô tả khách gửi để lần sau tra cứu nhanh hơn.</p>
    `;
    result.classList.add("show");
    return;
  }

  const category = categories.find((item) => item.id === best.categoryId);
  result.innerHTML = `
    <h3>Khả năng cao: ${escapeHtml(best.name)}</h3>
    <p><strong>Nhóm:</strong> ${category.icon} ${category.name}</p>
    <p><strong>Mô tả:</strong> ${escapeHtml(best.summary)}</p>
    <p><strong>Bước đầu:</strong> ${escapeHtml(best.steps?.[0] || "Mở kịch bản để xem chi tiết.")}</p>
    <button class="secondary-btn" type="button" id="openSuggestedIssue">Mở kịch bản này</button>
  `;
  result.classList.add("show");
  $("#openSuggestedIssue").addEventListener("click", () => {
    state.activeCategoryId = best.categoryId;
    state.activeIssueId = best.id;
    recordIssueView(best.id);
    saveState();
    $("#aiModal").close();
    render();
  });
}

function exportData() {
  const blob = new Blob([JSON.stringify(state.issues, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "it-support-scripts.json";
  link.click();
  URL.revokeObjectURL(url);
}

function importData(file) {
  if (!file) return;
  const reader = new FileReader();
  reader.onload = () => {
    try {
      const issues = JSON.parse(reader.result);
      if (!Array.isArray(issues)) throw new Error("Invalid data");
      createBackup("Trước khi nhập dữ liệu", true);
      state.issues = issues;
      state.activeCategoryId = issues[0]?.categoryId || "cks";
      state.activeIssueId = issues[0]?.id || "";
      saveState();
      render();
      showToast("Đã nhập dữ liệu");
    } catch {
      showToast("File dữ liệu không hợp lệ");
    }
  };
  reader.readAsText(file);
}

function bindEvents() {
  categoryTabs.addEventListener("click", (event) => {
    const button = event.target.closest("[data-category]");
    if (!button) return;
    leaveMobileFocusMode();
    state.activeCategoryId = button.dataset.category;
    const firstIssue = state.issues.find((issue) => issue.categoryId === state.activeCategoryId);
    state.activeIssueId = firstIssue?.id || "";
    searchInput.value = "";
    saveState();
    render();
  });

  issueList.addEventListener("click", (event) => {
    const edit = event.target.closest("[data-edit]");
    const del = event.target.closest("[data-delete]");
    const row = event.target.closest("[data-issue]");

    if (edit) {
      openIssueModal(state.issues.find((issue) => issue.id === edit.dataset.edit));
      return;
    }
    if (del) {
      deleteIssue(del.dataset.delete);
      return;
    }
    if (row) {
      state.activeIssueId = row.dataset.issue;
      const selectedIssue = state.issues.find((issue) => issue.id === state.activeIssueId);
      if (selectedIssue) {
        state.activeCategoryId = selectedIssue.categoryId;
      }
      recordIssueView(state.activeIssueId);
      saveState();
      render();
      enterMobileFocusMode();
    }
  });

  searchInput.addEventListener("input", () => {
    leaveMobileFocusMode();
    renderIssues();
  });
  $("#processSteps").addEventListener("change", toggleChecklistStep);
  $("#resetChecklistBtn").addEventListener("click", resetChecklist);
  $("#addIssueBtn").addEventListener("click", () => openIssueModal(null));
  $("#editIssueBtn").addEventListener("click", () => openIssueModal(getActiveIssue()));
  $("#copyScriptBtn").addEventListener("click", copyActiveScript);
  $("#copyScriptInlineBtn").addEventListener("click", copyActiveScript);
  $("#mobileCopyScriptBtn").addEventListener("click", copyActiveScript);
  $("#mobileBackToListBtn").addEventListener("click", leaveMobileFocusMode);
  $("#composeZaloBtn").addEventListener("click", openZaloModal);
  $("#uploadDetailImageBtn").addEventListener("click", () => $("#detailImageInput").click());
  $("#copyDetailImageBtn").addEventListener("click", copyActiveImage);
  $("#detailImageInput").addEventListener("change", (event) => uploadActiveIssueImages(event.target.files));
  $("#imagePreview").addEventListener("click", (event) => {
    const copyButton = event.target.closest("[data-copy-image-index]");
    if (copyButton) {
      copyActiveImage(copyButton.dataset.copyImageIndex);
      return;
    }
    const deleteButton = event.target.closest("[data-delete-image-index]");
    if (deleteButton) {
      deleteActiveIssueImage(deleteButton.dataset.deleteImageIndex);
      return;
    }
    $("#detailImageInput").click();
  });
  $("#bottomNavGroupsBtn").addEventListener("click", () => {
    leaveMobileFocusMode();
    updateMobileBottomNav("groups");
    document.querySelector(".issue-list-panel")?.scrollIntoView({ behavior: "smooth", block: "start" });
  });
  $("#bottomNavSearchBtn").addEventListener("click", () => {
    openMobileSearch();
  });
  $("#bottomNavDetailBtn").addEventListener("click", () => {
    if (!getActiveIssue()) {
      showToast("Chọn một lỗi trước");
      return;
    }
    enterMobileFocusMode();
  });
  $("#bottomNavZaloBtn").addEventListener("click", () => {
    if (!getActiveIssue()) {
      showToast("Chọn một lỗi trước");
      return;
    }
    updateMobileBottomNav("zalo");
    openZaloModal();
  });
  $("#bottomNavAiBtn").addEventListener("click", () => {
    updateMobileBottomNav("ai");
    openAiModal();
  });
  $("#closeMobileSearchBtn").addEventListener("click", closeMobileSearch);
  $("#mobileSearchInput").addEventListener("input", renderMobileSearchResults);
  $("#mobileSearchResults").addEventListener("click", (event) => {
    const button = event.target.closest("[data-mobile-open-issue]");
    if (!button) return;
    openIssueFromMobileSearch(button.dataset.mobileOpenIssue);
  });
  $("#closeZaloModal").addEventListener("click", () => $("#zaloModal").close());
  $("#cancelZaloBtn").addEventListener("click", () => $("#zaloModal").close());
  $("#zaloModal").addEventListener("close", () => updateMobileBottomNav());
  $("#copyFullZaloBtn").addEventListener("click", copyFullZaloMessage);
  $("#customerNameInput").addEventListener("input", updateFullZaloMessage);
  $("#taxCodeInput").addEventListener("input", updateFullZaloMessage);
  $("#softwareInput").addEventListener("input", updateFullZaloMessage);
  $("#closeIssueModal").addEventListener("click", closeIssueModal);
  $("#cancelIssueBtn").addEventListener("click", closeIssueModal);
  $("#issueForm").addEventListener("submit", saveIssue);
  $("#imageInput").addEventListener("change", (event) => readImage(event.target.files[0]));
  $("#dropZone").addEventListener("click", () => $("#imageInput").click());
  $("#dropZone").addEventListener("dragover", (event) => {
    event.preventDefault();
    $("#dropZone").classList.add("dragging");
  });
  $("#dropZone").addEventListener("dragleave", () => $("#dropZone").classList.remove("dragging"));
  $("#dropZone").addEventListener("drop", (event) => {
    event.preventDefault();
    $("#dropZone").classList.remove("dragging");
    readImage(event.dataTransfer.files[0]);
  });
  $("#issueModal").addEventListener("paste", (event) => {
    const file = [...event.clipboardData.files].find((item) => item.type.startsWith("image/"));
    readImage(file);
  });

  $("#openAiBtn").addEventListener("click", openAiModal);
  $("#openAiConfigBtn").addEventListener("click", openAiConfigModal);
  $("#closeAiConfigModal").addEventListener("click", () => $("#aiConfigModal").close());
  $("#cancelAiConfigBtn").addEventListener("click", () => $("#aiConfigModal").close());
  $("#saveAiConfigBtn").addEventListener("click", saveAiConfig);
  $("#clearAiConfigBtn").addEventListener("click", clearAiConfig);
  $("#openBackupBtn").addEventListener("click", () => {
    renderBackupList();
    $("#backupModal").showModal();
  });
  $("#openStatsBtn").addEventListener("click", () => {
    renderStatsDashboard();
    $("#statsModal").showModal();
  });
  $("#closeStatsModal").addEventListener("click", () => $("#statsModal").close());
  $("#statsTopIssues").addEventListener("click", (event) => {
    const row = event.target.closest("[data-stats-open]");
    if (!row) return;
    const issue = state.issues.find((item) => item.id === row.dataset.statsOpen);
    if (!issue) return;
    state.activeCategoryId = issue.categoryId;
    state.activeIssueId = issue.id;
    recordIssueView(issue.id);
    $("#statsModal").close();
    render();
  });
  $("#closeBackupModal").addEventListener("click", () => $("#backupModal").close());
  $("#createBackupBtn").addEventListener("click", () => createBackup("Sao lưu thủ công"));
  $("#downloadLatestBackupBtn").addEventListener("click", () => downloadBackup(getBackups()[0]));
  $("#backupList").addEventListener("click", (event) => {
    const download = event.target.closest("[data-download-backup]");
    const restore = event.target.closest("[data-restore-backup]");
    const del = event.target.closest("[data-delete-backup]");
    if (download) downloadBackup(getBackups().find((backup) => backup.id === download.dataset.downloadBackup));
    if (restore) restoreBackup(restore.dataset.restoreBackup);
    if (del) deleteBackup(del.dataset.deleteBackup);
  });
  $("#closeAiModal").addEventListener("click", () => $("#aiModal").close());
  $("#cancelAiBtn").addEventListener("click", () => $("#aiModal").close());
  $("#aiModal").addEventListener("close", () => updateMobileBottomNav());
  $("#diagnoseBtn").addEventListener("click", diagnose);
  $("#exportBtn").addEventListener("click", exportData);
  $("#importInput").addEventListener("change", (event) => importData(event.target.files[0]));
  filterCategory.addEventListener("change", renderIssues);
  filterPriority.addEventListener("change", renderIssues);
  $("#filterRemote").addEventListener("change", renderIssues);
  $("#filterUrgent").addEventListener("change", renderIssues);
  $("#filterHasNotes").addEventListener("change", renderIssues);
  $("#filterNoScript").addEventListener("change", renderIssues);
  $("#filterNoImage").addEventListener("change", renderIssues);
  $("#resetFiltersBtn").addEventListener("click", resetAdvancedFilters);
}

function render() {
  renderTabs();
  if (!filterCategory.options.length) {
    renderFilterOptions();
  }
  renderIssues();
  updateMobileBottomNav();
}

function registerServiceWorker() {
  if (!("serviceWorker" in navigator) || window.location.protocol !== "https:") return;
  navigator.serviceWorker.register("/service-worker.js").catch(() => {
    console.info("Service worker registration skipped.");
  });
}

$("#loginForm").addEventListener("submit", handleLogin);
$("#logoutBtn").addEventListener("click", () => firebaseAuth?.signOut());
registerServiceWorker();

if (initFirebase()) {
  firebaseAuth.onAuthStateChanged((user) => {
    handleAuthUser(user).catch(() => showLoginScreen("Không tải được dữ liệu từ Firebase."));
  });
}
