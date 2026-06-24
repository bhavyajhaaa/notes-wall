const SUPABASE_URL = "https://hgwipzfxagbarwoafzvc.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_xUzED1z7bV6xWL8IIaKOIQ_WpAxocEX";

const MAX_CHARS = 500;
const LINK_PATTERN = /(https?:\/\/|www\.|[a-z0-9-]+\.[a-z]{2,})(\/\S*)?/i;
const EMAIL_PATTERN = /[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}/i;
const PHONE_PATTERN = /(?:\+?\d[\s().-]*){7,}/;

const form = document.querySelector("#note-form");
const noteInput = document.querySelector("#note-input");
const charCounter = document.querySelector("#char-counter");
const submitButton = document.querySelector("#submit-button");
const randomButton = document.querySelector("#random-button");
const formStatus = document.querySelector("#form-status");
const randomNote = document.querySelector("#random-note");

let supabaseClient = null;

function hasSupabaseConfig() {
  return (
    SUPABASE_URL.startsWith("https://") &&
    SUPABASE_ANON_KEY.length > 40 &&
    !SUPABASE_URL.includes("PASTE_") &&
    !SUPABASE_ANON_KEY.includes("PASTE_")
  );
}

function getSupabase() {
  if (!hasSupabaseConfig()) {
    throw new Error("Add your Supabase URL and anon key in app.js first.");
  }

  if (!window.supabase) {
    throw new Error("Supabase client failed to load. Check your connection and CDN access.");
  }

  if (!supabaseClient) {
    supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  }

  return supabaseClient;
}

function setStatus(message, kind = "") {
  formStatus.textContent = message;
  formStatus.className = kind ? `status ${kind}` : "status";
}

function setRandomNote(message, isEmpty = false) {
  randomNote.textContent = message;
  randomNote.classList.toggle("is-empty", isEmpty);
}

function updateCounter() {
  const count = noteInput.value.length;
  charCounter.textContent = `${count}/${MAX_CHARS}`;
  charCounter.style.color = count > MAX_CHARS ? "var(--error)" : "";
}

function validateNote(rawText) {
  const text = rawText.trim();

  if (!text) {
    return "Please write a note before submitting.";
  }

  if (text.length > MAX_CHARS) {
    return "Please keep your note to 500 characters or fewer.";
  }

  if (LINK_PATTERN.test(text)) {
    return "Links are not allowed on the wall.";
  }

  if (EMAIL_PATTERN.test(text)) {
    return "Email addresses are not allowed on the wall.";
  }

  if (PHONE_PATTERN.test(text)) {
    return "Phone numbers are not allowed on the wall.";
  }

  return "";
}

async function submitNote(event) {
  event.preventDefault();

  const content = noteInput.value.trim();
  const validationError = validateNote(content);

  if (validationError) {
    setStatus(validationError, "error");
    return;
  }

  submitButton.disabled = true;
  setStatus("Sending your note to the moderation queue...");

  try {
    const client = getSupabase();
    const { error } = await client.from("submissions").insert({
      type: "text",
      content,
      approved: false,
    });

    if (error) {
      throw error;
    }

    noteInput.value = "";
    updateCounter();
    setStatus("Submitted. It will appear after approval.", "success");
  } catch (error) {
    setStatus(error.message || "Something went wrong while submitting.", "error");
  } finally {
    submitButton.disabled = false;
  }
}

async function showRandomNote() {
  randomButton.disabled = true;
  setStatus("Looking for an approved note...");
  setRandomNote("The wall is shuffling its papers.", true);

  try {
    const client = getSupabase();
    const { count, error: countError } = await client
      .from("submissions")
      .select("id", { count: "exact", head: true })
      .eq("approved", true)
      .eq("type", "text");

    if (countError) {
      throw countError;
    }

    if (!count) {
      setStatus("No approved notes yet.", "success");
      setRandomNote("Nothing has been approved yet. The wall is still waiting.", true);
      return;
    }

    const offset = Math.floor(Math.random() * count);
    const { data, error } = await client
      .from("submissions")
      .select("content")
      .eq("approved", true)
      .eq("type", "text")
      .range(offset, offset)
      .limit(1);

    if (error) {
      throw error;
    }

    if (!data || data.length === 0) {
      setStatus("No approved notes could be found.", "success");
      setRandomNote("Nothing has been approved yet. The wall is still waiting.", true);
      return;
    }

    setStatus("Found one.", "success");
    setRandomNote(data[0].content);
  } catch (error) {
    setStatus(error.message || "Something went wrong while fetching a note.", "error");
    setRandomNote("The wall could not answer right now. Try again in a minute.", true);
  } finally {
    randomButton.disabled = false;
  }
}

noteInput.addEventListener("input", updateCounter);
form.addEventListener("submit", submitNote);
randomButton.addEventListener("click", showRandomNote);
updateCounter();
