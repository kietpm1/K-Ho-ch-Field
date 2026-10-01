"use strict";

/* ============================================================
   QUẢN LÝ DỮ LIỆU FIELD - MANAGER.JS
   ============================================================

   SUPABASE TABLE:
   field_khach_hang

   DATABASE COLUMNS:
   - id
   - cif
   - ten_kh
   - user_cb_xln
   - ngay_field
   - created_at

   CHỨC NĂNG:
   - Đăng nhập Supabase Auth
   - Hiển thị email quản lý
   - Lọc ngày field
   - Lọc CBXLN
   - Tìm CIF / Tên KH
   - Làm mới
   - Sửa
   - Xóa
   - Phân trang
   - Thống kê
   - Xuất Excel
   - Excel tự tô màu header
   - Excel tự kẻ bảng
============================================================ */


/* ============================================================
   1. SUPABASE
============================================================ */

const SUPABASE_URL =
  "https://fgtdazkcdorobjthaffh.supabase.co";

const SUPABASE_ANON_KEY =
  "sb_publishable_7n94js70mGrGw5kqhdJiSQ_pzfz74Yb";

const supabaseClient =
  window.supabase.createClient(
    SUPABASE_URL,
    SUPABASE_ANON_KEY
  );


/* ============================================================
   2. BIẾN TOÀN CỤC
============================================================ */

let allData = [];

let filteredData = [];

let currentPage = 1;

const PAGE_SIZE = 20;

let editingId = null;


/* ============================================================
   3. LẤY ELEMENT TỪ HTML
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


/* HEADER */

const logoutBtn =
  document.getElementById("logoutBtn");


/* THỐNG KÊ */

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
   4. HỖ TRỢ HIỂN THỊ LOGIN / MANAGER
============================================================ */

function showLogin() {

  if (loginBox) {
    loginBox.classList.remove("hidden");
  }

  if (managerBox) {
    managerBox.classList.add("hidden");
  }

}


function showManager() {

  if (loginBox) {
    loginBox.classList.add("hidden");
  }

  if (managerBox) {
    managerBox.classList.remove("hidden");
  }

}


/* ============================================================
   5. HIỂN THỊ MESSAGE LOGIN
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


/* ============================================================
   6. ẨN MESSAGE LOGIN
============================================================ */

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
   7. FORMAT NGÀY
============================================================ */

