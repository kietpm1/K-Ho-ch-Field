"use strict";


/* ============================================================
   SUPABASE
============================================================ */

const SUPABASE_URL =
  "https://fgtdazkcdorobjthaffh.supabase.co";

const SUPABASE_ANON_KEY =
  "sb_publishable_7n94js70mGrGw5kqhdJiSQ_pzfz74bY";


const supabaseClient =
  window.supabase.createClient(
    SUPABASE_URL,
    SUPABASE_ANON_KEY
  );


/* ============================================================
   BIẾN
============================================================ */

let allData = [];

let filteredData = [];

let currentPage = 1;

const PAGE_SIZE = 20;


/* ============================================================
   DOM
============================================================ */

const loginBox =
  document.getElementById("loginBox");

const managerBox =
  document.getElementById("managerBox");

const loginForm =
  document.getElementById("loginForm");

const loginEmail =
  document.getElementById("loginEmail");

const loginPassword =
  document.getElementById("loginPassword");

const loginMessage =
  document.getElementById("loginMessage");

const logoutBtn =
  document.getElementById("logoutBtn");

const currentUser =
  document.getElementById("currentUser");

const filterDate =
  document.getElementById("filterDate");

const filterUser =
  document.getElementById("filterUser");

const searchText =
  document.getElementById("searchText");

const filterBtn =
  document.getElementById("filterBtn");

const refreshBtn =
  document.getElementById("refreshBtn");

const exportBtn =
  document.getElementById("exportBtn");

const dataTableBody =
  document.getElementById("dataTableBody");

const emptyMessage =
  document.getElementById("emptyMessage");

const prevBtn =
  document.getElementById("prevBtn");

const nextBtn =
  document.getElementById("nextBtn");

const pageInfo =
  document.getElementById("pageInfo");

const totalRecords =
  document.getElementById("totalRecords");

const totalCif =
  document.getElementById("totalCif");

const totalUsers =
  document.getElementById("totalUsers");

const editModal =
  document.getElementById("editModal");

const editForm =
  document.getElementById("editForm");

const editId =
  document.getElementById("editId");

const editCif =
  document.getElementById("editCif");

const editTenKh =
  document.getElementById("editTenKh");

const editUserCbXln =
  document.getElementById("editUserCbXln");

const editNgayField =
  document.getElementById("editNgayField");

const closeModalBtn =
  document.getElementById("closeModalBtn");

const cancelEditBtn =
  document.getElementById("cancelEditBtn");


/* ============================================================
   TẠO NÚT XÓA TẤT CẢ
   Không cần sửa manager.html
============================================================ */

let deleteAllBtn = null;


function createDeleteAllButton() {

  if (!exportBtn) {
    return;
  }


  // Không tạo trùng nút
  if (
    document.getElementById("deleteAllBtn")
  ) {

    deleteAllBtn =
      document.getElementById("deleteAllBtn");

    return;
  }


  deleteAllBtn =
    document.createElement("button");


  deleteAllBtn.id =
    "deleteAllBtn";


  deleteAllBtn.type =
    "button";


  deleteAllBtn.textContent =
    "🗑️ XÓA TẤT CẢ";


  /*
    Style trực tiếp để không cần sửa CSS
  */

  deleteAllBtn.style.width =
    "100%";

  deleteAllBtn.style.minHeight =
    "56px";

  deleteAllBtn.style.marginTop =
    "12px";

  deleteAllBtn.style.padding =
    "14px 18px";

  deleteAllBtn.style.border =
    "none";

  deleteAllBtn.style.borderRadius =
    "14px";

  deleteAllBtn.style.background =
    "#dc2626";

  deleteAllBtn.style.color =
    "#ffffff";

  deleteAllBtn.style.fontSize =
    "16px";

  deleteAllBtn.style.fontWeight =
    "800";

  deleteAllBtn.style.cursor =
    "pointer";

  deleteAllBtn.style.boxShadow =
    "0 6px 16px rgba(220, 38, 38, 0.20)";

  deleteAllBtn.style.transition =
    "all 0.2s ease";


  /*
    Đặt ngay dưới nút Xuất Excel
  */

  exportBtn.insertAdjacentElement(
    "afterend",
    deleteAllBtn
  );


  deleteAllBtn.addEventListener(
    "click",
    deleteAllData
  );

}


