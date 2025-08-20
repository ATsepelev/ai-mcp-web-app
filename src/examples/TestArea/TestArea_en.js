import React, { useState } from 'react';
import './TestArea.css';

const TestArea = () => {
  const [name, setName] = useState('');
  const [stars, setStars] = useState(0);
  const [review, setReview] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleTestButtonClick = () => {
    alert('Test button clicked!');
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // Validation of required fields
    if (!name.trim()) {
      alert('Please enter your name');
      return;
    }

    if (stars === 0) {
      alert('Please select a rating');
      return;
    }

    // Review submission logic
    console.log('Review submitted:', { name, stars, review });

    // Show success message
    setIsSubmitted(true);

    // Hide success message after 3 seconds
    setTimeout(() => {
      setIsSubmitted(false);
    }, 3000);
  };

  // Form reset function
  const handleReset = () => {
    setName('');
    setStars(0);
    setReview('');
    setIsSubmitted(false);
    console.log('Form cleared');
  };

  // Function to render stars
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

  // Function to get star label
  const getStarsLabel = () => {
    if (stars === 0) return 'Select rating';
    if (stars === 1) return '1 star';
    return `${stars} stars`;
  };

  return (
    <div className="test-area">
      <h3>Test Area</h3>

      {/* Review form */}
      <div className="review-form-container">
        <h4>Leave a product review</h4>
        <form className="review-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="name">Name:</label>
            <input
              type="text"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter your name"
              className="form-input"
            />
          </div>

          <div className="form-group">
            <label>Rating:</label>
            {renderStars()}
            <div className="stars-label">
              {getStarsLabel()}
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="review">Review:</label>
            <textarea
              id="review"
              value={review}
              onChange={(e) => setReview(e.target.value)}
              placeholder="Write your product review"
              className="form-textarea"
              rows="4"
            />
          </div>

          <div className="form-buttons">
            <button type="submit" className="submit-button">
              Submit Review
            </button>
            <button
              type="button"
              className="reset-button"
              onClick={handleReset}
            >
              Clear Form
            </button>
          </div>
        </form>

        {isSubmitted && (
          <div className="success-message">
            ✅ Successfully submitted!
          </div>
        )}
      </div>
    </div>
  );
};

export default TestArea;