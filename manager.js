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

let editingId = null;


/* ============================================================
   ELEMENT
============================================================ */

/* LOGIN */

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

const currentUser =
  document.getElementById("currentUser");


/* LOGOUT */

const logoutBtn =
  document.getElementById("logoutBtn");


/* STATS */

const totalRecords =
  document.getElementById("totalRecords");

const totalCif =
  document.getElementById("totalCif");

const totalUsers =
  document.getElementById("totalUsers");


/* FILTER */

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


/* TABLE */

const dataTableBody =
  document.getElementById("dataTableBody");

const emptyMessage =
  document.getElementById("emptyMessage");


/* PAGINATION */

const prevBtn =
  document.getElementById("prevBtn");

const nextBtn =
  document.getElementById("nextBtn");

const pageInfo =
  document.getElementById("pageInfo");


/* MODAL */

const editModal =
  document.getElementById("editModal");

const closeModalBtn =
  document.getElementById("closeModalBtn");

const cancelEditBtn =
  document.getElementById("cancelEditBtn");

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


/* ============================================================
   HIỂN THỊ LOGIN
============================================================ */

function showLogin() {

  if (loginBox) {
    loginBox.classList.remove("hidden");
  }

  if (managerBox) {
    managerBox.classList.add("hidden");
  }

}


/* ============================================================
   HIỂN THỊ MANAGER
============================================================ */

function showManager() {

  if (loginBox) {
    loginBox.classList.add("hidden");
  }

  if (managerBox) {
    managerBox.classList.remove("hidden");
  }

}


/* ============================================================
   LOGIN MESSAGE
============================================================ */

function showLoginMessage(message) {

  if (!loginMessage) {
    return;
  }

  loginMessage.textContent =
    message || "";

  loginMessage.classList.remove(
    "hidden"
  );

}


function hideLoginMessage() {

  if (!loginMessage) {
    return;
  }

  loginMessage.textContent = "";

  loginMessage.classList.add(
    "hidden"
  );

}


/* ============================================================
   FORMAT NGÀY
============================================================ */

function formatDate(value) {

  if (!value) {
    return "";
  }

  const text =
    String(value);

  const match =
    text.match(
      /^(\d{4})-(\d{2})-(\d{2})/
    );

  if (match) {

    return (
      match[3] +
      "/" +
      match[2] +
      "/" +
      match[1]
    );

  }

  const date =
    new Date(value);

  if (
    isNaN(
      date.getTime()
    )
  ) {

    return text;

  }

  const day =
    String(
      date.getDate()
    ).padStart(
      2,
      "0"
    );

  const month =
    String(
      date.getMonth() + 1
    ).padStart(
      2,
      "0"
    );

  const year =
    date.getFullYear();

  return (
    day +
    "/" +
    month +
    "/" +
    year
  );

}


/* ============================================================
   ESCAPE HTML
============================================================ */

function escapeHtml(value) {

  return String(
    value ?? ""
  )
    .replaceAll(
      "&",
      "&amp;"
    )
    .replaceAll(
      "<",
      "&lt;"
    )
    .replaceAll(
      ">",
      "&gt;"
    )
    .replaceAll(
      '"',
      "&quot;"
    )
    .replaceAll(
      "'",
      "&#039;"
    );

}


/* ============================================================
   NORMALIZE TEXT
============================================================ */

function normalizeText(value) {

  return String(
    value ?? ""
  )
    .trim()
    .toLowerCase();

}


/* ============================================================
   KIỂM TRA SESSION
============================================================ */

async function checkSession() {

  try {

    const {
      data,
      error
    } =
      await supabaseClient.auth.getSession();


    if (error) {

      console.error(
        "Lỗi kiểm tra session:",
        error
      );

      showLogin();

      return;

    }


    if (
      data &&
      data.session
    ) {

      showManager();


      if (currentUser) {

        currentUser.textContent =
          data.session.user.email ||
          "";

      }


      await loadData();

    } else {

      showLogin();

    }

  } catch (error) {

    console.error(
      error
    );

    showLogin();

  }

}


