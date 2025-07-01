import React from "react";
import "./ReferralBlock.css";

function ReferralBlock({ code, link, inviter, level, nextLevelCount, progressCount }) {
    // Вычисляем процент заполнения для прогресс-бара
    const progressPercent = nextLevelCount > 0
        ? Math.min(100, Math.round((progressCount / nextLevelCount) * 100))
        : 0;

    return (
        <div className="referral-block">
            {/* Индикатор уровня с венком и номером уровня */}
            <div className="level-indicator">
                <div className="wreath-icon">
                    {/* Венок из 12 листьев (span), расположенных по кругу */}
                    {[...Array(12)].map((_, i) => (
                        <span key={i} className="leaf" />
                    ))}
                </div>
                <span className="level-text">Уровень {level}</span>
            </div>

            {/* Прогресс-бар опыта до следующего уровня */}
            <div className="progress-bar">
                <div
                    className="progress-fill"
                    style={{ width: progressPercent + "%" }}
                />
            </div>
            <div className="progress-label">
                {progressCount} / {nextLevelCount}
            </div>

            {/* Поле реферального кода с кнопкой копирования */}
            <div className="field code-field">
                <label>Ваш реферальный код</label>
                <div className="input-group">
                    <input type="text" readOnly value={code} />
                    <button type="button" className="copy-btn"></button>
                </div>
            </div>

            {/* Поле реферальной ссылки с кнопкой копирования */}
            <div className="field link-field">
                <label>Ваша реферальная ссылка</label>
                <div className="input-group">
                    <input type="text" readOnly value={link} />
                    <button type="button" className="copy-btn"></button>
                </div>
            </div>

            {/* Блок с информацией о наставнике */}
            <div className="mentor">
                Ваш наставник: {inviter}
            </div>
        </div>
    );
}

export default ReferralBlock;
