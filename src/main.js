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
  const sheet = document.querySelector('[data-sheet]');
  const sheetBackdrop = document.querySelector('[data-sheet-dismiss]');
  const sheetNext = document.querySelector('[data-sheet-next]');
  const sheetIcon = document.querySelector('[data-sheet-icon]');
  const sheetStatus = document.querySelector('[data-sheet-status]');
  const sheetTitle = document.querySelector('[data-sheet-title]');
  const sheetBody = document.querySelector('[data-sheet-body]');
  let sheetReturnFocusEl = null;
  let sheetNextAction = null;
  const totalQuizzes = 4;
  const quizResults = new Map();

  const goTo = targetId => {
    if (!targetId) return;
    pages.forEach(page => {
      page.classList.toggle('hidden', page.dataset.page !== targetId);
    });
  };

  document.querySelectorAll('[data-navigate]').forEach(trigger => {
    trigger.addEventListener('click', () => goTo(trigger.dataset.navigate));
  });

  const sheetCopy = {
    default: {
      correct: {
        icon: '✔',
        status: '정답이에요!',
        title: '훌륭해요!',
        body: '다음 퀴즈도 가볼까요?',
        cta: '다음'
      },
      wrong: {
        icon: '✕',
        status: '헉, 살짝 빗나갔네요!',
        title: '다시 한 번 달콤한 상상력을 발휘해봐요!',
        body: '힌트를 떠올리면서 다시 도전해봐요.',
        cta: '닫기'
      }
    },
    'quiz-1': {
      correct: {
        icon: '✔',
        status: '정답이에요!',
        title: '츄파 박사 타이틀이 눈앞이에요!',
        body:
          '츄파춥스는 스페인에서 처음 만들어졌어요. 창업자 Enric Bernat가 "손에 묻지 않고 먹을 수 있는 사탕"을 떠올리며 만들었답니다.',
        cta: '다음'
      },
      wrong: {
        icon: '✕',
        status: '헉, 살짝 빗나갔네요!',
        title: '다시 한 번 달콤한 상상력을 발휘해봐요!',
        body:
          '츄파 박사 타이틀이 도망가고 있어요! 츄파춥스의 고향은 스페인이니, 축구와 투우의 나라를 기억해두면 좋아요.',
        cta: '다음'
      }
    },
    'quiz-2': {
      correct: {
        icon: '✔',
        status: '정답이에요!',
        title: '살바도르 달리가 직접 완성했어요!',
        body:
          '1969년 츄파춥스는 초현실주의 거장 살바도르 달리에게 로고를 의뢰해 현재의 꽃 모양 로고가 탄생했어요.',
        cta: '다음'
      },
      wrong: {
        icon: '✕',
        status: '조금 아쉬워요!',
        title: '츄파춥스 로고의 주인공은 살바도르 달리!',
        body:
          '초현실주의 화가 달리가 포장지 위에서 꽃처럼 피어나는 로고를 디자인했답니다. 다시 한번 생각해볼까요?',
        cta: '다음'
      }
    },
    'quiz-3': {
      correct: {
        icon: '✔',
        status: '정답이에요!',
        title: '전 세계 164개국이 츄파 열풍!',
        body:
          '90년대에 츄파춥스는 무려 164개국에서 판매되며 글로벌 아이콘으로 자리 잡았어요.',
        cta: '다음'
      },
      wrong: {
        icon: '✕',
        status: '조금만 더!',
        title: '정답은 164개국!',
        body:
          '츄파춥스는 전 세계 164개국에서 사랑을 받았답니다. 숫자를 한 번 더 떠올려볼까요?',
        cta: '다음'
      }
    },
    'quiz-4': {
      correct: {
        icon: '✔',
        status: '정답이에요!',
        title: '츄파의 찐덕후 인증!',
        body:
          '샤워벨트는 상상 속 상품이에요. 나머지는 실제로 즐길 수 있는 츄파춥스 라인업!',
        cta: '결과 보기'
      },
      wrong: {
        icon: '✕',
        status: '마지막 한 끗!',
        title: '존재하지 않는 건 샤워벨트!',
        body:
          '슈가프리, 미니, 레인보우 팝스는 모두 실제 상품이에요. 샤워벨트만 상상 속 제품이죠.',
        cta: '결과 보기'
      }
    }
  };

  const getSheetCopy = (quizId, state) => {
    const copy = sheetCopy[quizId]?.[state] ?? sheetCopy.default[state];
    return copy;
  };

  const applySheetCopy = copy => {
    if (!copy) return;
    if (sheetIcon) sheetIcon.textContent = copy.icon;
    if (sheetStatus) sheetStatus.textContent = copy.status;
    if (sheetTitle) sheetTitle.textContent = copy.title;
    if (sheetBody) sheetBody.textContent = copy.body;
    if (sheetNext) sheetNext.textContent = copy.cta ?? '다음';
  };

  const focusSafely = element => {
    if (element instanceof HTMLElement && typeof element.focus === 'function' && element.isConnected) {
      element.focus();
      return true;
    }
    return false;
  };

  const openSheet = () => {
    sheetReturnFocusEl = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    sheet?.classList.add('is-open');
    sheet?.setAttribute('aria-hidden', 'false');
    focusSafely(sheetNext);
  };

  const closeSheet = focusTarget => {
    if (sheet?.contains(document.activeElement)) {
      const nextFocus = focusTarget ?? sheetReturnFocusEl;
      if (!focusSafely(nextFocus)) {
        document.body.setAttribute('tabindex', '-1');
        document.body.focus();
        document.body.removeAttribute('tabindex');
      }
    }
    sheet?.classList.remove('is-open');
    sheet?.setAttribute('aria-hidden', 'true');
    sheetReturnFocusEl = null;
    sheetNextAction = null;
  };

  const setSheetNextAction = handler => {
    sheetNextAction = typeof handler === 'function' ? handler : null;
  };

  const countCorrectAnswers = () => {
    let total = 0;
    quizResults.forEach(isCorrect => {
      if (isCorrect) total += 1;
    });
    return total;
  };

  const setupQuiz = page => {
    const options = Array.from(page.querySelectorAll('.quiz-option'));
    const submitBtn = page.querySelector('[data-submit]');
    if (!options.length || !submitBtn) return;

    let selectedOption = null;

    const updateSubmitState = enabled => {
      submitBtn.disabled = !enabled;
      submitBtn.classList.toggle('is-ready', enabled);
    };

    updateSubmitState(false);

    options.forEach(option => {
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

    submitBtn.addEventListener('click', () => {
      if (!selectedOption) return;
      const quizId = page.dataset.page;
      const isCorrect = selectedOption.dataset.correct === 'true';
      const isFinalQuiz = page.dataset.isFinal === 'true';
      const nextPageId = page.dataset.nextPage || null;
      const copy = getSheetCopy(quizId, isCorrect ? 'correct' : 'wrong');

      applySheetCopy(copy);
      quizResults.set(quizId, isCorrect);

      if (isFinalQuiz) {
        setSheetNextAction(() => {
          const correctCount = countCorrectAnswers();
          // debug
          console.log(`Correct answers: ${correctCount} out of ${totalQuizzes}`);
          const resultPageId = correctCount === totalQuizzes ? 'result-perfect' : 'result-progress';
          goTo(resultPageId);
          return (
            document.querySelector(`[data-page="${resultPageId}"] [data-focus-default]`) ||
            document.querySelector(`[data-page="${resultPageId}"] .result-cta`) ||
            document.querySelector(`[data-page="${resultPageId}"]`)
          );
        });
      } else {
        setSheetNextAction(() => {
          if (!nextPageId) return null;
          goTo(nextPageId);
          return document.querySelector(`[data-page="${nextPageId}"] .quiz-option`);
        });
      }

      openSheet();
    });
  };

  document.querySelectorAll('.quiz-shell').forEach(setupQuiz);

  sheetBackdrop?.addEventListener('click', () => closeSheet());
  sheetNext?.addEventListener('click', () => {
    const focusTarget = sheetNextAction?.() ?? null;
    closeSheet(focusTarget);
  });
};

document.addEventListener('DOMContentLoaded', async () => {
  await loadPartials();
  initApp();
});