/* ============================================================
   ĐĂNG NHẬP
============================================================ */

if (loginForm) {

  loginForm.addEventListener(
    "submit",
    async function (event) {

      event.preventDefault();

      hideLoginMessage();


      const email =
        loginEmail
          ? loginEmail.value.trim()
          : "";

      const password =
        loginPassword
          ? loginPassword.value
          : "";


      if (
        !email ||
        !password
      ) {

        showLoginMessage(
          "Vui lòng nhập Email và mật khẩu."
        );

        return;

      }


      const button =
        loginForm.querySelector(
          'button[type="submit"]'
        );


      if (button) {

        button.disabled =
          true;

        button.textContent =
          "ĐANG ĐĂNG NHẬP...";

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

          console.error(
            "Login error:",
            error
          );

          showLoginMessage(
            "Email hoặc mật khẩu không đúng."
          );

          return;

        }


        if (
          data &&
          data.session
        ) {

          showManager();


          if (currentUser) {

            currentUser.textContent =
              data.session.user.email ||
              "";

          }


          await loadData();

        }

      } catch (error) {

        console.error(
          error
        );

        showLoginMessage(
          "Có lỗi xảy ra khi đăng nhập."
        );

      } finally {

        if (button) {

          button.disabled =
            false;

          button.textContent =
            "ĐĂNG NHẬP";

        }

      }

    }
  );

}


/* ============================================================
   ĐĂNG XUẤT
============================================================ */

if (logoutBtn) {

  logoutBtn.addEventListener(
    "click",
    async function () {

      try {

        const {
          error
        } =
          await supabaseClient.auth
            .signOut();


        if (error) {

          alert(
            "Không thể đăng xuất: " +
            error.message
          );

          return;

        }


        allData = [];

        filteredData = [];

        currentPage = 1;

        showLogin();

      } catch (error) {

        console.error(
          error
        );

        alert(
          "Có lỗi khi đăng xuất."
        );

      }

    }
  );

}


/* ============================================================
   LOAD DATA
============================================================ */

async function loadData() {

  try {

    if (dataTableBody) {

      dataTableBody.innerHTML = `
        <tr>
          <td
            colspan="5"
            style="
              text-align:center;
              padding:25px;
            "
          >
            Đang tải dữ liệu...
          </td>
        </tr>
      `;

    }


    const {
      data,
      error
    } =
      await supabaseClient
        .from(
          "field_khach_hang"
        )
        .select("*")
        .order(
          "ngay_field",
          {
            ascending: false
          }
        )
        .order(
          "created_at",
          {
            ascending: false
          }
        );


    if (error) {

      console.error(
        "Không thể tải dữ liệu:",
        error
      );

      alert(
        "Không thể tải dữ liệu:\n" +
        error.message
      );

      return;

    }


    allData =
      data || [];


    applyFilters();

  } catch (error) {

    console.error(
      error
    );

    alert(
      "Có lỗi xảy ra khi tải dữ liệu."
    );

  }

}


/* ============================================================
   APPLY FILTERS
============================================================ */

function applyFilters() {

  const selectedDate =
    filterDate
      ? filterDate.value
      : "";


  const userKeyword =
    filterUser
      ? normalizeText(
          filterUser.value
        )
      : "";


  const searchKeyword =
    searchText
      ? normalizeText(
          searchText.value
        )
      : "";


  filteredData =
    allData.filter(
      function (row) {

        /* NGÀY */

        const rowDate =
          String(
            row.ngay_field || ""
          ).substring(
            0,
            10
          );


        const matchDate =
          !selectedDate ||
          rowDate ===
          selectedDate;


        /* CBXLN */

        const user =
          normalizeText(
            row.user_cb_xln
          );


        const matchUser =
          !userKeyword ||
          user.includes(
            userKeyword
          );


        /* CIF / TÊN KH */

        const cif =
          normalizeText(
            row.cif
          );


        const tenKh =
          normalizeText(
            row.ten_kh
          );


        const matchSearch =
          !searchKeyword ||
          cif.includes(
            searchKeyword
          ) ||
          tenKh.includes(
            searchKeyword
          );


        return (
          matchDate &&
          matchUser &&
          matchSearch
        );

      }
    );


  currentPage = 1;

  updateStats();

  renderTable();

  renderPagination();

}


