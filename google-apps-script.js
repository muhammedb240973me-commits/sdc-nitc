/**
 * ============================================================================
 * MUTH NABI MEGA QUIZ 2026 - GOOGLE APPS SCRIPT BACKEND
 * Concurrency-Safe Google Sheets Registration Handler
 * SDC NIT Calicut • SSF Unit
 * ============================================================================
 */

function doPost(e) {
  const lock = LockService.getScriptLock();
  
  try {
    // Wait up to 10 seconds for concurrent requests during rush registration
    lock.waitLock(10000);
    
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    let sheet = ss.getSheetByName("Registrations") || ss.getActiveSheet() || ss.getSheets()[0];
    
    // Auto-initialize headers if sheet is brand new/empty
    if (sheet.getLastRow() === 0) {
      sheet.appendRow([
        "Timestamp",
        "Full Name",
        "Phone Number",
        "Year",
        "Department",
        "Gender"
      ]);
      const headerRange = sheet.getRange(1, 1, 1, 6);
      headerRange.setFontWeight("bold");
      headerRange.setBackground("#F8C857");
      headerRange.setFontColor("#221C18");
      sheet.setFrozenRows(1);
    }
    
    // Extract data from either URL-encoded/FormData parameters or text/plain JSON contents
    let data = {};
    
    // 1. Try URL-encoded parameters
    if (e && e.parameter && Object.keys(e.parameter).length > 0) {
      data = e.parameter;
    }
    
    // 2. Try JSON in postData.contents
    if (e && e.postData && e.postData.contents) {
      try {
        const parsed = JSON.parse(e.postData.contents);
        for (const k in parsed) {
          data[k] = parsed[k];
        }
      } catch (jsonErr) {
        // Not JSON, e.parameter already captured it
      }
    }
    
    const timestamp = data.submittedAt || new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" });
    const fullName = (data.fullName || "").trim();
    // Prefix phone with ' so Sheets treats it as text and preserves all 10 digits
    const rawPhone = (data.phoneNumber || "").toString().trim();
    const phoneNumber = rawPhone ? "'" + rawPhone : "";
    const year = data.year || "";
    const department = data.department || "";
    const gender = data.gender || "";
    
    if (!fullName || !rawPhone) {
      return ContentService.createTextOutput(JSON.stringify({
        status: "error",
        message: "Missing mandatory fields (Name and Phone are required)."
      })).setMimeType(ContentService.MimeType.JSON);
    }
    
    // Append the row cleanly in a single operation
    sheet.appendRow([
      timestamp,
      fullName,
      phoneNumber,
      year,
      department,
      gender
    ]);
    
    return ContentService.createTextOutput(JSON.stringify({
      status: "success",
      message: "Registration successfully recorded!"
    })).setMimeType(ContentService.MimeType.JSON);
    
  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({
      status: "error",
      message: error.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  } finally {
    lock.releaseLock();
  }
}

function doGet(e) {
  return ContentService.createTextOutput(JSON.stringify({
    status: "active",
    name: "Muth Nabi Mega Quiz 2026 Registration API",
    organization: "SDC NIT Calicut (SSF Unit)",
    timestamp: new Date().toISOString()
  })).setMimeType(ContentService.MimeType.JSON);
}