/* ============================================================
   FORMAT DATE
============================================================ */

function formatDate(dateString) {

  if (!dateString) {
    return "";
  }

  const parts =
    dateString.split("-");

  if (parts.length !== 3) {
    return dateString;
  }

  return `${parts[2]}/${parts[1]}/${parts[0]}`;
}


/* ============================================================
   ESCAPE HTML
============================================================ */

function escapeHtml(value) {

  if (
    value === null ||
    value === undefined
  ) {
    return "";
  }

  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}


/* ============================================================
   LOGIN MESSAGE
============================================================ */

function showLoginMessage(
  text,
  type = "error"
) {

  loginMessage.textContent =
    text;

  loginMessage.className =
    "message " + type;

}


/* ============================================================
   LOGIN
============================================================ */

loginForm.addEventListener(
  "submit",
  async function (event) {

    event.preventDefault();


    const email =
      loginEmail.value.trim();

    const password =
      loginPassword.value;


    if (!email || !password) {

      showLoginMessage(
        "Vui lòng nhập email và mật khẩu."
      );

      return;
    }


    try {

      const {
        data,
        error
      } =
        await supabaseClient.auth
          .signInWithPassword({
            email,
            password
          });


      if (error) {
        throw error;
      }


      if (!data.session) {

        throw new Error(
          "Không tạo được phiên đăng nhập."
        );

      }


      showManager(data.user);

      await loadData();


    } catch (error) {

      console.error(error);

      showLoginMessage(
        "Email hoặc mật khẩu không chính xác."
      );

    }

  }
);


/* ============================================================
   KIỂM TRA SESSION
============================================================ */

async function checkSession() {

  const {
    data: {
      session
    }
  } =
    await supabaseClient.auth.getSession();


  if (session) {

    showManager(session.user);

    await loadData();

  } else {

    showLogin();

  }

}


/* ============================================================
   HIỂN THỊ MANAGER
============================================================ */

function showManager(user) {

  loginBox.classList.add("hidden");

  managerBox.classList.remove("hidden");

  currentUser.textContent =
    user?.email || "";

}


/* ============================================================
   HIỂN THỊ LOGIN
============================================================ */

function showLogin() {

  managerBox.classList.add("hidden");

  loginBox.classList.remove("hidden");

}


/* ============================================================
   LOGOUT
============================================================ */

logoutBtn.addEventListener(
  "click",
  async function () {

    await supabaseClient.auth.signOut();

    allData = [];

    filteredData = [];

    showLogin();

  }
);


/* ============================================================
   LOAD DATA
============================================================ */

async function loadData() {

  try {

    dataTableBody.innerHTML = `
      <tr>
        <td colspan="5" class="loading">
          Đang tải dữ liệu...
        </td>
      </tr>
    `;


    const {
      data,
      error
    } =
      await supabaseClient
        .from("field_khach_hang")
        .select("*")
        .order("ngay_field", {
          ascending: false
        })
        .order("created_at", {
          ascending: false
        });


    if (error) {
      throw error;
    }


    allData =
      data || [];


    applyFilters();


  } catch (error) {

    console.error(error);

    dataTableBody.innerHTML = `
      <tr>
        <td colspan="5" class="error-cell">
          Không thể tải dữ liệu.
        </td>
      </tr>
    `;

  }

}


/* ============================================================
   APPLY FILTER
============================================================ */

