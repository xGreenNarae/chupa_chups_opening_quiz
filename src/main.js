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
    const sheetPanel = document.querySelector('[data-sheet-panel]');
    const sheetTitle = document.querySelector('[data-sheet-title]');
    const sheetSubtitle = document.querySelector('[data-sheet-subtitle]');
    const sheetBody = document.querySelector('[data-sheet-body]');
    let sheetReturnFocusEl = null;
    let sheetNextAction = null;
    const totalQuizzes = 4;
    const quizResults = new Map();
    const sheetStateClasses = ['sheet__panel--correct', 'sheet__panel--wrong'];
    const sheetStateIcons = {
        correct: {
            src: './public/answer_correct_icon.svg',
            alt: '정답 안내 아이콘'
        },
        wrong: {
            src: './public/answer_wrong_icon.svg',
            alt: '오답 안내 아이콘'
        }
    };

    const goTo = targetId => {
        if (!targetId) return;
        pages.forEach(page => {
            page.classList.toggle('hidden', page.dataset.page !== targetId);
        });
    };

    const getResultPageId = correctCount => {
        if (correctCount === totalQuizzes) return 'result-perfect';
        if (correctCount === 0) return 'result-progress';
        if (correctCount === 1) return 'result-1of4';
        if (correctCount >= 2) return 'result-3of4';
        return 'result-progress';
    };

    document.querySelectorAll('[data-navigate]').forEach(trigger => {
        trigger.addEventListener('click', () => goTo(trigger.dataset.navigate));
    });

    const sheetCopy = {
        default: {
            correct: {
                icon: '✔',
                title: '훌륭해요!',
                subtitle: '정답입니다!',
                body: '다음 퀴즈도 가볼까요?',
                cta: '다음'
            },
            wrong: {
                icon: '✕',
                title: '다시 한 번 달콤한 상상력을 발휘해봐요!',
                subtitle: '아쉽게도 오답입니다.',
                body: '힌트를 떠올리면서 다시 도전해봐요.',
                cta: '닫기'
            }
        },
        'quiz-1': {
            correct: {
                icon: '✔',
                title: '정답! 츄파 타임머신 탑승 성공!!',
                subtitle: '처음부터 느낌이 굉장히 좋네요 🍭',
                body:
                '츄파춥스는 1958년 스페인에서 처음 만들어진 사탕이에요. 창업자 Enic Bernat가 “사탕을 손에 묻지 않고 먹을 수 있으면 좋겠다!”라는 생각으로 포크처럼 먹는 사탕, 나아가 막대를 꽂은 사탕을 만들었어요.',
                cta: '다음'
            },
            wrong: {
                icon: '✕',
                title: '헉, 살짝 빗나갔네요😢<br>츄파 박사 타이틀이 도망가고 있어요!',
                subtitle: '다시 한 번 달콤한 상상력을 발휘해봐요!',
                body:
                '츄파춥스는 스페인에서 처음 만들어졌답니다. 창업자 Enric Bernat가 “사탕을 손에 묻지 않고 먹을 수 있으면 좋겠다!”는 생각으로 포크처럼 먹는 사탕, 나아가 막대를 꽂은 사탕을 만들었어요. 이제 여러분은 사탕의 고향이 스페인이라는 걸 알게 되었죠?',
                cta: '다음'
            }
        },
        'quiz-2': {
            correct: {
                icon: '✔',
                title: '정답! 맞혔다! 역시 눈썰미 최고~ 🙌',
                subtitle: '맞아요~초현실주의 거장이 직접 디자인 했답니다!',
                body:
                '달리는 고향 친구의 부탁으로, 직접 로고를 냅킨에 휘리릭 그려줬대요. ‘로고도 예술이다.’라며 데이지 꽃잎으로 감싼 디자인을 제안했어요. 사탕 위에 로고를 올리자고 한 것도 그의 아이디어였죠.',
                cta: '다음'
            },
            wrong: {
                icon: '✕',
                title: '땡! 앗, 아쉬워요😦',
                subtitle: '사실 츄파춥스의 로고는 달리의 손 끝에서<br>탄생했답니다!',
                body:
                '달리는 고향 친구의 부탁으로 지금의 츄파춥스 상징인 데이지 꽃 모양을 냅킨에 휘리릭 그려줬대요. 사탕의 옆면이 아닌 위에 로고를 올리라는 조언도 덧붙였죠.',
                cta: '다음'
            }
        },
        'quiz-3': {
            correct: {
                icon: '✔',
                title: '정답!!😆',
                subtitle: '이 센스, 츄파춥스 본사에서 스카웃해가겠는걸요?',
                body:
                '츄파춥스는 무려 164개 나라에서 사람들의 사랑을 받고 있답니다. 어디를 가든 알록달록한 츄파춥스를 만날 수 있어요! 심지어 우주에서도 츄파춥스를 먹은 적이 있대요! 세상에서 가장 멀리 간 사탕이기도 하죠😎🍬',
                cta: '다음'
            },
            wrong: {
                icon: '✕',
                title: '웁스! 오답이에요.',
                subtitle: '괜찮아요 달리도 한 번쯤 틀렸을걸요?',
                body:
                '정답은 바로 164개 나라였어요. 츄파춥스는 지구 곳곳에서 사랑 받고 있답니다. 미국, 프랑스, 일본, 심지어 남아프리카에서도 즐겨먹어요! 스페인에서 태어난 작은 사탕이 이렇게 전 세계로 퍼졌다는 게 신기하지 않나요?',
                cta: '다음'
            }
        },
        'quiz-4': {
            correct: {
                icon: '✔',
                title: '딩동댕~',
                subtitle: '달콤함 레벨 업!',
                body:
                '‘레인보우 팝스’는 실제로 존재하지 않는 상품이에요. 그래도 실망하지 마세요~ 츄파춥스는 우리가 아는 형태 뿐만 아니라 슈가프리, 미니, 사워벨트(젤리 형태) 등 다양한 제품으로도 즐길 수 있답니다.',
                cta: '결과 확인하기'
            },
            wrong: {
                icon: '✕',
                title: '땡! 달콤함에 속았나봐요!',
                subtitle: '충치 조심해야겠어요~🤪',
                body:
                '‘레인보우 팝스’는 이름만 들어도 맛있을 것 같지만, 안타깝게도 실제로는 없는 제품이에요. 츄파춥스는 대신 과일맛, 콜라맛, 크리미맛 등 수십, 수백 가지 맛으로 전 세계 사람들의 입맛을 사로잡고 있죠!',
                cta: '결과 확인하기'
            }
        }
    };

    const getSheetCopy = (quizId, state) => {
        const copy = sheetCopy[quizId]?.[state] ?? sheetCopy.default[state];
        return copy;
    };

    const applySheetCopy = (copy, state) => {
        if (!copy) return;
        if (sheetPanel && state) {
            sheetStateClasses.forEach(className => sheetPanel.classList.remove(className));
            const nextClass =
                state === 'correct'
                    ? 'sheet__panel--correct'
                    : state === 'wrong'
                        ? 'sheet__panel--wrong'
                        : null;
            if (nextClass) sheetPanel.classList.add(nextClass);
        }

        if (sheetIcon) {
            const iconConfig = state ? sheetStateIcons[state] : null;
            if (iconConfig && sheetIcon instanceof HTMLImageElement) {
                sheetIcon.src = iconConfig.src;
                sheetIcon.alt = iconConfig.alt;
            } else if (!(sheetIcon instanceof HTMLImageElement)) {
                sheetIcon.textContent = copy.icon ?? '';
            }
        }

        if (sheetTitle) sheetTitle.innerHTML       = copy.title ?? '';
        if (sheetSubtitle) sheetSubtitle.innerHTML = copy.subtitle ?? '';
        if (sheetBody) sheetBody.innerHTML         = copy.body ?? '';
        if (sheetNext) sheetNext.textContent       = copy.cta ?? '다음';
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
        const focusWasInside = sheet?.contains(document.activeElement);

        if (focusWasInside) {
            const nextFocus = focusTarget ?? sheetReturnFocusEl;
            if (!focusSafely(nextFocus)) {
                document.body.setAttribute('tabindex', '-1');
                document.body.focus();
                document.body.removeAttribute('tabindex');
            }
        }

        if (sheet?.contains(document.activeElement) && document.activeElement instanceof HTMLElement) {
            document.activeElement.blur();
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
            const sheetState = isCorrect ? 'correct' : 'wrong';
            const copy = getSheetCopy(quizId, sheetState);

            applySheetCopy(copy, sheetState);
            quizResults.set(quizId, isCorrect);

            if (isFinalQuiz) {
                setSheetNextAction(() => {
                    const correctCount = countCorrectAnswers();
                    const resultPageId = getResultPageId(correctCount);
                    goTo(resultPageId);
                    return (
                        document.querySelector(`[data-page="${resultPageId}"] [data-focus-default]`) ||
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
