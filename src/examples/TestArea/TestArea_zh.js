import React, { useState } from 'react';
import './TestArea.css';

const TestArea = () => {
  const [name, setName] = useState('');
  const [stars, setStars] = useState(0);
  const [review, setReview] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleTestButtonClick = () => {
    alert('测试按钮已点击！');
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // 验证必填字段
    if (!name.trim()) {
      alert('请输入您的姓名');
      return;
    }

    if (stars === 0) {
      alert('请选择评分');
      return;
    }

    // 评价提交逻辑
    console.log('评价已提交:', { name, stars, review });

    // 显示成功消息
    setIsSubmitted(true);

    // 3秒后隐藏成功消息
    setTimeout(() => {
      setIsSubmitted(false);
    }, 3000);
  };

  // 表单重置函数
  const handleReset = () => {
    setName('');
    setStars(0);
    setReview('');
    setIsSubmitted(false);
    console.log('表单已清除');
  };

  // 渲染星星的函数
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

  // 获取星星标签的函数
  const getStarsLabel = () => {
    if (stars === 0) return '请选择评分';
    return `${stars} 星`;
  };

  return (
    <div className="test-area">
      <h3>测试区域</h3>

      {/* 评价表单 */}
      <div className="review-form-container">
        <h4>留下商品评价</h4>
        <form className="review-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="name">姓名:</label>
            <input
              type="text"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="请输入您的姓名"
              className="form-input"
            />
          </div>

          <div className="form-group">
            <label>评分:</label>
            {renderStars()}
            <div className="stars-label">
              {getStarsLabel()}
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="review">评价:</label>
            <textarea
              id="review"
              value={review}
              onChange={(e) => setReview(e.target.value)}
              placeholder="请写下您对商品的评价"
              className="form-textarea"
              rows="4"
            />
          </div>

          <div className="form-buttons">
            <button type="submit" className="submit-button">
              提交评价
            </button>
            <button
              type="button"
              className="reset-button"
              onClick={handleReset}
            >
              清除表单
            </button>
          </div>
        </form>

        {isSubmitted && (
          <div className="success-message">
            ✅ 提交成功！
          </div>
        )}
      </div>
    </div>
  );
};

export default TestArea;