function applyFilters() {

  const date =
    filterDate.value.trim();

  const user =
    filterUser.value
      .trim()
      .toLowerCase();

  const search =
    searchText.value
      .trim()
      .toLowerCase();


  filteredData =
    allData.filter(row => {

      const matchDate =
        !date ||
        row.ngay_field === date;


      const matchUser =
        !user ||
        String(row.user_cb_xln || "")
          .toLowerCase()
          .includes(user);


      const matchSearch =
        !search ||
        String(row.cif || "")
          .toLowerCase()
          .includes(search) ||
        String(row.ten_kh || "")
          .toLowerCase()
          .includes(search);


      return (
        matchDate &&
        matchUser &&
        matchSearch
      );

    });


  currentPage = 1;

  updateStats();

  renderTable();

}


/* ============================================================
   FILTER BUTTON
============================================================ */

filterBtn.addEventListener(
  "click",
  function () {

    applyFilters();

  }
);


/* ============================================================
   SEARCH ENTER
============================================================ */

searchText.addEventListener(
  "keydown",
  function (event) {

    if (event.key === "Enter") {

      applyFilters();

    }

  }
);


filterUser.addEventListener(
  "keydown",
  function (event) {

    if (event.key === "Enter") {

      applyFilters();

    }

  }
);


/* ============================================================
   REFRESH
============================================================ */

refreshBtn.addEventListener(
  "click",
  async function () {

    filterDate.value = "";

    filterUser.value = "";

    searchText.value = "";

    await loadData();

  }
);


/* ============================================================
   STATS
============================================================ */

function updateStats() {

  totalRecords.textContent =
    filteredData.length;


  const uniqueCif =
    new Set(
      filteredData
        .map(row =>
          String(row.cif || "").trim()
        )
        .filter(Boolean)
    );


  totalCif.textContent =
    uniqueCif.size;


  const uniqueUsers =
    new Set(
      filteredData
        .map(row =>
          String(
            row.user_cb_xln || ""
          ).trim()
        )
        .filter(Boolean)
    );


  totalUsers.textContent =
    uniqueUsers.size;

}


/* ============================================================
   RENDER TABLE
============================================================ */

function renderTable() {

  const totalPages =
    Math.max(
      1,
      Math.ceil(
        filteredData.length /
        PAGE_SIZE
      )
    );


  if (currentPage > totalPages) {

    currentPage =
      totalPages;

  }


  const start =
    (currentPage - 1) *
    PAGE_SIZE;


  const end =
    start + PAGE_SIZE;


  const pageData =
    filteredData.slice(
      start,
      end
    );


  dataTableBody.innerHTML =
    "";


  if (pageData.length === 0) {

    emptyMessage.classList.remove(
      "hidden"
    );

  } else {

    emptyMessage.classList.add(
      "hidden"
    );


    pageData.forEach(row => {

      const tr =
        document.createElement(
          "tr"
        );


      tr.innerHTML = `

        <td>
          ${escapeHtml(row.cif)}
        </td>

        <td>
          ${escapeHtml(row.ten_kh)}
        </td>

        <td>
          ${escapeHtml(row.user_cb_xln)}
        </td>

        <td>
          ${formatDate(row.ngay_field)}
        </td>

        <td>

          <div class="action-buttons">

            <button
              class="icon-btn edit-btn"
              data-id="${row.id}"
              title="Sửa"
            >
              ✏️
            </button>

            <button
              class="icon-btn delete-btn"
              data-id="${row.id}"
              title="Xóa"
            >
              🗑️
            </button>

          </div>

        </td>

      `;


      dataTableBody.appendChild(
        tr
      );

    });

  }


  pageInfo.textContent =
    `Trang ${currentPage} / ${totalPages}`;


  prevBtn.disabled =
    currentPage <= 1;


  nextBtn.disabled =
    currentPage >= totalPages;

}


/* ============================================================
   PAGINATION
============================================================ */

prevBtn.addEventListener(
  "click",
  function () {

    if (currentPage > 1) {

      currentPage--;

      renderTable();

    }

  }
);


nextBtn.addEventListener(
  "click",
  function () {

    const totalPages =
      Math.max(
        1,
        Math.ceil(
          filteredData.length /
          PAGE_SIZE
        )
      );


    if (
      currentPage <
      totalPages
    ) {

      currentPage++;

      renderTable();

    }

  }
);


