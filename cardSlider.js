class CardSlider {
    // 显示所有卡片
    showAllCards() {
        this.cards.forEach(card => {
            card.style.display = 'block';
        });
    }

    // 将卡片居中显示
    centerCard(card) {
        if (!this.container) return;
        
        const containerRect = this.container.getBoundingClientRect();
        const cardRect = card.getBoundingClientRect();
        
        const scrollTop = card.offsetTop - (containerRect.height / 2) + (cardRect.height / 2);
        
        this.container.scrollTo({
            top: scrollTop,
            behavior: 'smooth'
        });
    }

    constructor() {
        this.cards = document.querySelectorAll('.card-container');
        this.container = document.querySelector('.cards-container');
        this.showAllCards();
        this.initializeCardFeatures();
        this.setupAutoReset();
    }

    initializeCardFeatures() {
        this.cards.forEach((cardContainer) => {
            const header = cardContainer.querySelector('.member-header');
            const contentWrapper = cardContainer.querySelector('.card-content-wrapper');
            const recycleCheck = cardContainer.querySelector('.recycleCheck');
            const alert = cardContainer.querySelector('.alert');
            const greenCard = cardContainer.querySelector('.green-card-container');
            const memberId = header.getAttribute('data-member-id');

            // 點擊 header 時展開/收起內容
            header.addEventListener('click', (e) => {
                e.stopPropagation(); // 防止觸發卡片的點擊事件
                // 收起其他所有卡片
                this.cards.forEach(otherCard => {
                    if (otherCard !== cardContainer) {
                        const otherWrapper = otherCard.querySelector('.card-content-wrapper');
                        otherWrapper.classList.remove('expanded');
                        otherCard.classList.remove('expanded');
                    }
                });
            
                // 切換當前卡片
                contentWrapper.classList.toggle('expanded');
                cardContainer.classList.toggle('expanded');
                
                if (contentWrapper.classList.contains('expanded')) {
                    // 確保展開的卡片可見
                    setTimeout(() => {
                        this.centerCard(cardContainer);
                    }, 300);
                }
            });

            recycleCheck.addEventListener('change', (e) => {
                e.stopPropagation(); // 防止觸發卡片的點擊事件
                this.updateCardStatus(recycleCheck.checked, alert, greenCard);
                this.saveCardStatus(memberId, recycleCheck.checked);
            });

            this.initializeCardStatus(memberId, recycleCheck, alert, greenCard);
        });
    }

    // 更新卡片是否完成廚餘回收
    updateCardStatus(isChecked, alert, greenCard) {
        const header = alert.closest('.member-header');
        if (isChecked) {
            alert.textContent = '✅ 已完成廚餘回收';
            header.classList.add('completed');
            greenCard.classList.add('completed');
        } else {
            alert.textContent = '❌ 未完成廚餘回收';
            header.classList.remove('completed');
            greenCard.classList.remove('completed');
        }
    }

    // 保存卡片狀態
    saveCardStatus(memberId, status) {
        const today = new Date().toLocaleDateString();
        localStorage.setItem(`recycleStatus-${memberId}`, status);
        localStorage.setItem(`recycleDate-${memberId}`, today);
    }

    // 初始化卡片狀態
    initializeCardStatus(memberId, recycleCheck, alert, greenCard) {
        const today = new Date().toLocaleDateString();
        const savedDate = localStorage.getItem(`recycleDate-${memberId}`);
        const savedStatus = localStorage.getItem(`recycleStatus-${memberId}`);

        if (savedDate !== today) {
            recycleCheck.checked = false;
            this.updateCardStatus(false, alert, greenCard);
            this.saveCardStatus(memberId, false);
        } else {
            const status = savedStatus === 'true';
            recycleCheck.checked = status;
            this.updateCardStatus(status, alert, greenCard);
        }
    }

    // 重置所有卡片
    resetAllCards() {
        this.cards.forEach((card) => {
            const memberId = card.querySelector('.member-header').getAttribute('data-member-id');
            const recycleCheck = card.querySelector('.recycleCheck');
            const alert = card.querySelector('.alert');
            const greenCard = card.querySelector('.green-card-container');
            
            recycleCheck.checked = false;
            this.updateCardStatus(false, alert, greenCard);
            this.saveCardStatus(memberId, false);
        });
    }

    // 設置時間自動重置
    setupAutoReset() {
        const checkDate = () => {
            const today = new Date().toLocaleDateString();
            const lastResetDate = localStorage.getItem('lastResetDate');
            
            if (lastResetDate !== today) {
                this.resetAllCards();
                localStorage.setItem('lastResetDate', today);
            }
        };
        checkDate();
        setInterval(checkDate, 60000);
    }
}

// 初始化
document.addEventListener('DOMContentLoaded', () => {
    new CardSlider();
});