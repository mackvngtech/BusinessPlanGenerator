// script.js
"use strict";

/*
  script that exposes global functions so inline onclick attributes work:
  - window.generatePlan()
  - window.downloadPDF()
  - window.copyText()
*/

const $ = (sel) => document.querySelector(sel);

const ideaInput = () => $("#idea");
const outputDiv = () => $("#output");
const planDiv = () => $("#plan");
const actionsDiv = () => $("#actions");

// Helper: show a message in the plan area
function showPlanMessage(msg, isError = false) {
  outputDiv().classList.remove("hidden");
  const pd = planDiv();
  pd.innerHTML = "";
  const pre = document.createElement("pre");
  pre.className = "whitespace-pre-wrap";
  pre.textContent = msg;
  if (isError) pre.style.color = "salmon";
  pd.appendChild(pre);
}

// MAIN: generatePlan - exposed as global
async function generatePlan() {
  const ideaEl = ideaInput();
  if (!ideaEl) {
    alert("Cannot find the input element (#idea) in the page.");
    return;
  }

  const idea = ideaEl.value.trim();
  if (!idea) {
    alert("Please enter your business idea first!");
    return;
  }

  // UI: show loading
  outputDiv().classList.remove("hidden");
  showPlanMessage("⏳ Hold tight, building your empire 🏰...");

  // Hide actions while loading
  if (actionsDiv()) actionsDiv().classList.add("hidden");

  try {
    const res = await fetch("/api/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ idea })
    });

    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      throw new Error(body.error || body.message || `Server returned ${res.status}`);
    }

    const data = await res.json();
    const text = data.result || "No result returned from server.";

    // Display result (preserve newlines)
    showPlanMessage(text);

    // Store for download/copy
    const pd = planDiv();
    pd.dataset.generatedText = text;

    // Reveal actions
    if (actionsDiv()) actionsDiv().classList.remove("hidden");
  } catch (err) {
    console.error("generatePlan error:", err);
    showPlanMessage("Error: " + (err.message || err), true);
  }
}

// Download PDF (or fallback to text file)
function downloadPDF() {
  const text = (planDiv() && planDiv().dataset.generatedText) || "";
  if (!text) {
    alert("No generated text to download.");
    return;
  }

  // try using jsPDF if available
  try {
    const jsPDFlib = window.jspdf && window.jspdf.jsPDF ? window.jspdf.jsPDF : window.jsPDF;
    if (jsPDFlib) {
      const doc = new jsPDFlib();
      const lines = doc.splitTextToSize(text, 180);
      doc.text(lines, 10, 10);
      doc.save("business-plan.pdf");
      return;
    }
  } catch (e) {
    // fallthrough to text fallback
    console.warn("jsPDF failed, falling back to text download:", e);
  }

  // Fallback: download as .txt
  const blob = new Blob([text], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "business-plan.txt";
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

// Copy to clipboard
async function copyText() {
  const text = (planDiv() && planDiv().dataset.generatedText) || "";
  if (!text) {
    alert("Nothing to copy.");
    return;
  }
  try {
    await navigator.clipboard.writeText(text);
    alert("Copied to clipboard!");
  } catch (err) {
    console.error("Clipboard write failed:", err);
    alert("Copy failed. You can manually select and copy the text.");
  }
}

// Expose globals so inline onclick handlers can call them
window.generatePlan = generatePlan;
window.downloadPDF = downloadPDF;
window.copyText = copyText;

// Helper: show a message in the plan area
function showPlanMessage(msg, isError = false) {
    outputDiv().classList.remove("hidden");
    const pd = planDiv();
    pd.innerHTML = "";
  
    const htmlText = msg
      .split("\n")
      .map(line => {
        let isHeading = false;
  
        // Detect Markdown heading (##) and remove it
        if (line.startsWith("##")) {
          line = line.replace(/^##\s*/, "");
          isHeading = true;
        }
  
        // Replace bold markers **text** with <strong>
        line = line.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");
  
        // Wrap line in <p>, add extra space before headings
        return isHeading
          ? `<p style="margin-top:3em; font-weight:bold;">${line}</p>`
          : `<p>${line}</p>`;
      })
      .join("");
  
    const div = document.createElement("div");
    div.className = "whitespace-pre-wrap";
    div.innerHTML = htmlText;
  
    if (isError) div.style.color = "salmon";
    pd.appendChild(div);
  }

  
  const formattedText = text.replace(/^(\d+\.)/gm, '    $3');


  