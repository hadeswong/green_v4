document.addEventListener('DOMContentLoaded', function() {
    const cardsContainer = document.querySelector('.cards-container');
    const cards = document.querySelectorAll('.card-container');
    const navDots = document.querySelectorAll('.nav-dot');
    
    let lastActiveIndex = 0;
    let startX;
    let currentX;
    let isDragging = false;
    let startScrollLeft;
    let animationFrameId;
    const cardWidth = cards[0].offsetWidth + 5;

    function smoothScrollToCard(index) {
        const targetScroll = cardWidth * index;
        const startScroll = cardsContainer.scrollLeft;
        const distance = targetScroll - startScroll;
        let startTime = null;
        const duration = 300; // 动画持续时间

        function animation(currentTime) {
            if (startTime === null) startTime = currentTime;
            const timeElapsed = currentTime - startTime;
            const progress = Math.min(timeElapsed / duration, 1);
            
            // 使用 easeOutCubic 缓动函数使动画更自然
            const easeProgress = 1 - Math.pow(1 - progress, 3);
            
            cardsContainer.scrollLeft = startScroll + (distance * easeProgress);

            if (progress < 1) {
                animationFrameId = requestAnimationFrame(animation);
            } else {
                updateActiveCard(index);
            }
        }

        cancelAnimationFrame(animationFrameId);
        animationFrameId = requestAnimationFrame(animation);
    }

    function updateActiveCard(index) {
        if (index !== lastActiveIndex) {
            cards.forEach((cardContainer, i) => {
                const flipCard = cardContainer.querySelector('.flip-card');
                if (i === index) {
                    flipCard.classList.add('active', 'flipped');
                } else {
                    flipCard.classList.remove('active', 'flipped');
                }
            });

            navDots.forEach((dot, i) => {
                dot.classList.toggle('active', i === index);
            });

            lastActiveIndex = index;
        }
    }

    function getActiveIndex() {
        return Math.round(cardsContainer.scrollLeft / cardWidth);
    }

    // 触摸事件处理
    cardsContainer.addEventListener('touchstart', (e) => {
        isDragging = true;
        startX = e.touches[0].pageX;
        currentX = startX;
        startScrollLeft = cardsContainer.scrollLeft;
        
        // 停止任何正在进行的动画
        cancelAnimationFrame(animationFrameId);
        
        cardsContainer.style.scrollBehavior = 'auto';
    }, { passive: true });

    cardsContainer.addEventListener('touchmove', (e) => {
        if (!isDragging) return;
        
        currentX = e.touches[0].pageX;
        const walk = (startX - currentX) * 1.5; // 增加滑动灵敏度
        cardsContainer.scrollLeft = startScrollLeft + walk;
    }, { passive: true });

    function handleTouchEnd() {
        if (!isDragging) return;
        isDragging = false;
        
        const endScrollLeft = cardsContainer.scrollLeft;
        const deltaX = endScrollLeft - startScrollLeft;
        
        // 计算最接近的卡片索引
        let targetIndex = getActiveIndex();
        
        // 如果滑动距离超过卡片宽度的20%，则切换到下一张或上一张
        if (Math.abs(deltaX) > cardWidth * 0.2) {
            targetIndex = deltaX > 0 ? 
                Math.ceil(cardsContainer.scrollLeft / cardWidth) : 
                Math.floor(cardsContainer.scrollLeft / cardWidth);
        }
        
        // 确保索引在有效范围内
        targetIndex = Math.max(0, Math.min(targetIndex, cards.length - 1));
        
        // 使用自定义动画滚动到目标卡片
        smoothScrollToCard(targetIndex);
    }

    cardsContainer.addEventListener('touchend', handleTouchEnd);
    cardsContainer.addEventListener('touchcancel', handleTouchEnd);

    // 导航点点击事件
    navDots.forEach((dot, index) => {
        dot.addEventListener('click', () => {
            smoothScrollToCard(index);
        });
    });

    // 初始化第一张卡片
    const firstCard = cards[0].querySelector('.flip-card');
    firstCard.classList.add('active', 'flipped');

    // 为每张卡片添加功能
    cards.forEach((cardContainer, index) => {
        const card = cardContainer.querySelector('.flip-card');
        const recycleCheck = cardContainer.querySelector(`#recycleCheck-${index}`);
        const alert = cardContainer.querySelector(`#alert-${index}`);
        const cardBack = cardContainer.querySelector('.flip-card-back');

        // 卡片点击事件
        card.addEventListener('click', function(e) {
            if (this.classList.contains('active') && !e.target.closest('.switch')) {
                this.classList.toggle('flipped');
            }
        });

        // checkbox点击事件
        recycleCheck.addEventListener('change', function() {
            updateCardStatus(this.checked, alert, cardBack);
            saveCardStatus(index, this.checked);
        });

        // 初始化卡片状态
        initializeCardStatus(index, recycleCheck, alert, cardBack);
    });

    // 更新卡片状态
    function updateCardStatus(isChecked, alert, cardBack) {
        if (isChecked) {
            alert.textContent = '✅ 已完成廚餘回收';
            alert.classList.add('completed');
            cardBack.classList.add('completed');
        } else {
            alert.textContent = '❌ 未完成廚餘回收';
            alert.classList.remove('completed');
            cardBack.classList.remove('completed');
        }
    }

    // 保存卡片状态
    function saveCardStatus(index, status) {
        const today = new Date().toLocaleDateString();
        localStorage.setItem(`recycleStatus-${index}`, status);
        localStorage.setItem(`recycleDate-${index}`, today);
    }

    // 初始化卡片状态
    function initializeCardStatus(index, recycleCheck, alert, cardBack) {
        const today = new Date().toLocaleDateString();
        const savedDate = localStorage.getItem(`recycleDate-${index}`);
        const savedStatus = localStorage.getItem(`recycleStatus-${index}`);

        if (savedDate !== today) {
            // 如果不是今天，重置状态
            recycleCheck.checked = false;
            updateCardStatus(false, alert, cardBack);
            saveCardStatus(index, false);
        } else {
            // 恢复保存的状态
            const status = savedStatus === 'true';
            recycleCheck.checked = status;
            updateCardStatus(status, alert, cardBack);
        }
    }

    // 自动重置功能
    function setupAutoReset() {
        const now = new Date();
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        tomorrow.setHours(0, 0, 0, 0);

        const timeUntilReset = tomorrow - now;

        setTimeout(() => {
            // 重置所有卡片
            cards.forEach((cardContainer, index) => {
                const recycleCheck = cardContainer.querySelector(`#recycleCheck-${index}`);
                const alert = cardContainer.querySelector(`#alert-${index}`);
                const cardBack = cardContainer.querySelector('.flip-card-back');
                
                recycleCheck.checked = false;
                updateCardStatus(false, alert, cardBack);
                saveCardStatus(index, false);
            });

            // 设置每24小时重复执行
            setInterval(() => {
                cards.forEach((cardContainer, index) => {
                    const recycleCheck = cardContainer.querySelector(`#recycleCheck-${index}`);
                    const alert = cardContainer.querySelector(`#alert-${index}`);
                    const cardBack = cardContainer.querySelector('.flip-card-back');
                    
                    recycleCheck.checked = false;
                    updateCardStatus(false, alert, cardBack);
                    saveCardStatus(index, false);
                });
            }, 24 * 60 * 60 * 1000);
        }, timeUntilReset);
    }

    // 初始化自动重置
    setupAutoReset();
});