/* ============================================================
   NÚT LỌC
============================================================ */

if (filterBtn) {

  filterBtn.addEventListener(
    "click",
    function () {

      applyFilters();

    }
  );

}


/* ============================================================
   ENTER ĐỂ LỌC
============================================================ */

[
  filterUser,
  searchText
].forEach(
  function (element) {

    if (!element) {
      return;
    }


    element.addEventListener(
      "keydown",
      function (event) {

        if (
          event.key ===
          "Enter"
        ) {

          event.preventDefault();

          applyFilters();

        }

      }
    );

  }
);


/* ============================================================
   LÀM MỚI
============================================================ */

if (refreshBtn) {

  refreshBtn.addEventListener(
    "click",
    async function () {

      refreshBtn.disabled =
        true;

      const oldText =
        refreshBtn.textContent;

      refreshBtn.textContent =
        "ĐANG TẢI...";


      try {

        await loadData();

      } finally {

        refreshBtn.disabled =
          false;

        refreshBtn.textContent =
          oldText;

      }

    }
  );

}


/* ============================================================
   THỐNG KÊ
============================================================ */

function updateStats() {

  /* TỔNG HỒ SƠ */

  if (totalRecords) {

    totalRecords.textContent =
      filteredData.length;

  }


  /* SỐ CIF KHÔNG TRÙNG */

  const cifSet =
    new Set();


  filteredData.forEach(
    function (row) {

      const cif =
        String(
          row.cif || ""
        ).trim();


      if (cif) {

        cifSet.add(
          cif
        );

      }

    }
  );


  if (totalCif) {

    totalCif.textContent =
      cifSet.size;

  }


  /* SỐ CÁN BỘ KHÔNG TRÙNG */

  const userSet =
    new Set();


  filteredData.forEach(
    function (row) {

      const user =
        String(
          row.user_cb_xln || ""
        ).trim();


      if (user) {

        userSet.add(
          user
        );

      }

    }
  );


  if (totalUsers) {

    totalUsers.textContent =
      userSet.size;

  }

}


/* ============================================================
   RENDER TABLE
============================================================ */

function renderTable() {

  if (!dataTableBody) {
    return;
  }


  dataTableBody.innerHTML = "";


  if (
    filteredData.length ===
    0
  ) {

    if (emptyMessage) {

      emptyMessage.classList.remove(
        "hidden"
      );

    }

    return;

  }


  if (emptyMessage) {

    emptyMessage.classList.add(
      "hidden"
    );

  }


  const start =
    (
      currentPage - 1
    ) *
    PAGE_SIZE;


  const end =
    start +
    PAGE_SIZE;


  const pageData =
    filteredData.slice(
      start,
      end
    );


  pageData.forEach(
    function (row) {

      const tr =
        document.createElement(
          "tr"
        );


      tr.innerHTML = `

        <td>
          ${escapeHtml(
            row.cif || ""
          )}
        </td>

        <td>
          ${escapeHtml(
            row.ten_kh || ""
          )}
        </td>

        <td>
          ${escapeHtml(
            row.user_cb_xln || ""
          )}
        </td>

        <td>
          ${formatDate(
            row.ngay_field
          )}
        </td>

        <td>

          <div class="action-buttons">

            <button
              type="button"
              class="btn btn-primary btn-edit"
              data-id="${escapeHtml(
                row.id
              )}"
            >
              ✏️
            </button>

            <button
              type="button"
              class="btn btn-danger btn-delete"
              data-id="${escapeHtml(
                row.id
              )}"
            >
              🗑️
            </button>

          </div>

        </td>

      `;


      dataTableBody.appendChild(
        tr
      );

    }
  );


  /* SỬA */

  dataTableBody
    .querySelectorAll(
      ".btn-edit"
    )
    .forEach(
      function (button) {

        button.addEventListener(
          "click",
          function () {

            openEditModal(
              button.dataset.id
            );

          }
        );

      }
    );


  /* XÓA */

  dataTableBody
    .querySelectorAll(
      ".btn-delete"
    )
    .forEach(
      function (button) {

        button.addEventListener(
          "click",
          async function () {

            await deleteRow(
              button.dataset.id
            );

          }
        );

      }
    );

}


