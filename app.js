"use strict";

/* ============================================================
   CẤU HÌNH SUPABASE
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
   DOM
============================================================ */

const form =
  document.getElementById("fieldForm");

const cifInput =
  document.getElementById("cif");

const tenKhInput =
  document.getElementById("tenKh");

const userCbXlnInput =
  document.getElementById("userCbXln");

const ngayFieldInput =
  document.getElementById("ngayField");

const saveBtn =
  document.getElementById("saveBtn");

const message =
  document.getElementById("message");


/* ============================================================
   HIỂN THỊ THÔNG BÁO
============================================================ */

function showMessage(text, type = "success") {

  message.textContent = text;

  message.className =
    "message " + type;

}


/* ============================================================
   XÓA THÔNG BÁO
============================================================ */

function hideMessage() {

  message.textContent = "";

  message.className =
    "message hidden";

}


/* ============================================================
   LƯU DỮ LIỆU
============================================================ */

form.addEventListener("submit", async function (event) {

  event.preventDefault();

  hideMessage();


  const cif =
    cifInput.value.trim();

  const tenKh =
    tenKhInput.value.trim();

  const userCbXln =
    userCbXlnInput.value.trim();

  const ngayField =
    ngayFieldInput.value;


  if (!cif) {

    showMessage(
      "Vui lòng nhập CIF.",
      "error"
    );

    cifInput.focus();

    return;
  }


  if (!tenKh) {

    showMessage(
      "Vui lòng nhập tên khách hàng.",
      "error"
    );

    tenKhInput.focus();

    return;
  }


  if (!userCbXln) {

    showMessage(
      "Vui lòng nhập User CBXLN.",
      "error"
    );

    userCbXlnInput.focus();

    return;
  }


  if (!ngayField) {

    showMessage(
      "Vui lòng chọn ngày field.",
      "error"
    );

    ngayFieldInput.focus();

    return;
  }


  saveBtn.disabled = true;

  saveBtn.textContent =
    "ĐANG LƯU...";


  try {

    const { error } =
      await supabaseClient
        .from("field_khach_hang")
        .insert([
          {
            cif: cif,
            ten_kh: tenKh,
            user_cb_xln: userCbXln,
            ngay_field: ngayField
          }
        ]);


    if (error) {

      console.error(error);

      throw error;
    }


    showMessage(
      "Đã lưu dữ liệu thành công.",
      "success"
    );


    form.reset();


    cifInput.focus();


  } catch (error) {

    console.error(error);

    showMessage(
      "Không thể lưu dữ liệu. Vui lòng kiểm tra kết nối hoặc cấu hình Supabase.",
      "error"
    );


  } finally {

    saveBtn.disabled = false;

    saveBtn.textContent =
      "LƯU DỮ LIỆU";

  }

});