/* ============================================================
   TABLE ACTION
============================================================ */

dataTableBody.addEventListener(
  "click",
  async function (event) {

    const editButton =
      event.target.closest(
        ".edit-btn"
      );

    const deleteButton =
      event.target.closest(
        ".delete-btn"
      );


    if (editButton) {

      const id =
        Number(
          editButton.dataset.id
        );

      openEditModal(id);

      return;

    }


    if (deleteButton) {

      const id =
        Number(
          deleteButton.dataset.id
        );

      await deleteRecord(id);

    }

  }
);


/* ============================================================
   OPEN EDIT MODAL
============================================================ */

function openEditModal(id) {

  const row =
    allData.find(
      item =>
        Number(item.id) === id
    );


  if (!row) {
    return;
  }


  editId.value =
    row.id;

  editCif.value =
    row.cif || "";

  editTenKh.value =
    row.ten_kh || "";

  editUserCbXln.value =
    row.user_cb_xln || "";

  editNgayField.value =
    row.ngay_field || "";


  editModal.classList.remove(
    "hidden"
  );

}


/* ============================================================
   CLOSE MODAL
============================================================ */

function closeEditModal() {

  editModal.classList.add(
    "hidden"
  );

}


closeModalBtn.addEventListener(
  "click",
  closeEditModal
);


cancelEditBtn.addEventListener(
  "click",
  closeEditModal
);


/* ============================================================
   EDIT
============================================================ */

editForm.addEventListener(
  "submit",
  async function (event) {

    event.preventDefault();


    const id =
      Number(editId.value);


    const updateData = {

      cif:
        editCif.value.trim(),

      ten_kh:
        editTenKh.value.trim(),

      user_cb_xln:
        editUserCbXln.value.trim(),

      ngay_field:
        editNgayField.value

    };


    if (
      !updateData.cif ||
      !updateData.ten_kh ||
      !updateData.user_cb_xln ||
      !updateData.ngay_field
    ) {

      alert(
        "Vui lòng nhập đầy đủ thông tin."
      );

      return;

    }


    try {

      const {
        error
      } =
        await supabaseClient
          .from(
            "field_khach_hang"
          )
          .update(
            updateData
          )
          .eq(
            "id",
            id
          );


      if (error) {
        throw error;
      }


      closeEditModal();

      await loadData();


      alert(
        "Đã cập nhật dữ liệu."
      );


    } catch (error) {

      console.error(error);

      alert(
        "Không thể cập nhật dữ liệu."
      );

    }

  }
);


/* ============================================================
   DELETE TỪNG DÒNG
============================================================ */

async function deleteRecord(id) {

  const row =
    allData.find(
      item =>
        Number(item.id) === id
    );


  if (!row) {
    return;
  }


  const confirmed =
    confirm(
      `Bạn có chắc muốn xóa dữ liệu của "${row.ten_kh}" không?`
    );


  if (!confirmed) {
    return;
  }


  try {

    const {
      error
    } =
      await supabaseClient
        .from(
          "field_khach_hang"
        )
        .delete()
        .eq(
          "id",
          id
        );


    if (error) {
      throw error;
    }


    await loadData();


  } catch (error) {

    console.error(error);

    alert(
      "Không thể xóa dữ liệu."
    );

  }

}


/* ============================================================
   XÓA TẤT CẢ DỮ LIỆU
============================================================ */