/* ============================================================
   PHÂN TRANG
============================================================ */

function renderPagination() {

  const totalPages =
    Math.max(
      1,
      Math.ceil(
        filteredData.length /
        PAGE_SIZE
      )
    );


  if (
    currentPage >
    totalPages
  ) {

    currentPage =
      totalPages;

  }


  if (pageInfo) {

    pageInfo.textContent =
      `Trang ${currentPage}`;

  }


  if (prevBtn) {

    prevBtn.disabled =
      currentPage <= 1;

  }


  if (nextBtn) {

    nextBtn.disabled =
      currentPage >=
      totalPages;

  }

}


/* ============================================================
   TRANG TRƯỚC
============================================================ */

if (prevBtn) {

  prevBtn.addEventListener(
    "click",
    function () {

      if (
        currentPage <= 1
      ) {

        return;

      }


      currentPage--;

      renderTable();

      renderPagination();

    }
  );

}


/* ============================================================
   TRANG SAU
============================================================ */

if (nextBtn) {

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
        currentPage >=
        totalPages
      ) {

        return;

      }


      currentPage++;

      renderTable();

      renderPagination();

    }
  );

}


/* ============================================================
   MỞ MODAL SỬA
============================================================ */

function openEditModal(id) {

  const row =
    allData.find(
      function (item) {

        return String(
          item.id
        ) ===
        String(id);

      }
    );


  if (!row) {

    alert(
      "Không tìm thấy dữ liệu."
    );

    return;

  }


  editingId =
    id;


  if (editId) {

    editId.value =
      row.id || "";

  }


  if (editCif) {

    editCif.value =
      row.cif || "";

  }


  if (editTenKh) {

    editTenKh.value =
      row.ten_kh || "";

  }


  if (editUserCbXln) {

    editUserCbXln.value =
      row.user_cb_xln || "";

  }


  if (editNgayField) {

    editNgayField.value =
      String(
        row.ngay_field || ""
      ).substring(
        0,
        10
      );

  }


  if (editModal) {

    editModal.classList.remove(
      "hidden"
    );

    editModal.style.display =
      "flex";

  }

}


/* ============================================================
   ĐÓNG MODAL
============================================================ */

function closeEditModal() {

  editingId =
    null;


  if (editModal) {

    editModal.classList.add(
      "hidden"
    );

    editModal.style.display =
      "";

  }

}


if (closeModalBtn) {

  closeModalBtn.addEventListener(
    "click",
    closeEditModal
  );

}


if (cancelEditBtn) {

  cancelEditBtn.addEventListener(
    "click",
    closeEditModal
  );

}


/* ============================================================
   CLICK NGOÀI MODAL
============================================================ */

if (editModal) {

  editModal.addEventListener(
    "click",
    function (event) {

      if (
        event.target ===
        editModal
      ) {

        closeEditModal();

      }

    }
  );

}


/* ============================================================
   LƯU SỬA
============================================================ */

