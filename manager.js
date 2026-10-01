(() => {
  "use strict";

  /* ============================================================
     QUẢN LÝ DỮ LIỆU FIELD - MANAGER.JS
     ============================================================

     BẢNG SUPABASE:
     field_khach_hang

     CÁC CỘT:
     - cif
     - ten_kh
     - user_cb_xln
     - ngay_field

     CHỨC NĂNG:
     - Đăng nhập Supabase Auth
     - Lọc CBXLN
     - Lọc ngày field
     - Làm mới dữ liệu
     - Phân trang
     - Sửa
     - Xóa
     - Xóa toàn bộ
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
   2. BIẾN
============================================================ */

let allData = [];
let filteredData = [];

let currentPage = 1;
const pageSize = 20;

let editingRowId = null;


/* ============================================================
   3. LẤY ELEMENT
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

const loginError =
  document.getElementById("loginError");

const logoutBtn =
  document.getElementById("logoutBtn");

const refreshBtn =
  document.getElementById("refreshBtn");

const filterUser =
  document.getElementById("filterUser");

const filterDate =
  document.getElementById("filterDate");

const clearFilterBtn =
  document.getElementById("clearFilterBtn");

const exportBtn =
  document.getElementById("exportBtn");

const deleteAllBtn =
  document.getElementById("deleteAllBtn");

const tableBody =
  document.getElementById("tableBody");

const pagination =
  document.getElementById("pagination");

const totalCount =
  document.getElementById("totalCount");

const uniqueUserCount =
  document.getElementById("uniqueUserCount");

const totalAmount =
  document.getElementById("totalAmount");


/* ============================================================
   4. MODAL SỬA
============================================================ */

const editModal =
  document.getElementById("editModal");

const closeEditModal =
  document.getElementById("closeEditModal");

const cancelEditBtn =
  document.getElementById("cancelEditBtn");

const saveEditBtn =
  document.getElementById("saveEditBtn");

const editCif =
  document.getElementById("editCif");

const editTenKh =
  document.getElementById("editTenKh");

const editUserCbXln =
  document.getElementById("editUserCbXln");

const editNgayField =
  document.getElementById("editNgayField");


/* ============================================================
   5. HÀM FORMAT NGÀY
============================================================ */

function formatDate(dateValue) {

  if (!dateValue) {
    return "";
  }

  const date =
    new Date(dateValue);

  if (isNaN(date.getTime())) {
    return dateValue;
  }

  const day =
    String(date.getDate()).padStart(2, "0");

  const month =
    String(date.getMonth() + 1).padStart(2, "0");

  const year =
    date.getFullYear();

  return `${day}/${month}/${year}`;
}


/* ============================================================
   6. FORMAT SỐ
============================================================ */

function formatNumber(value) {

  if (
    value === null ||
    value === undefined ||
    value === ""
  ) {
    return "0";
  }

  return Number(value).toLocaleString("vi-VN");
}


/* ============================================================
   7. KIỂM TRA ĐĂNG NHẬP
============================================================ */

async function checkSession() {

  const {
    data,
    error
  } = await supabaseClient.auth.getSession();

  if (error) {
    console.error(
      "Lỗi kiểm tra session:",
      error
    );

    showLogin();
    return;
  }

  if (data.session) {
    showManager();
    await loadData();
  } else {
    showLogin();
  }
}


/* ============================================================
   8. HIỆN LOGIN
============================================================ */

function showLogin() {

  if (loginBox) {
    loginBox.style.display = "block";
  }

  if (managerBox) {
    managerBox.style.display = "none";
  }
}


/* ============================================================
   9. HIỆN MANAGER
============================================================ */

function showManager() {

  if (loginBox) {
    loginBox.style.display = "none";
  }

  if (managerBox) {
    managerBox.style.display = "block";
  }
}


/* ============================================================
   10. ĐĂNG NHẬP
============================================================ */

if (loginForm) {

  loginForm.addEventListener(
    "submit",
    async function (e) {

      e.preventDefault();

      if (loginError) {
        loginError.textContent = "";
      }

      const email =
        loginEmail.value.trim();

      const password =
        loginPassword.value;

      if (!email || !password) {

        if (loginError) {
          loginError.textContent =
            "Vui lòng nhập đầy đủ thông tin.";
        }

        return;
      }

      const {
        data,
        error
      } =
        await supabaseClient.auth.signInWithPassword({
          email,
          password
        });

      if (error) {

        console.error(
          "Login error:",
          error
        );

        if (loginError) {
          loginError.textContent =
            "Email hoặc mật khẩu không đúng.";
        }

        return;
      }

      if (data.session) {

        showManager();

        await loadData();
      }

    }
  );

}


/* ============================================================
   11. ĐĂNG XUẤT
============================================================ */

if (logoutBtn) {

  logoutBtn.addEventListener(
    "click",
    async function () {

      const {
        error
      } =
        await supabaseClient.auth.signOut();

      if (error) {

        console.error(
          "Logout error:",
          error
        );

        alert(
          "Không thể đăng xuất."
        );

        return;
      }

      showLogin();

    }
  );

}


/* ============================================================
   12. LOAD DỮ LIỆU
============================================================ */

async function loadData() {

  try {

    if (tableBody) {

      tableBody.innerHTML = `
        <tr>
          <td colspan="6"
              style="text-align:center;padding:20px;">
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
        .from("field_khach_hang")
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
        "Lỗi load dữ liệu:",
        error
      );

      alert(
        "Không thể tải dữ liệu: " +
        error.message
      );

      return;
    }

    allData =
      data || [];

    applyFilters();

  } catch (error) {

    console.error(error);

    alert(
      "Có lỗi xảy ra khi tải dữ liệu."
    );

  }

}


/* ============================================================
   13. LỌC DỮ LIỆU
============================================================ */

function applyFilters() {

  const userKeyword =
    filterUser
      ? filterUser.value
          .trim()
          .toLowerCase()
      : "";

  const selectedDate =
    filterDate
      ? filterDate.value
      : "";

  filteredData =
    allData.filter(
      row => {

        const user =
          String(
            row.user_cb_xln || ""
          )
            .trim()
            .toLowerCase();

        const matchUser =
          !userKeyword ||
          user.includes(userKeyword);

        const matchDate =
          !selectedDate ||
          row.ngay_field === selectedDate;

        return (
          matchUser &&
          matchDate
        );

      }
    );

  currentPage = 1;

  renderStats();

  renderTable();

  renderPagination();

}


/* ============================================================
   14. LỌC USER
============================================================ */

if (filterUser) {

  filterUser.addEventListener(
    "input",
    function () {

      applyFilters();

    }
  );

}


/* ============================================================
   15. LỌC NGÀY
============================================================ */

if (filterDate) {

  filterDate.addEventListener(
    "change",
    function () {

      applyFilters();

    }
  );

}


/* ============================================================
   16. XÓA BỘ LỌC
============================================================ */

if (clearFilterBtn) {

  clearFilterBtn.addEventListener(
    "click",
    function () {

      if (filterUser) {
        filterUser.value = "";
      }

      if (filterDate) {
        filterDate.value = "";
      }

      applyFilters();

    }
  );

}


/* ============================================================
   17. LÀM MỚI
============================================================ */

if (refreshBtn) {

  refreshBtn.addEventListener(
    "click",
    async function () {

      await loadData();

    }
  );

}


/* ============================================================
   18. THỐNG KÊ
============================================================ */

function renderStats() {

  if (totalCount) {

    totalCount.textContent =
      filteredData.length;

  }


  /* ----------------------------------------------------------
     ĐẾM CBXLN KHÔNG TRÙNG
  ---------------------------------------------------------- */

  const users =
    new Set();

  filteredData.forEach(
    row => {

      const user =
        String(
          row.user_cb_xln || ""
        )
          .trim();

      if (user) {
        users.add(user);
      }

    }
  );

  if (uniqueUserCount) {

    uniqueUserCount.textContent =
      users.size;

  }


  /* ----------------------------------------------------------
     TỔNG
  ---------------------------------------------------------- */

  if (totalAmount) {

    totalAmount.textContent =
      filteredData.length;

  }

}


/* ============================================================
   19. RENDER TABLE
============================================================ */

function renderTable() {

  if (!tableBody) {
    return;
  }

  tableBody.innerHTML = "";

  if (filteredData.length === 0) {

    tableBody.innerHTML = `
      <tr>
        <td
          colspan="6"
          style="
            text-align:center;
            padding:25px;
          "
        >
          Không có dữ liệu.
        </td>
      </tr>
    `;

    return;
  }


  const start =
    (currentPage - 1) *
    pageSize;

  const end =
    start + pageSize;

  const pageData =
    filteredData.slice(
      start,
      end
    );


  pageData.forEach(
    (row, index) => {

      const tr =
        document.createElement("tr");

      const stt =
        start + index + 1;


      tr.innerHTML = `
        <td>${stt}</td>

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
              class="btn-edit"
              onclick="openEditModal('${row.id}')"
              title="Sửa"
            >
              ✏️
            </button>

            <button
              type="button"
              class="btn-delete"
              onclick="deleteRow('${row.id}')"
              title="Xóa"
            >
              🗑️
            </button>

          </div>
        </td>
      `;

      tableBody.appendChild(tr);

    }
  );

}


/* ============================================================
   20. ESCAPE HTML
============================================================ */

function escapeHtml(value) {

  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");

}


/* ============================================================
   21. PHÂN TRANG
============================================================ */

function renderPagination() {

  if (!pagination) {
    return;
  }

  pagination.innerHTML = "";

  const totalPages =
    Math.ceil(
      filteredData.length /
      pageSize
    );

  if (totalPages <= 1) {
    return;
  }


  /* ----------------------------------------------------------
     NÚT TRANG TRƯỚC
  ---------------------------------------------------------- */

  const prevBtn =
    document.createElement("button");

  prevBtn.textContent =
    "‹";

  prevBtn.disabled =
    currentPage === 1;

  prevBtn.addEventListener(
    "click",
    function () {

      if (currentPage > 1) {

        currentPage--;

        renderTable();

        renderPagination();

      }

    }
  );

  pagination.appendChild(
    prevBtn
  );


  /* ----------------------------------------------------------
     CÁC TRANG
  ---------------------------------------------------------- */

  for (
    let i = 1;
    i <= totalPages;
    i++
  ) {

    const pageBtn =
      document.createElement("button");

    pageBtn.textContent =
      i;

    if (i === currentPage) {

      pageBtn.classList.add(
        "active"
      );

    }

    pageBtn.addEventListener(
      "click",
      function () {

        currentPage = i;

        renderTable();

        renderPagination();

      }
    );

    pagination.appendChild(
      pageBtn
    );

  }


  /* ----------------------------------------------------------
     NÚT TRANG SAU
  ---------------------------------------------------------- */

  const nextBtn =
    document.createElement("button");

  nextBtn.textContent =
    "›";

  nextBtn.disabled =
    currentPage === totalPages;

  nextBtn.addEventListener(
    "click",
    function () {

      if (
        currentPage <
        totalPages
      ) {

        currentPage++;

        renderTable();

        renderPagination();

      }

    }
  );

  pagination.appendChild(
    nextBtn
  );

}


/* ============================================================
   22. MỞ MODAL SỬA
============================================================ */

window.openEditModal =
  function (id) {

    const row =
      allData.find(
        item =>
          String(item.id) ===
          String(id)
      );

    if (!row) {

      alert(
        "Không tìm thấy dữ liệu."
      );

      return;
    }

    editingRowId =
      id;

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
        row.ngay_field || "";
    }

    if (editModal) {
      editModal.style.display =
        "flex";
    }

  };


/* ============================================================
   23. ĐÓNG MODAL
============================================================ */

function closeModal() {

  editingRowId =
    null;

  if (editModal) {

    editModal.style.display =
      "none";

  }

}


if (closeEditModal) {

  closeEditModal.addEventListener(
    "click",
    closeModal
  );

}


if (cancelEditBtn) {

  cancelEditBtn.addEventListener(
    "click",
    closeModal
  );

}


/* ------------------------------------------------------------
   CLICK NGOÀI MODAL
------------------------------------------------------------ */

if (editModal) {

  editModal.addEventListener(
    "click",
    function (e) {

      if (
        e.target ===
        editModal
      ) {

        closeModal();

      }

    }
  );

}


/* ============================================================
   24. LƯU SỬA
============================================================ */

if (saveEditBtn) {

  saveEditBtn.addEventListener(
    "click",
    async function () {

      if (!editingRowId) {

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


      saveEditBtn.disabled =
        true;

      saveEditBtn.textContent =
        "Đang lưu...";


      try {

        const updateData = {

          cif: cif,

          ten_kh: tenKh,

          user_cb_xln:
            userCbXln,

          ngay_field:
            ngayField

        };


        const {
          error
        } =
          await supabaseClient
            .from("field_khach_hang")
            .update(updateData)
            .eq(
              "id",
              editingRowId
            );


        if (error) {

          console.error(
            "Lỗi update:",
            error
          );

          alert(
            "Không thể cập nhật: " +
            error.message
          );

          return;
        }


        alert(
          "Đã cập nhật dữ liệu."
        );

        closeModal();

        await loadData();


      } catch (error) {

        console.error(error);

        alert(
          "Có lỗi xảy ra khi cập nhật."
        );

      } finally {

        saveEditBtn.disabled =
          false;

        saveEditBtn.textContent =
          "Lưu";

      }

    }
  );

}


/* ============================================================
   25. XÓA 1 DÒNG
============================================================ */

window.deleteRow =
  async function (id) {

    const row =
      allData.find(
        item =>
          String(item.id) ===
          String(id)
      );

    if (!row) {

      alert(
        "Không tìm thấy dữ liệu."
      );

      return;
    }


    const confirmDelete =
      confirm(
        `Bạn có chắc muốn xóa dữ liệu của CIF ${row.cif || ""}?`
      );

    if (!confirmDelete) {
      return;
    }


    try {

      const {
        error
      } =
        await supabaseClient
          .from("field_khach_hang")
          .delete()
          .eq(
            "id",
            id
          );


      if (error) {

        console.error(
          "Lỗi xóa:",
          error
        );

        alert(
          "Không thể xóa: " +
          error.message
        );

        return;
      }


      alert(
        "Đã xóa dữ liệu."
      );

      await loadData();


    } catch (error) {

      console.error(error);

      alert(
        "Có lỗi xảy ra khi xóa."
      );

    }

  };


/* ============================================================
   26. XÓA TOÀN BỘ
============================================================ */

if (deleteAllBtn) {

  deleteAllBtn.addEventListener(
    "click",
    async function () {

      if (allData.length === 0) {

        alert(
          "Không có dữ liệu để xóa."
        );

        return;
      }


      const confirmDelete =
        confirm(
          "CẢNH BÁO!\n\n" +
          "Bạn có chắc chắn muốn XÓA TOÀN BỘ dữ liệu?\n\n" +
          "Thao tác này không thể hoàn tác."
        );


      if (!confirmDelete) {
        return;
      }


      const confirmAgain =
        prompt(
          "Nhập XOA để xác nhận xóa toàn bộ:"
        );


      if (
        String(confirmAgain || "")
          .trim()
          .toUpperCase() !==
        "XOA"
      ) {

        alert(
          "Đã hủy thao tác."
        );

        return;
      }


      deleteAllBtn.disabled =
        true;

      deleteAllBtn.textContent =
        "Đang xóa...";


      try {

        /*
         * Xóa toàn bộ bằng điều kiện
         * id không null.
         *
         * Vì id của các dòng hợp lệ
         * đều phải có giá trị.
         */

        const {
          error
        } =
          await supabaseClient
            .from("field_khach_hang")
            .delete()
            .not(
              "id",
              "is",
              null
            );


        if (error) {

          console.error(
            "Lỗi xóa toàn bộ:",
            error
          );

          alert(
            "Không thể xóa toàn bộ: " +
            error.message
          );

          return;
        }


        alert(
          "Đã xóa toàn bộ dữ liệu."
        );

        await loadData();


      } catch (error) {

        console.error(error);

        alert(
          "Có lỗi xảy ra khi xóa toàn bộ."
        );

      } finally {

        deleteAllBtn.disabled =
          false;

        deleteAllBtn.textContent =
          "Xóa toàn bộ";

      }

    }
  );

}


/* ============================================================
   27. XUẤT EXCEL - EXCELJS
============================================================ */

if (exportBtn) {

  exportBtn.addEventListener(
    "click",
    async function () {

      if (filteredData.length === 0) {

        alert(
          "Không có dữ liệu để xuất."
        );

        return;
      }


      /* --------------------------------------------------------
         KIỂM TRA EXCELJS
      -------------------------------------------------------- */

      if (
        typeof ExcelJS ===
        "undefined"
      ) {

        alert(
          "Chưa tải được thư viện ExcelJS.\n\n" +
          "Hãy kiểm tra manager.html đã thêm ExcelJS chưa."
        );

        return;
      }


      exportBtn.disabled =
        true;

      exportBtn.textContent =
        "Đang xuất Excel...";


      try {

        /* ======================================================
           TẠO WORKBOOK
        ====================================================== */

        const workbook =
          new ExcelJS.Workbook();


        workbook.creator =
          "Quản lý Dữ liệu Field";

        workbook.lastModifiedBy =
          "Quản lý Dữ liệu Field";

        workbook.created =
          new Date();

        workbook.modified =
          new Date();


        /* ======================================================
           TẠO WORKSHEET
        ====================================================== */

        const worksheet =
          workbook.addWorksheet(
            "Dữ Liệu Field"
          );


        /* ======================================================
           CỘT
        ====================================================== */

        worksheet.columns = [

          {
            header: "CIF",
            key: "cif",
            width: 18
          },

          {
            header: "Tên KH",
            key: "ten_kh",
            width: 35
          },

          {
            header: "CBXLN",
            key: "user_cb_xln",
            width: 20
          },

          {
            header: "NGÀY FIELD",
            key: "ngay_field",
            width: 18
          }

        ];


        /* ======================================================
           THÊM DỮ LIỆU
        ====================================================== */

        filteredData.forEach(
          row => {

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


        /* ======================================================
           MÀU HEADER
        ====================================================== */

        const headerRow =
          worksheet.getRow(1);


        headerRow.height =
          25;


        headerRow.eachCell(
          cell => {

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


        /* ======================================================
           KẺ BẢNG DỮ LIỆU
        ====================================================== */

        worksheet.eachRow(
          (row, rowNumber) => {

            if (
              rowNumber === 1
            ) {
              return;
            }


            row.height =
              22;


            row.eachCell(
              cell => {

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
                        "BFBFBF"
                    }
                  },

                  left: {
                    style:
                      "thin",

                    color: {
                      argb:
                        "BFBFBF"
                    }
                  },

                  bottom: {
                    style:
                      "thin",

                    color: {
                      argb:
                        "BFBFBF"
                    }
                  },

                  right: {
                    style:
                      "thin",

                    color: {
                      argb:
                        "BFBFBF"
                    }
                  }

                };


                cell.alignment = {

                  vertical:
                    "middle"

                };

              }
            );


            /* --------------------------------------------------
               CIF
            -------------------------------------------------- */

            row.getCell(1)
              .alignment = {

                horizontal:
                  "center",

                vertical:
                  "middle"

              };


            /* --------------------------------------------------
               CBXLN
            -------------------------------------------------- */

            row.getCell(3)
              .alignment = {

                horizontal:
                  "center",

                vertical:
                  "middle"

              };


            /* --------------------------------------------------
               NGÀY FIELD
            -------------------------------------------------- */

            row.getCell(4)
              .alignment = {

                horizontal:
                  "center",

                vertical:
                  "middle"

              };

          }
        );


        /* ======================================================
           FREEZE HEADER
        ====================================================== */

        worksheet.views = [

          {
            state:
              "frozen",

            ySplit:
              1

          }

        ];


        /* ======================================================
           AUTO FILTER
        ====================================================== */

        worksheet.autoFilter = {

          from:
            "A1",

          to:
            `D${filteredData.length + 1}`

        };


        /* ======================================================
           TỰ ĐIỀU CHỈNH ĐỘ RỘNG CỘT
        ====================================================== */

        worksheet.columns.forEach(
          column => {

            let maxLength =
              0;


            column.eachCell(
              {
                includeEmpty:
                  true
              },
              cell => {

                const value =
                  cell.value ===
                  null
                    ? ""
                    : String(
                        cell.value
                      );


                if (
                  value.length >
                  maxLength
                ) {

                  maxLength =
                    value.length;

                }

              }
            );


            /*
             * Giới hạn độ rộng để
             * Excel không bị quá rộng.
             */

            column.width =
              Math.min(
                Math.max(
                  maxLength + 3,
                  12
                ),
                40
              );

          }
        );


        /* ======================================================
           ĐẶT LẠI WIDTH CHO CÁC CỘT
        ====================================================== */

        worksheet.getColumn(1)
          .width = 18;

        worksheet.getColumn(2)
          .width = 35;

        worksheet.getColumn(3)
          .width = 20;

        worksheet.getColumn(4)
          .width = 18;


        /* ======================================================
           TẠO FILE
        ====================================================== */

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
          window.URL.createObjectURL(
            blob
          );


        const link =
          document.createElement(
            "a"
          );


        link.href =
          url;


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


        link.download =
          `DU_LIEU_FIELD_${yyyy}${mm}${dd}.xlsx`;


        document.body.appendChild(
          link
        );


        link.click();


        document.body.removeChild(
          link
        );


        window.URL.revokeObjectURL(
          url
        );


        alert(
          "Xuất Excel thành công."
        );


      } catch (error) {

        console.error(
          "Lỗi xuất Excel:",
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
          "Xuất Excel";

      }

    }
  );

}


/* ============================================================
   28. ESC ĐỂ ĐÓNG MODAL
============================================================ */

document.addEventListener(
  "keydown",
  function (e) {

    if (
      e.key ===
      "Escape"
    ) {

      closeModal();

    }

  }
);


/* ============================================================
   29. THEO DÕI AUTH
============================================================ */

supabaseClient.auth.onAuthStateChange(
  (
    event,
    session
  ) => {

    if (session) {

      showManager();

    } else {

      showLogin();

    }

  }
);


/* ============================================================
   30. KHỞI ĐỘNG
============================================================ */

checkSession();

})();