function formatDate(value) {

  if (!value) {
    return "";
  }

  /*
   * Nếu đã là YYYY-MM-DD
   * thì xử lý trực tiếp.
   */

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
   8. ESCAPE HTML
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
   9. FORMAT TEXT SEARCH
============================================================ */

function normalizeText(value) {

  return String(
    value ?? ""
  )
    .trim()
    .toLowerCase();

}


/* ============================================================
   10. KIỂM TRA SESSION
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
      "checkSession:",
      error
    );

    showLogin();

  }

}


/* ============================================================
   11. ĐĂNG NHẬP
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


      const submitButton =
        loginForm.querySelector(
          'button[type="submit"]'
        );


      if (submitButton) {

        submitButton.disabled =
          true;

        submitButton.textContent =
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
          "Đã xảy ra lỗi khi đăng nhập."
        );

      } finally {

        if (submitButton) {

          submitButton.disabled =
            false;

          submitButton.textContent =
            "ĐĂNG NHẬP";

        }

      }

    }
  );

}


/* ============================================================
   12. ĐĂNG XUẤT
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

          console.error(
            "Logout error:",
            error
          );

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
   13. LOAD DỮ LIỆU TỪ SUPABASE
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
        "Supabase load error:",
        error
      );

      alert(
        "Không thể tải dữ liệu:\n" +
        error.message
      );

      return;

    }


    allData =
      Array.isArray(data)
        ? data
        : [];


    applyFilters();

  } catch (error) {

    console.error(
      "loadData:",
      error
    );

    alert(
      "Có lỗi xảy ra khi tải dữ liệu."
    );

  }

}


/* ============================================================
   14. ÁP DỤNG BỘ LỌC
============================================================ */

function applyFilters() {

  const dateValue =
    filterDate
      ? filterDate.value
      : "";


  const userValue =
    filterUser
      ? normalizeText(
          filterUser.value
        )
      : "";


  const searchValue =
    searchText
      ? normalizeText(
          searchText.value
        )
      : "";


  filteredData =
    allData.filter(
      function (row) {

        /* ----------------------------------------------------
           LỌC NGÀY
        ---------------------------------------------------- */

        const matchDate =
          !dateValue ||
          String(
            row.ngay_field || ""
          )
            .substring(
              0,
              10
            ) === dateValue;


        /* ----------------------------------------------------
           LỌC CBXLN
        ---------------------------------------------------- */

        const cbxln =
          normalizeText(
            row.user_cb_xln
          );


        const matchUser =
          !userValue ||
          cbxln.includes(
            userValue
          );


        /* ----------------------------------------------------
           TÌM CIF / TÊN KH
        ---------------------------------------------------- */

        const cif =
          normalizeText(
            row.cif
          );

        const tenKh =
          normalizeText(
            row.ten_kh
          );


        const matchSearch =
          !searchValue ||
          cif.includes(
            searchValue
          ) ||
          tenKh.includes(
            searchValue
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
   15. NÚT LỌC
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
   16. ENTER TRONG Ô TÌM KIẾM
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
   17. LÀM MỚI
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
   18. THỐNG KÊ
============================================================ */

function updateStats() {

  /* ----------------------------------------------------------
     TỔNG HỒ SƠ
  ---------------------------------------------------------- */

  if (totalRecords) {

    totalRecords.textContent =
      filteredData.length;

  }


  /* ----------------------------------------------------------
     SỐ CIF KHÔNG TRÙNG
  ---------------------------------------------------------- */

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


  /* ----------------------------------------------------------
     SỐ CÁN BỘ KHÔNG TRÙNG
  ---------------------------------------------------------- */

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
   19. RENDER TABLE
============================================================ */

function renderTable() {

  if (!dataTableBody) {
    return;
  }


  dataTableBody.innerHTML = "";


  if (
    filteredData.length === 0
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


  const startIndex =
    (
      currentPage - 1
    ) *
    PAGE_SIZE;


  const endIndex =
    startIndex +
    PAGE_SIZE;


  const pageData =
    filteredData.slice(
      startIndex,
      endIndex
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

          <div
            class="action-buttons"
          >

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


  /* ----------------------------------------------------------
     GÁN SỰ KIỆN SỬA
  ---------------------------------------------------------- */

  dataTableBody
    .querySelectorAll(
      ".btn-edit"
    )
    .forEach(
      function (button) {

        button.addEventListener(
          "click",
          function () {

            const id =
              button.dataset.id;

            openEditModal(
              id
            );

          }
        );

      }
    );


  /* ----------------------------------------------------------
     GÁN SỰ KIỆN XÓA
  ---------------------------------------------------------- */

  dataTableBody
    .querySelectorAll(
      ".btn-delete"
    )
    .forEach(
      function (button) {

        button.addEventListener(
          "click",
          async function () {

            const id =
              button.dataset.id;

            await deleteRow(
              id
            );

          }
        );

      }
    );

}


/* ============================================================
   20. PHÂN TRANG
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


  if (currentPage > totalPages) {

    currentPage =
      totalPages;

  }


  if (pageInfo) {

    pageInfo.textContent =
      `Trang ${currentPage} / ${totalPages}`;

  }


  if (prevBtn) {

    prevBtn.disabled =
      currentPage <= 1;

  }


  if (nextBtn) {

    nextBtn.disabled =
      currentPage >= totalPages;

  }

}


/* ============================================================
   21. TRANG TRƯỚC
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


      window.scrollTo({
        top: 0,
        behavior: "smooth"
      });

    }
  );

}


/* ============================================================
   22. TRANG SAU
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


      window.scrollTo({
        top: 0,
        behavior: "smooth"
      });

    }
  );

}


/* ============================================================
   23. MỞ MODAL SỬA
============================================================ */

function openEditModal(id) {

  const row =
    allData.find(
      function (item) {

        return String(
          item.id
        ) === String(id);

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
   24. ĐÓNG MODAL
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


/* ============================================================
   25. NÚT ĐÓNG MODAL
============================================================ */

if (closeModalBtn) {

  closeModalBtn.addEventListener(
    "click",
    function () {

      closeEditModal();

    }
  );

}


if (cancelEditBtn) {

  cancelEditBtn.addEventListener(
    "click",
    function () {

      closeEditModal();

    }
  );

}


/* ============================================================
   26. CLICK NGOÀI MODAL
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
   27. LƯU SỬA
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
          "save edit:",
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
   28. XÓA MỘT DÒNG
============================================================ */

async function deleteRow(id) {

  const row =
    allData.find(
      function (item) {

        return String(
          item.id
        ) === String(id);

      }
    );


  if (!row) {

    alert(
      "Không tìm thấy dữ liệu."
    );

    return;

  }


  const confirmDelete =
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


  if (!confirmDelete) {

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
      "deleteRow:",
      error
    );

    alert(
      "Có lỗi xảy ra khi xóa."
    );

  }

}


/* ============================================================
   29. XUẤT EXCEL
============================================================ */

if (exportBtn) {

  exportBtn.addEventListener(
    "click",
    async function () {

      if (
        filteredData.length === 0
      ) {

        alert(
          "Không có dữ liệu để xuất."
        );

        return;

      }


      /* ------------------------------------------------------
         KIỂM TRA EXCELJS
      ------------------------------------------------------ */

      if (
        typeof ExcelJS ===
        "undefined"
      ) {

        alert(
          "Chưa tải được ExcelJS.\n\n" +
          "Vui lòng kiểm tra manager.html đã dùng:\n" +
          "exceljs@4.4.0"
        );

        return;

      }


      exportBtn.disabled =
        true;

      const oldText =
        exportBtn.textContent;

      exportBtn.textContent =
        "ĐANG XUẤT...";


      try {

        /* ====================================================
           TẠO WORKBOOK
        ==================================================== */

        const workbook =
          new ExcelJS.Workbook();


        workbook.creator =
          "Quản Lý Dữ Liệu Field";

        workbook.lastModifiedBy =
          "Quản Lý Dữ Liệu Field";

        workbook.created =
          new Date();

        workbook.modified =
          new Date();


        /* ====================================================
           TẠO SHEET
        ==================================================== */

        const worksheet =
          workbook.addWorksheet(
            "Dữ Liệu Field"
          );


        /* ====================================================
           CỘT EXCEL
        ==================================================== */

        worksheet.columns = [

          {
            header:
              "CIF",

            key:
              "cif",

            width:
              18
          },

          {
            header:
              "Tên KH",

            key:
              "ten_kh",

            width:
              35
          },

          {
            header:
              "CBXLN",

            key:
              "user_cb_xln",

            width:
              20
          },

          {
            header:
              "NGÀY FIELD",

            key:
              "ngay_field",

            width:
              18
          }

        ];


        /* ====================================================
           THÊM DỮ LIỆU
        ==================================================== */

        filteredData.forEach(
          function (row) {

            worksheet.addRow({

              cif:
                row.cif || "",

              ten_kh:
                row.ten_kh || "",

              user_cb_xln:
                row.user_cb_xln || "",

              ngay_field:
                formatDate(
                  row.ngay_field
                )

            });

          }
        );


        /* ====================================================
           HEADER - TÔ MÀU
        ==================================================== */

        const headerRow =
          worksheet.getRow(
            1
          );


        headerRow.height =
          28;


        headerRow.eachCell(
          function (cell) {

            cell.font = {

              name:
                "Arial",

              size:
                11,

              bold:
                true,

              color: {
                argb:
                  "FFFFFFFF"
              }

            };


            cell.fill = {

              type:
                "pattern",

              pattern:
                "solid",

              fgColor: {
                argb:
                  "1F4E78"
              }

            };


            cell.alignment = {

              horizontal:
                "center",

              vertical:
                "middle",

              wrapText:
                true

            };


            cell.border = {

              top: {
                style:
                  "thin",

                color: {
                  argb:
                    "000000"
                }
              },

              left: {
                style:
                  "thin",

                color: {
                  argb:
                    "000000"
                }
              },

              bottom: {
                style:
                  "thin",

                color: {
                  argb:
                    "000000"
                }
              },

              right: {
                style:
                  "thin",

                color: {
                  argb:
                    "000000"
                }
              }

            };

          }
        );


        /* ====================================================
           KẺ BẢNG TOÀN BỘ DỮ LIỆU
        ==================================================== */

        worksheet.eachRow(
          function (
            row,
            rowNumber
          ) {

            if (
              rowNumber === 1
            ) {

              return;

            }


            row.height =
              22;


            row.eachCell(
              function (cell) {

                cell.font = {

                  name:
                    "Arial",

                  size:
                    10

                };


                cell.border = {

                  top: {
                    style:
                      "thin",

                    color: {
                      argb:
                        "B7B7B7"
                    }
                  },

                  left: {
                    style:
                      "thin",

                    color: {
                      argb:
                        "B7B7B7"
                    }
                  },

                  bottom: {
                    style:
                      "thin",

                    color: {
                      argb:
                        "B7B7B7"
                    }
                  },

                  right: {
                    style:
                      "thin",

                    color: {
                      argb:
                        "B7B7B7"
                    }
                  }

                };


                cell.alignment = {

                  vertical:
                    "middle"

                };

              }
            );


            /* CIF */

            row.getCell(
              1
            ).alignment = {

              horizontal:
                "center",

              vertical:
                "middle"

            };


            /* CBXLN */

            row.getCell(
              3
            ).alignment = {

              horizontal:
                "center",

              vertical:
                "middle"

            };


            /* NGÀY FIELD */

            row.getCell(
              4
            ).alignment = {

              horizontal:
                "center",

              vertical:
                "middle"

            };

          }
        );


        /* ====================================================
           FREEZE HEADER
        ==================================================== */

        worksheet.views = [

          {
            state:
              "frozen",

            ySplit:
              1

          }

        ];


        /* ====================================================
           AUTO FILTER
        ==================================================== */

        worksheet.autoFilter = {

          from:
            "A1",

          to:
            `D${filteredData.length + 1}`

        };


        /* ====================================================
           CĂN CHỈNH TÊN KH
        ==================================================== */

        worksheet
          .getColumn(2)
          .alignment = {

            vertical:
              "middle",

            horizontal:
              "left",

            wrapText:
              true

          };


        /* ====================================================
           ĐỘ RỘNG CỘT
        ==================================================== */

        worksheet
          .getColumn(1)
          .width = 18;


        worksheet
          .getColumn(2)
          .width = 35;


        worksheet
          .getColumn(3)
          .width = 20;


        worksheet
          .getColumn(4)
          .width = 18;


        /* ====================================================
           TẠO FILE
        ==================================================== */

        const buffer =
          await workbook.xlsx.writeBuffer();


        const blob =
          new Blob(
            [
              buffer
            ],
            {
              type:
                "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
            }
          );


        const url =
          URL.createObjectURL(
            blob
          );


        const link =
          document.createElement(
            "a"
          );


        link.href =
          url;


        /* ====================================================
           TÊN FILE
        ==================================================== */

        const now =
          new Date();


        const year =
          now.getFullYear();


        const month =
          String(
            now.getMonth() + 1
          ).padStart(
            2,
            "0"
          );


        const day =
          String(
            now.getDate()
          ).padStart(
            2,
            "0"
          );


        link.download =
          `DU_LIEU_FIELD_${year}${month}${day}.xlsx`;


        document.body.appendChild(
          link
        );


        link.click();


        document.body.removeChild(
          link
        );


        URL.revokeObjectURL(
          url
        );


        alert(
          "Xuất Excel thành công."
        );


      } catch (error) {

        console.error(
          "Export Excel error:",
          error
        );

        alert(
          "Không thể xuất Excel.\n\n" +
          error.message
        );

      } finally {

        exportBtn.disabled =
          false;

        exportBtn.textContent =
          oldText;

      }

    }
  );

}


/* ============================================================
   30. ESC ĐỂ ĐÓNG MODAL
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
   31. THEO DÕI TRẠNG THÁI AUTH
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
   32. KHỞI ĐỘNG
============================================================ */

checkSession();