if (editForm) {

  editForm.addEventListener(
    "submit",
    async function (event) {

      event.preventDefault();


      if (!editingId) {

        alert(
          "Không xác định được dữ liệu cần sửa."
        );

        return;

      }


      const cif =
        editCif
          ? editCif.value.trim()
          : "";


      const tenKh =
        editTenKh
          ? editTenKh.value.trim()
          : "";


      const userCbXln =
        editUserCbXln
          ? editUserCbXln.value.trim()
          : "";


      const ngayField =
        editNgayField
          ? editNgayField.value
          : "";


      if (
        !cif ||
        !tenKh ||
        !userCbXln ||
        !ngayField
      ) {

        alert(
          "Vui lòng nhập đầy đủ thông tin."
        );

        return;

      }


      const saveButton =
        editForm.querySelector(
          'button[type="submit"]'
        );


      if (saveButton) {

        saveButton.disabled =
          true;

        saveButton.textContent =
          "ĐANG LƯU...";

      }


      try {

        const updateData = {

          cif:
            cif,

          ten_kh:
            tenKh,

          user_cb_xln:
            userCbXln,

          ngay_field:
            ngayField

        };


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
              editingId
            );


        if (error) {

          console.error(
            "Update error:",
            error
          );

          alert(
            "Không thể cập nhật:\n" +
            error.message
          );

          return;

        }


        alert(
          "Đã cập nhật dữ liệu."
        );


        closeEditModal();

        await loadData();

      } catch (error) {

        console.error(
          error
        );

        alert(
          "Có lỗi xảy ra khi cập nhật."
        );

      } finally {

        if (saveButton) {

          saveButton.disabled =
            false;

          saveButton.textContent =
            "LƯU THAY ĐỔI";

        }

      }

    }
  );

}


/* ============================================================
   XÓA 1 DÒNG
============================================================ */

async function deleteRow(id) {

  const row =
    allData.find(
      function (item) {

        return String(
          item.id
        ) ===
        String(id);

      }
    );


  if (!row) {

    alert(
      "Không tìm thấy dữ liệu."
    );

    return;

  }


  const confirmed =
    confirm(
      "Bạn có chắc muốn xóa dữ liệu này?\n\n" +
      "CIF: " +
      (row.cif || "") +
      "\n" +
      "Tên KH: " +
      (row.ten_kh || "") +
      "\n" +
      "CBXLN: " +
      (row.user_cb_xln || "")
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

      console.error(
        "Delete error:",
        error
      );

      alert(
        "Không thể xóa:\n" +
        error.message
      );

      return;

    }


    await loadData();

  } catch (error) {

    console.error(
      error
    );

    alert(
      "Có lỗi xảy ra khi xóa."
    );

  }

}


/* ============================================================
   XUẤT EXCEL - BẢN BAN ĐẦU
   KHÔNG EXCELJS
   KHÔNG TÔ MÀU
   KHÔNG KẺ BẢNG
   KHÔNG CĂN CHỈNH
============================================================ */

if (exportBtn) {

  exportBtn.addEventListener(
    "click",
    function () {

      if (
        filteredData.length ===
        0
      ) {

        alert(
          "Không có dữ liệu để xuất."
        );

        return;

      }


      if (
        typeof XLSX ===
        "undefined"
      ) {

        alert(
          "Không tải được thư viện Excel."
        );

        return;

      }


      const exportData =
        filteredData.map(
          function (row) {

            return {

              "CIF":
                row.cif || "",

              "Tên KH":
                row.ten_kh || "",

              "CBXLN":
                row.user_cb_xln || "",

              "Ngày field":
                formatDate(
                  row.ngay_field
                )

            };

          }
        );


      const worksheet =
        XLSX.utils.json_to_sheet(
          exportData
        );


      /* ĐỘ RỘNG CỘT - BẢN GỐC */

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
        "KẾ HOẠCH FIELD NGÀY"
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
        `KE_HOACH_FIELD_NGAY_${yyyy}${mm}${dd}.xlsx`;


      XLSX.writeFile(
        workbook,
        filename
      );

    }
  );

}


/* ============================================================
   ESC ĐỂ ĐÓNG MODAL
============================================================ */

document.addEventListener(
  "keydown",
  function (event) {

    if (
      event.key ===
      "Escape"
    ) {

      closeEditModal();

    }

  }
);


/* ============================================================
   AUTH STATE
============================================================ */

supabaseClient.auth.onAuthStateChange(
  function (
    event,
    session
  ) {

    if (session) {

      showManager();


      if (currentUser) {

        currentUser.textContent =
          session.user.email ||
          "";

      }

    } else {

      showLogin();

    }

  }
);


/* ============================================================
   KHỞI ĐỘNG
============================================================ */

checkSession();