async function deleteAllData() {

  /*
    Kiểm tra dữ liệu hiện tại
  */

  if (allData.length === 0) {

    alert(
      "Hiện tại không có dữ liệu để xóa."
    );

    return;
  }


  /*
    Xác nhận lần 1
  */

  const confirmed =
    confirm(
      `⚠️ CẢNH BÁO\n\n` +
      `Bạn đang chuẩn bị xóa TOÀN BỘ ${allData.length} dữ liệu field.\n\n` +
      `Hành động này không thể hoàn tác.\n\n` +
      `Bạn có chắc chắn muốn tiếp tục không?`
    );


  if (!confirmed) {
    return;
  }


  /*
    Xác nhận lần 2
  */

  const confirmText =
    prompt(
      `Để xác nhận xóa toàn bộ dữ liệu, hãy nhập:\n\nXOA TAT CA`
    );


  if (
    confirmText === null ||
    confirmText.trim()
      .toUpperCase() !==
      "XOA TAT CA"
  ) {

    alert(
      "Đã hủy thao tác xóa toàn bộ."
    );

    return;
  }


  /*
    Khóa nút
  */

  deleteAllBtn.disabled =
    true;

  deleteAllBtn.textContent =
    "ĐANG XÓA...";


  try {

    /*
      id của bảng là bigint identity
      nên dùng điều kiện id >= 0
      để Supabase thực hiện DELETE
      trên toàn bộ bản ghi.
    */

    const {
      error
    } =
      await supabaseClient
        .from(
          "field_khach_hang"
        )
        .delete()
        .gte(
          "id",
          0
        );


    if (error) {
      throw error;
    }


    /*
      Xóa dữ liệu trên bộ nhớ trình duyệt
    */

    allData = [];

    filteredData = [];

    currentPage = 1;


    /*
      Cập nhật giao diện ngay
    */

    updateStats();

    renderTable();


    /*
      Đảm bảo dữ liệu thực tế
      trên Supabase đã được tải lại
    */

    await loadData();


    alert(
      "✅ Đã xóa toàn bộ dữ liệu field thành công."
    );


  } catch (error) {

    console.error(
      "Lỗi xóa tất cả:",
      error
    );


    alert(
      "❌ Không thể xóa toàn bộ dữ liệu.\n\n" +
      "Vui lòng kiểm tra quyền DELETE trong Supabase."
    );


  } finally {

    deleteAllBtn.disabled =
      false;

    deleteAllBtn.textContent =
      "🗑️ XÓA TẤT CẢ";

  }

}


/* ============================================================
   EXPORT EXCEL
============================================================ */

exportBtn.addEventListener(
  "click",
  function () {

    if (
      filteredData.length === 0
    ) {

      alert(
        "Không có dữ liệu để xuất."
      );

      return;
    }


    const exportData =
      filteredData.map(row => ({

        "CIF":
          row.cif || "",

        "Tên KH":
          row.ten_kh || "",

        "User CBXLN":
          row.user_cb_xln || "",

        "Ngày field":
          formatDate(
            row.ngay_field
          )

      }));


    const worksheet =
      XLSX.utils.json_to_sheet(
        exportData
      );


    worksheet["!cols"] = [

      {
        wch: 18
      },

      {
        wch: 35
      },

      {
        wch: 20
      },

      {
        wch: 15
      }

    ];


    const workbook =
      XLSX.utils.book_new();


    XLSX.utils.book_append_sheet(
      workbook,
      worksheet,
      "Dữ Liệu Field"
    );


    const now =
      new Date();


    const yyyy =
      now.getFullYear();


    const mm =
      String(
        now.getMonth() + 1
      ).padStart(
        2,
        "0"
      );


    const dd =
      String(
        now.getDate()
      ).padStart(
        2,
        "0"
      );


    const filename =
      `DU_LIEU_FIELD_${yyyy}${mm}${dd}.xlsx`;


    XLSX.writeFile(
      workbook,
      filename
    );

  }
);


/* ============================================================
   CLOSE MODAL KHI CLICK NGOÀI
============================================================ */

editModal.addEventListener(
  "click",
  function (event) {

    if (
      event.target === editModal
    ) {

      closeEditModal();

    }

  }
);


/* ============================================================
   START
============================================================ */

/*
  Tạo nút XÓA TẤT CẢ
*/

createDeleteAllButton();


/*
  Kiểm tra đăng nhập
*/

checkSession();
