const SUPABASE_URL = "https://hgwipzfxagbarwoafzvc.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_xUzED1z7bV6xWL8IIaKOIQ_WpAxocEX";

const MAX_CHARS = 500;

const noteInput = document.querySelector("#note-input");
const charCounter = document.querySelector("#char-counter");
const saveButton = document.querySelector("#save-button");
const viewNoteButton = document.querySelector("#view-note-button");
const writeNoteButton = document.querySelector("#write-note-button");
const writeMode = document.querySelector("#write-mode");
const readMode = document.querySelector("#read-mode");
const olderNote = document.querySelector("#older-note");
const checklistInputs = document.querySelectorAll(".checklist input");
const careMessage = document.querySelector("#care-message");
const postcardStamp = document.querySelector(".postcard-stamp");

const STAMPS = [
  [
    ["  /\\  ", "stamp-moss"],
    [" /**\\ ", "stamp-moss"],
    ["  ||  ", "stamp-ink"],
  ],
  [
    [" .--. ", "stamp-sun"],
    ["(    )", "stamp-sun"],
    [" '--' ", "stamp-violet"],
  ],
  [
    ["  /\\  ", "stamp-berry"],
    [" /__\\ ", "stamp-berry"],
    [" |  | ", "stamp-sky"],
  ],
  [
    [" \\o/  ", "stamp-sky"],
    ["  |-- ", "stamp-violet"],
    [" / \\  ", "stamp-sky"],
  ],
  [
    ["  @   ", "stamp-berry"],
    ["-<|>- ", "stamp-moss"],
    ["  |   ", "stamp-moss"],
  ],
  [
    ["  *   ", "stamp-sun"],
    [" ***  ", "stamp-violet"],
    ["  *   ", "stamp-sky"],
  ],
  [
    [" ><(((>", "stamp-sky"],
    ["   ~~~ ", "stamp-moss"],
    [" ~~~   ", "stamp-violet"],
  ],
  [
    [" .--. ", "stamp-sky"],
    ["(____)", "stamp-sky"],
    ["      ", "stamp-ink"],
  ],
];

let supabaseClient = null;

function getSupabase() {
  if (!supabaseClient) {
    supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  }

  return supabaseClient;
}

function updateNoteControls() {
  const text = noteInput.value.trim();
  charCounter.textContent = `${noteInput.value.length}/${MAX_CHARS}`;
  saveButton.disabled = text.length === 0;
}

function updateCareMessage() {
  const checkedCount = [...checklistInputs].filter((input) => input.checked).length;

  if (checkedCount === 0) {
    careMessage.hidden = true;
    careMessage.textContent = "";
    return;
  }

  const really = Array(checkedCount).fill("really").join(", ");
  careMessage.textContent = `you ${really} need to take care of yourself right now`;
  careMessage.hidden = false;
}

function renderStamp() {
  const stamp = STAMPS[Math.floor(Math.random() * STAMPS.length)];

  postcardStamp.replaceChildren(
    ...stamp.map(([text, className]) => {
      const line = document.createElement("span");
      line.className = `stamp-line ${className}`;
      line.textContent = text;
      return line;
    })
  );
}

function showWriteMode() {
  readMode.classList.add("hidden");
  writeMode.classList.remove("hidden");
  noteInput.focus();
}

function showReadMode(message) {
  olderNote.textContent = message;
  writeMode.classList.add("hidden");
  readMode.classList.remove("hidden");
}

async function saveNote() {
  const content = noteInput.value.trim();

  if (!content) {
    return;
  }

  saveButton.disabled = true;

  try {
    await getSupabase().from("submissions").insert({
      type: "text",
      content,
      approved: false,
    });

    noteInput.value = "";
    updateNoteControls();
  } catch {
    saveButton.disabled = false;
  }
}

async function viewOlderNote() {
  try {
    const { count } = await getSupabase()
      .from("submissions")
      .select("id", { count: "exact", head: true })
      .eq("approved", true)
      .eq("type", "text");

    if (!count) {
      showReadMode("No approved notes yet.");
      return;
    }

    const offset = Math.floor(Math.random() * count);
    const { data } = await getSupabase()
      .from("submissions")
      .select("content")
      .eq("approved", true)
      .eq("type", "text")
      .range(offset, offset)
      .limit(1);

    showReadMode(data?.[0]?.content || "No approved notes yet.");
  } catch {
    showReadMode("No approved notes yet.");
  }
}

noteInput.addEventListener("input", updateNoteControls);
saveButton.addEventListener("click", saveNote);
viewNoteButton.addEventListener("click", viewOlderNote);
writeNoteButton.addEventListener("click", showWriteMode);
checklistInputs.forEach((input) => input.addEventListener("change", updateCareMessage));

updateNoteControls();
updateCareMessage();
renderStamp();
