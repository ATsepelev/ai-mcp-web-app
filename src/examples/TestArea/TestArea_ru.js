import React, { useState } from 'react';
import './TestArea.css';

const TestArea_ru = () => {
  const [name, setName] = useState('');
  const [stars, setStars] = useState(0);
  const [review, setReview] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleTestButtonClick = () => {
    alert('Тестовая кнопка нажата!');
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // Проверка обязательных полей
    if (!name.trim()) {
      alert('Пожалуйста, введите ваше имя');
      return;
    }

    if (stars === 0) {
      alert('Пожалуйста, выберите рейтинг');
      return;
    }

    // Здесь будет логика отправки отзыва
    console.log('Отзыв отправлен:', { name, stars, review });

    // Показываем сообщение об успехе
    setIsSubmitted(true);

    // Скрытие сообщения об успехе через 3 секунды
    setTimeout(() => {
      setIsSubmitted(false);
    }, 3000);
  };

  // Функция очистки формы
  const handleReset = () => {
    setName('');
    setStars(0);
    setReview('');
    setIsSubmitted(false);
    console.log('Форма очищена');
  };

  // Функция для отображения звезд
  const renderStars = () => {
    return (
      <div className="stars-rating">
        {[1, 2, 3, 4, 5].map((star) => (
          <span
            key={star}
            className={`star ${star <= stars ? 'filled' : ''}`}
            onClick={() => setStars(star)}
          >
            ★
          </span>
        ))}
      </div>
    );
  };

  return (
    <div className="test-area">
      <h3>Тестовая область</h3>

      {/* Форма отзыва */}
      <div className="review-form-container">
        <h4>Оставить отзыв о товаре</h4>
        <form className="review-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="name">Имя:</label>
            <input
              type="text"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Введите ваше имя"
              className="form-input"
            />
          </div>

          <div className="form-group">
            <label>Рейтинг:</label>
            {renderStars()}
            <div className="stars-label">
              {stars > 0 ? `${stars} звезд${stars === 1 ? 'а' : stars < 5 ? 'ы' : ''}` : 'Выберите рейтинг'}
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="review">Отзыв:</label>
            <textarea
              id="review"
              value={review}
              onChange={(e) => setReview(e.target.value)}
              placeholder="Напишите ваш отзыв о товаре"
              className="form-textarea"
              rows="4"
            />
          </div>

          <div className="form-buttons">
            <button type="submit" className="submit-button">
              Отправить отзыв
            </button>
            <button
              type="button"
              className="reset-button"
              onClick={handleReset}
            >
              Очистить форму
            </button>
          </div>
        </form>

        {isSubmitted && (
          <div className="success-message">
            ✅ Успешно отправлено!
          </div>
        )}
      </div>
    </div>
  );
};

export default TestArea_ru;