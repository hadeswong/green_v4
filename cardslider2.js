class CardSlider {
    constructor() {
        // ... 现有的代码 ...
        
        // 处理 iOS standalone 模式
        this.handleIOSStandalone();
    }

    handleIOSStandalone() {
        // 检查是否在 iOS standalone 模式下运行
        if (window.navigator.standalone) {
            // 防止双击缩放
            document.addEventListener('touchend', (e) => {
                e.preventDefault();
            }, { passive: false });

            // 防止下拉刷新
            document.body.addEventListener('touchmove', (e) => {
                if (e.touches.length > 1) {
                    e.preventDefault();
                }
            }, { passive: false });
        }
    }

    handleTouchMove(e) {
        if (!this.isDragging) return;
        
        // 只允许水平方向的滑动
        const touch = e.touches[0];
        const deltaX = touch.pageX - this.startX;
        const deltaY = touch.pageY - (this.startY || touch.pageY);
        
        if (!this.isScrolling) {
            this.isScrolling = Math.abs(deltaX) > Math.abs(deltaY);
            if (!this.isScrolling) {
                this.isDragging = false;
                return;
            }
        }
        
        if (this.isScrolling) {
            e.preventDefault();
            this.currentX = touch.pageX;
            const walk = (this.startX - this.currentX) * 1.5;
            this.cardsContainer.scrollLeft = this.startScrollLeft + walk;
        }
    }
}