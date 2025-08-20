// Tool handler functions
const setReactInputValue = (element, value) => {
  const nativeInputValueSetter = Object.getOwnPropertyDescriptor(
    window.HTMLInputElement.prototype,
    "value"
  ).set;

  const nativeTextAreaValueSetter = Object.getOwnPropertyDescriptor(
    window.HTMLTextAreaElement.prototype,
    "value"
  ).set;

  // Determine which setter to use
  let valueSetter;
  if (element.tagName === 'TEXTAREA') {
    valueSetter = nativeTextAreaValueSetter;
  } else {
    valueSetter = nativeInputValueSetter;
  }

  if (valueSetter) {
    valueSetter.call(element, value);
  } else {
    // fallback
    element.value = value;
  }

  // Create and dispatch input event
  const inputEvent = new Event('input', { bubbles: true });
  element.dispatchEvent(inputEvent);

  // Create and dispatch change event
  const changeEvent = new Event('change', { bubbles: true });
  element.dispatchEvent(changeEvent);
};

export const fillReviewForm = async (params) => {
  const {name, stars, review} = params;

  if (!name || typeof name !== 'string' || name.trim() === '') {
    throw new Error("Field 'Name' is required and must be a non-empty string.");
  }

  if (stars === undefined || stars < 1 || stars > 5 || !Number.isInteger(stars)) {
    throw new Error("Field 'Rating' is required and must be an integer from 1 to 5.");
  }

  try {
    // Fill name
    const nameInput = document.querySelector('#name');
    if (nameInput) {
      setReactInputValue(nameInput, name.trim());
      console.log(`[MCP Tool] Name set: ${nameInput.value}`);
    } else {
      throw new Error("Name input field not found.");
    }

    // Set rating by clicking stars (simulate user click)
    const starElements = document.querySelectorAll('.star');
    if (starElements.length >= 5) {
      // Simulate sequence of events as real user click
      const targetStar = starElements[stars - 1];
      if (targetStar) {
        // Sequence of events on click
        const mouseDownEvent = new MouseEvent('mousedown', { bubbles: true });
        const mouseUpEvent = new MouseEvent('mouseup', { bubbles: true });
        const clickEvent = new MouseEvent('click', { bubbles: true });

        targetStar.dispatchEvent(mouseDownEvent);
        targetStar.dispatchEvent(mouseUpEvent);
        targetStar.dispatchEvent(clickEvent);

        console.log(`[MCP Tool] Rating set: ${stars} stars`);
      } else {
        throw new Error(`Star with index ${stars - 1} not found.`);
      }
    } else {
      console.warn(`[MCP Tool] Star elements not found (found ${starElements.length} instead of 5)`);
      throw new Error("Rating elements not found.");
    }

    // Fill review (if provided)
    if (review && typeof review === 'string') {
      const reviewTextarea = document.querySelector('#review');
      if (reviewTextarea) {
        setReactInputValue(reviewTextarea, review);
        console.log(`[MCP Tool] Review text set: ${reviewTextarea.value}`);
      }
    }

    console.log(`[MCP Tool] Review form filled: name='${name}', rating=${stars}, review='${review || ''}'`);
    return {
      success: true,
      message: `Review form filled: name='${name}', rating=${stars} stars${review ? `, review='${review}'` : ''}`
    };
  } catch (error) {
    console.error('[MCP Tool] Error filling form:', error);
    throw new Error(`Error filling form: ${error.message}`);
  }
};

export const clickSubmitReview = async () => {
  try {
    // Find review form and submit it
    const reviewForm = document.querySelector('.review-form');
    if (reviewForm) {
      // First check if there's an explicit submit button
      const submitButtons = reviewForm.querySelectorAll('button[type="submit"], button.submit-button');
      if (submitButtons.length > 0) {
        // Simulate full click sequence
        const button = submitButtons[0];
        const mouseDownEvent = new MouseEvent('mousedown', { bubbles: true });
        const mouseUpEvent = new MouseEvent('mouseup', { bubbles: true });
        const clickEvent = new MouseEvent('click', { bubbles: true });

        button.dispatchEvent(mouseDownEvent);
        button.dispatchEvent(mouseUpEvent);
        button.dispatchEvent(clickEvent);

        console.log(`[MCP Tool] Review form submit button clicked`);
        return {success: true, message: "Review form submitted."};
      } else {
        // If no explicit submit button, call form submit
        const event = new Event('submit', {bubbles: true, cancelable: true});
        reviewForm.dispatchEvent(event);
        console.log(`[MCP Tool] Review form submitted via submit`);
        return {success: true, message: "Review form submitted."};
      }
    } else {
      throw new Error("Review form not found.");
    }
  } catch (error) {
    console.error('[MCP Tool] Error submitting form:', error);
    throw new Error(`Error submitting form: ${error.message}`);
  }
};

export const clearReviewForm = async () => {
  try {
    // Clear name field
    const nameInput = document.querySelector('#name');
    if (nameInput) {
      setReactInputValue(nameInput, '');
      console.log(`[MCP Tool] Name field cleared`);
    }

    // Clear rating (set 0 stars)
    const starElements = document.querySelectorAll('.star');
    if (starElements.length >= 5) {
      // Click first star to reset rating
      const firstStar = starElements[0];
      // Simulate click slightly left of first star to reset
      const mouseDownEvent = new MouseEvent('mousedown', {
        bubbles: true,
        clientX: firstStar.getBoundingClientRect().left - 10,
        clientY: firstStar.getBoundingClientRect().top + firstStar.offsetHeight / 2
      });
      const mouseUpEvent = new MouseEvent('mouseup', { bubbles: true });
      const clickEvent = new MouseEvent('click', { bubbles: true });

      firstStar.dispatchEvent(mouseDownEvent);
      firstStar.dispatchEvent(mouseUpEvent);
      firstStar.dispatchEvent(clickEvent);

      // Alternative method - click rating container outside stars
      const ratingContainer = document.querySelector('.stars-rating');
      if (ratingContainer) {
        ratingContainer.click();
      }

      console.log(`[MCP Tool] Rating reset`);
    }

    // Clear review field
    const reviewTextarea = document.querySelector('#review');
    if (reviewTextarea) {
      setReactInputValue(reviewTextarea, '');
      console.log(`[MCP Tool] Review field cleared`);
    }

    // Hide success message if present
    const successMessage = document.querySelector('.success-message');
    if (successMessage) {
      successMessage.style.display = 'none';
      console.log(`[MCP Tool] Success message hidden`);
    }

    console.log(`[MCP Tool] Review form cleared`);
    return {
      success: true,
      message: "Review form cleared."
    };
  } catch (error) {
    console.error('[MCP Tool] Error clearing form:', error);
    throw new Error(`Error clearing form: ${error.message}`);
  }
};

// Export tools in format expected by server
export const REVIEW_TOOLS = [
  {
    function: {
      name: "fillReviewForm",
      description: "Fills product review form",
      parameters: {
        type: "object",
        properties: {
          name: { type: "string" },
          stars: { type: "integer", minimum: 1, maximum: 5 },
          review: { type: "string" }
        },
        required: ["name", "stars"]
      }
    },
    handler: fillReviewForm
  },
  {
    function: {
      name: "clickSubmitReview",
      description: "Clicks review form submit button",
      parameters: { type: "object", properties: {} }
    },
    handler: clickSubmitReview
  },
  {
    function: {
      name: "clearReviewForm",
      description: "Clears product review form",
      parameters: { type: "object", properties: {} }
    },
    handler: clearReviewForm
  }
];