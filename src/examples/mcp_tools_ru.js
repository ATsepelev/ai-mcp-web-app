// Функции-обработчики инструментов
  const setReactInputValue = (element, value) => {
    const nativeInputValueSetter = Object.getOwnPropertyDescriptor(
      window.HTMLInputElement.prototype,
      "value"
    ).set;

    const nativeTextAreaValueSetter = Object.getOwnPropertyDescriptor(
      window.HTMLTextAreaElement.prototype,
      "value"
    ).set;

    // Определяем, какой setter использовать
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

    // Создаем и диспатчим событие input
    const inputEvent = new Event('input', { bubbles: true });
    element.dispatchEvent(inputEvent);

    // Создаем и диспатчим событие change
    const changeEvent = new Event('change', { bubbles: true });
    element.dispatchEvent(changeEvent);
  };

export const fillReviewForm = async (params) => {
    const {name, stars, review} = params;

    if (!name || typeof name !== 'string' || name.trim() === '') {
      throw new Error("Поле 'Имя' обязательно и должно быть непустой строкой.");
    }

    if (stars === undefined || stars < 1 || stars > 5 || !Number.isInteger(stars)) {
      throw new Error("Поле 'Рейтинг' обязательно и должно быть целым числом от 1 до 5.");
    }

    try {
      // Заполняем имя
      const nameInput = document.querySelector('#name');
      if (nameInput) {
        setReactInputValue(nameInput, name.trim());
        console.log(`[MCP Tool] Установлено имя: ${nameInput.value}`);
      } else {
        throw new Error("Поле ввода имени не найдено.");
      }

      // Устанавливаем рейтинг через клик по звездам (имитируем клик пользователя)
      const starElements = document.querySelectorAll('.star');
      if (starElements.length >= 5) {
        // Имитируем последовательность событий, как при реальном клике пользователя
        const targetStar = starElements[stars - 1];
        if (targetStar) {
          // Последовательность событий при клике
          const mouseDownEvent = new MouseEvent('mousedown', { bubbles: true });
          const mouseUpEvent = new MouseEvent('mouseup', { bubbles: true });
          const clickEvent = new MouseEvent('click', { bubbles: true });

          targetStar.dispatchEvent(mouseDownEvent);
          targetStar.dispatchEvent(mouseUpEvent);
          targetStar.dispatchEvent(clickEvent);

          console.log(`[MCP Tool] Установлен рейтинг: ${stars} звезд`);
        } else {
          throw new Error(`Звезда с индексом ${stars - 1} не найдена.`);
        }
      } else {
        console.warn(`[MCP Tool] Не найдены элементы звезд (найдено ${starElements.length} вместо 5)`);
        throw new Error("Элементы рейтинга не найдены.");
      }

      // Заполняем отзыв (если передан)
      if (review && typeof review === 'string') {
        const reviewTextarea = document.querySelector('#review');
        if (reviewTextarea) {
          setReactInputValue(reviewTextarea, review);
          console.log(`[MCP Tool] Установлен текст отзыва: ${reviewTextarea.value}`);
        }
      }

      console.log(`[MCP Tool] Форма отзыва заполнена: имя='${name}', рейтинг=${stars}, отзыв='${review || ''}'`);
      return {
        success: true,
        message: `Форма отзыва успешно заполнена`,
        data: {
          name: name.trim(),
          rating: stars,
          review: review || null,
          fieldsSet: ['name', 'rating', review ? 'review' : null].filter(Boolean)
        }
      };
    } catch (error) {
      console.error('[MCP Tool] Ошибка при заполнении формы:', error);
      throw new Error(`Ошибка при заполнении формы: ${error.message}`);
    }
};

