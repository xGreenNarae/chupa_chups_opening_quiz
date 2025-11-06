function nextPage(n) {
  document.querySelectorAll('section').forEach(s => s.classList.add('hidden'));
  document.getElementById(`page${n}`).classList.remove('hidden');
}

function showPopup() {
  const popup = document.getElementById('popup');
  popup.classList.remove('hidden');
}

function hidePopup() {
  const popup = document.getElementById('popup');
  popup.classList.add('hidden');
}

