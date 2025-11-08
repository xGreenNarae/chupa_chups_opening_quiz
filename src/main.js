const loadPartials = async () => {
  const placeholders = Array.from(document.querySelectorAll('[data-partial]'));
  await Promise.all(
    placeholders.map(async placeholder => {
      const src = placeholder.dataset.partial;
      if (!src) return;
      try {
        const response = await fetch(`./src/${src}`);
        if (!response.ok) throw new Error(`Failed to fetch ${src}`);
        const markup = await response.text();
        placeholder.outerHTML = markup;
      } catch (error) {
        console.error(`[partials] ${error.message}`);
      }
    })
  );
};

const initApp = () => {
  const pages = document.querySelectorAll('[data-page]');
  const quizOptions = document.querySelectorAll('[data-page="quiz-1"] .quiz-option');
  const submitBtn = document.querySelector('[data-submit]');
  const sheet = document.querySelector('[data-sheet]');
  const sheetBackdrop = document.querySelector('[data-sheet-dismiss]');
  const sheetNext = document.querySelector('[data-sheet-next]');
  const sheetIcon = document.querySelector('[data-sheet-icon]');
  const sheetStatus = document.querySelector('[data-sheet-status]');
  const sheetTitle = document.querySelector('[data-sheet-title]');
  const sheetBody = document.querySelector('[data-sheet-body]');

  const goTo = targetId => {
    if (!targetId) return;
    pages.forEach(page => {
      page.classList.toggle('hidden', page.dataset.page !== targetId);
    });
  };

  document.querySelectorAll('[data-navigate]').forEach(trigger => {
    trigger.addEventListener('click', () => goTo(trigger.dataset.navigate));
  });

  let selectedOption = null;

  const sheetCopy = {
    correct: {
      icon: '✔',
      status: '정답이에요!',
      title: '츄파 박사 타이틀이 눈앞이에요!',
      body:
        '츄파춥스는 스페인에서 처음 만들어졌어요. 창업자 Enric Bernat가 "손에 묻지 않고 먹을 수 있는 사탕"을 떠올리며 만들었답니다.'
    },
    wrong: {
      icon: '✕',
      status: '헉, 살짝 빗나갔네요!',
      title: '다시 한 번 달콤한 상상력을 발휘해봐요!',
      body:
        '츄파 박사 타이틀이 도망가고 있어요! 츄파춥스의 고향은 스페인이니, 축구와 투우의 나라를 기억해두면 좋아요.'
    }
  };

  const updateSubmitState = enabled => {
    if (!submitBtn) return;
    submitBtn.disabled = !enabled;
    submitBtn.classList.toggle('is-ready', enabled);
  };

  quizOptions.forEach(option => {
    option.addEventListener('click', () => {
      if (selectedOption) {
        selectedOption.classList.remove('is-selected');
        selectedOption.setAttribute('aria-checked', 'false');
      }
      selectedOption = option;
      selectedOption.classList.add('is-selected');
      selectedOption.setAttribute('aria-checked', 'true');
      updateSubmitState(true);
    });
  });

  const toggleSheet = state => {
    sheet?.classList.toggle('is-open', state);
    sheet?.setAttribute('aria-hidden', state ? 'false' : 'true');
  };

  submitBtn?.addEventListener('click', () => {
    if (!selectedOption) return;
    const isCorrect = selectedOption.dataset.correct === 'true';
    const copy = isCorrect ? sheetCopy.correct : sheetCopy.wrong;

    sheetIcon.textContent = copy.icon;
    sheetStatus.textContent = copy.status;
    sheetTitle.textContent = copy.title;
    sheetBody.textContent = copy.body;

    toggleSheet(true);
  });

  const closeSheet = () => toggleSheet(false);

  sheetBackdrop?.addEventListener('click', closeSheet);
  sheetNext?.addEventListener('click', () => {
    closeSheet();
    goTo('quiz-2');
  });
};

document.addEventListener('DOMContentLoaded', async () => {
  await loadPartials();
  initApp();
});