export const clickSubmitReview = async () => {
      try {
      // Находим форму отзыва и отправляем её
      const reviewForm = document.querySelector('.review-form');
      if (reviewForm) {
        // Сначала проверяем, есть ли явная кнопка submit
        const submitButtons = reviewForm.querySelectorAll('button[type="submit"], button.submit-button');
        let submitMethod;
        if (submitButtons.length > 0) {
          // Имитируем полную последовательность клика
          const button = submitButtons[0];
          const mouseDownEvent = new MouseEvent('mousedown', { bubbles: true });
          const mouseUpEvent = new MouseEvent('mouseup', { bubbles: true });
          const clickEvent = new MouseEvent('click', { bubbles: true });

          button.dispatchEvent(mouseDownEvent);
          button.dispatchEvent(mouseUpEvent);
          button.dispatchEvent(clickEvent);
          submitMethod = 'button_click';

          console.log(`[MCP Tool] Нажата кнопка отправки формы отзыва`);
        } else {
          // Если нет явной кнопки submit, вызываем submit формы
          const event = new Event('submit', {bubbles: true, cancelable: true});
          reviewForm.dispatchEvent(event);
          submitMethod = 'form_submit';
          console.log(`[MCP Tool] Форма отзыва отправлена через submit`);
        }
        return {
          success: true, 
          message: `Форма отзыва успешно отправлена через ${submitMethod}`,
          data: {
            submitMethod,
            formFound: true
          }
        };
      } else {
        throw new Error("Форма отзыва не найдена.");
      }
    } catch (error) {
      console.error('[MCP Tool] Ошибка при отправке формы:', error);
      throw new Error(`Ошибка при отправке формы: ${error.message}`);
    }
};

export const clearReviewForm = async () => {
      try {
      const clearedFields = [];
      
      // Очищаем поле имени
      const nameInput = document.querySelector('#name');
      if (nameInput) {
        setReactInputValue(nameInput, '');
        clearedFields.push('name');
        console.log(`[MCP Tool] Поле имени очищено`);
      }

      // Очищаем рейтинг (устанавливаем 0 звезд)
      const starElements = document.querySelectorAll('.star');
      if (starElements.length >= 5) {
        // Кликаем по первой звезде, чтобы сбросить рейтинг
        const firstStar = starElements[0];
        // Имитируем клик немного левее первой звезды для сброса
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

        // Альтернативный способ - клик по контейнеру рейтинга вне звезд
        const ratingContainer = document.querySelector('.stars-rating');
        if (ratingContainer) {
          ratingContainer.click();
        }
        
        clearedFields.push('rating');
        console.log(`[MCP Tool] Рейтинг сброшен`);
      }

      // Очищаем поле отзыва
      const reviewTextarea = document.querySelector('#review');
      if (reviewTextarea) {
        setReactInputValue(reviewTextarea, '');
        clearedFields.push('review');
        console.log(`[MCP Tool] Поле отзыва очищено`);
      }

      // Скрываем сообщение об успешной отправке, если оно есть
      const successMessage = document.querySelector('.success-message');
      if (successMessage) {
        successMessage.style.display = 'none';
        console.log(`[MCP Tool] Сообщение об успехе скрыто`);
      }

      console.log(`[MCP Tool] Форма отзыва очищена`);
      return {
        success: true,
        message: "Форма отзыва успешно очищена",
        data: {
          fieldsCleared: clearedFields,
          formState: 'empty'
        }
      };
    } catch (error) {
      console.error('[MCP Tool] Ошибка при очистке формы:', error);
      throw new Error(`Ошибка при очистке формы: ${error.message}`);
    }
};

// Экспорт инструментов в формате, ожидаемом сервером
export const REVIEW_TOOLS = [
  {
    function: {
      name: "fillReviewForm",
      description: "Заполняет форму отзыва о товаре",
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
      description: "Нажимает кнопку отправки формы отзыва",
      parameters: { type: "object", properties: {} }
    },
    handler: clickSubmitReview
  },
  {
    function: {
      name: "clearReviewForm",
      description: "Очищает форму отзыва о товаре",
      parameters: { type: "object", properties: {} }
    },
    handler: clearReviewForm
  }
];