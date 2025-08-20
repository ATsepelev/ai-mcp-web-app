// 工具处理函数
const setReactInputValue = (element, value) => {
  const nativeInputValueSetter = Object.getOwnPropertyDescriptor(
    window.HTMLInputElement.prototype,
    "value"
  ).set;

  const nativeTextAreaValueSetter = Object.getOwnPropertyDescriptor(
    window.HTMLTextAreaElement.prototype,
    "value"
  ).set;

  // 确定使用哪个setter
  let valueSetter;
  if (element.tagName === 'TEXTAREA') {
    valueSetter = nativeTextAreaValueSetter;
  } else {
    valueSetter = nativeInputValueSetter;
  }

  if (valueSetter) {
    valueSetter.call(element, value);
  } else {
    // 回退方案
    element.value = value;
  }

  // 创建并分发input事件
  const inputEvent = new Event('input', { bubbles: true });
  element.dispatchEvent(inputEvent);

  // 创建并分发change事件
  const changeEvent = new Event('change', { bubbles: true });
  element.dispatchEvent(changeEvent);
};

export const fillReviewForm = async (params) => {
  const {name, stars, review} = params;

  if (!name || typeof name !== 'string' || name.trim() === '') {
    throw new Error("'姓名' 字段为必填项，且必须为非空字符串。");
  }

  if (stars === undefined || stars < 1 || stars > 5 || !Number.isInteger(stars)) {
    throw new Error("'评分' 字段为必填项，且必须为1到5之间的整数。");
  }

  try {
    // 填写姓名
    const nameInput = document.querySelector('#name');
    if (nameInput) {
      setReactInputValue(nameInput, name.trim());
      console.log(`[MCP Tool] 姓名已设置: ${nameInput.value}`);
    } else {
      throw new Error("未找到姓名输入框。");
    }

    // 通过点击星星设置评分（模拟用户点击）
    const starElements = document.querySelectorAll('.star');
    if (starElements.length >= 5) {
      // 模拟真实用户点击的事件序列
      const targetStar = starElements[stars - 1];
      if (targetStar) {
        // 点击时的事件序列
        const mouseDownEvent = new MouseEvent('mousedown', { bubbles: true });
        const mouseUpEvent = new MouseEvent('mouseup', { bubbles: true });
        const clickEvent = new MouseEvent('click', { bubbles: true });

        targetStar.dispatchEvent(mouseDownEvent);
        targetStar.dispatchEvent(mouseUpEvent);
        targetStar.dispatchEvent(clickEvent);

        console.log(`[MCP Tool] 评分已设置: ${stars} 星`);
      } else {
        throw new Error(`未找到索引为 ${stars - 1} 的星星。`);
      }
    } else {
      console.warn(`[MCP Tool] 未找到星星元素 (找到 ${starElements.length} 个，需要5个)`);
      throw new Error("未找到评分元素。");
    }

    // 填写评价（如果提供）
    if (review && typeof review === 'string') {
      const reviewTextarea = document.querySelector('#review');
      if (reviewTextarea) {
        setReactInputValue(reviewTextarea, review);
        console.log(`[MCP Tool] 评价内容已设置: ${reviewTextarea.value}`);
      }
    }

    console.log(`[MCP Tool] 评价表单已填写: 姓名='${name}', 评分=${stars}, 评价='${review || ''}'`);
    return {
      success: true,
      message: `评价表单已填写: 姓名='${name}', 评分=${stars} 星${review ? `, 评价='${review}'` : ''}`
    };
  } catch (error) {
    console.error('[MCP Tool] 填写表单时出错:', error);
    throw new Error(`填写表单时出错: ${error.message}`);
  }
};

export const clickSubmitReview = async () => {
  try {
    // 查找评价表单并提交
    const reviewForm = document.querySelector('.review-form');
    if (reviewForm) {
      // 首先检查是否有明确的提交按钮
      const submitButtons = reviewForm.querySelectorAll('button[type="submit"], button.submit-button');
      if (submitButtons.length > 0) {
        // 模拟完整的点击序列
        const button = submitButtons[0];
        const mouseDownEvent = new MouseEvent('mousedown', { bubbles: true });
        const mouseUpEvent = new MouseEvent('mouseup', { bubbles: true });
        const clickEvent = new MouseEvent('click', { bubbles: true });

        button.dispatchEvent(mouseDownEvent);
        button.dispatchEvent(mouseUpEvent);
        button.dispatchEvent(clickEvent);

        console.log(`[MCP Tool] 点击了评价表单提交按钮`);
        return {success: true, message: "评价表单已提交。"};
      } else {
        // 如果没有明确的提交按钮，调用表单提交
        const event = new Event('submit', {bubbles: true, cancelable: true});
        reviewForm.dispatchEvent(event);
        console.log(`[MCP Tool] 通过submit提交了评价表单`);
        return {success: true, message: "评价表单已提交。"};
      }
    } else {
      throw new Error("未找到评价表单。");
    }
  } catch (error) {
    console.error('[MCP Tool] 提交表单时出错:', error);
    throw new Error(`提交表单时出错: ${error.message}`);
  }
};

export const clearReviewForm = async () => {
  try {
    // 清除姓名字段
    const nameInput = document.querySelector('#name');
    if (nameInput) {
      setReactInputValue(nameInput, '');
      console.log(`[MCP Tool] 姓名字段已清除`);
    }

    // 清除评分（设置为0星）
    const starElements = document.querySelectorAll('.star');
    if (starElements.length >= 5) {
      // 点击第一颗星星重置评分
      const firstStar = starElements[0];
      // 模拟点击第一颗星星左侧一点来重置
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

      // 替代方法 - 点击评分容器外的星星
      const ratingContainer = document.querySelector('.stars-rating');
      if (ratingContainer) {
        ratingContainer.click();
      }

      console.log(`[MCP Tool] 评分已重置`);
    }

    // 清除评价字段
    const reviewTextarea = document.querySelector('#review');
    if (reviewTextarea) {
      setReactInputValue(reviewTextarea, '');
      console.log(`[MCP Tool] 评价字段已清除`);
    }

    // 隐藏成功消息（如果存在）
    const successMessage = document.querySelector('.success-message');
    if (successMessage) {
      successMessage.style.display = 'none';
      console.log(`[MCP Tool] 成功消息已隐藏`);
    }

    console.log(`[MCP Tool] 评价表单已清除`);
    return {
      success: true,
      message: "评价表单已清除。"
    };
  } catch (error) {
    console.error('[MCP Tool] 清除表单时出错:', error);
    throw new Error(`清除表单时出错: ${error.message}`);
  }
};

// 以服务器期望的格式导出工具
export const REVIEW_TOOLS = [
  {
    function: {
      name: "fillReviewForm",
      description: "填写商品评价表单",
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
      description: "点击评价表单提交按钮",
      parameters: { type: "object", properties: {} }
    },
    handler: clickSubmitReview
  },
  {
    function: {
      name: "clearReviewForm",
      description: "清除商品评价表单",
      parameters: { type: "object", properties: {} }
    },
    handler: clearReviewForm
  }
];

/**
 * 在提供的服务器上注册工具处理程序。
 * @param {MCPServer} mcpServer MCPServer实例。
 */
export function registerTools(mcpServer) {
  if (!mcpServer || typeof mcpServer.onRequest !== 'function') {
    console.error('[MCP Tools] 提供的服务器实例无效。');
    return;
  }

  mcpServer.onRequest('fillReviewForm', async (params) => {
    const {name, stars, review} = params;

    if (!name || typeof name !== 'string' || name.trim() === '') {
      throw new Error("'姓名' 字段为必填项，且必须为非空字符串。");
    }

    if (stars === undefined || stars < 1 || stars > 5 || !Number.isInteger(stars)) {
      throw new Error("'评分' 字段为必填项，且必须为1到5之间的整数。");
    }

    try {
      // 填写姓名
      const nameInput = document.querySelector('#name');
      if (nameInput) {
        setReactInputValue(nameInput, name.trim());
        console.log(`[MCP Tool] 姓名已设置: ${nameInput.value}`);
      } else {
        throw new Error("未找到姓名输入框。");
      }

      // 通过点击星星设置评分（模拟用户点击）
      const starElements = document.querySelectorAll('.star');
      if (starElements.length >= 5) {
        // 模拟真实用户点击的事件序列
        const targetStar = starElements[stars - 1];
        if (targetStar) {
          // 点击时的事件序列
          const mouseDownEvent = new MouseEvent('mousedown', { bubbles: true });
          const mouseUpEvent = new MouseEvent('mouseup', { bubbles: true });
          const clickEvent = new MouseEvent('click', { bubbles: true });

          targetStar.dispatchEvent(mouseDownEvent);
          targetStar.dispatchEvent(mouseUpEvent);
          targetStar.dispatchEvent(clickEvent);

          console.log(`[MCP Tool] 评分已设置: ${stars} 星`);
        } else {
          throw new Error(`未找到索引为 ${stars - 1} 的星星。`);
        }
      } else {
        console.warn(`[MCP Tool] 未找到星星元素 (找到 ${starElements.length} 个，需要5个)`);
        throw new Error("未找到评分元素。");
      }

      // 填写评价（如果提供）
      if (review && typeof review === 'string') {
        const reviewTextarea = document.querySelector('#review');
        if (reviewTextarea) {
          setReactInputValue(reviewTextarea, review);
          console.log(`[MCP Tool] 评价内容已设置: ${reviewTextarea.value}`);
        }
      }

      console.log(`[MCP Tool] 评价表单已填写: 姓名='${name}', 评分=${stars}, 评价='${review || ''}'`);
      return {
        success: true,
        message: `评价表单已填写: 姓名='${name}', 评分=${stars} 星${review ? `, 评价='${review}'` : ''}`
      };
    } catch (error) {
      console.error('[MCP Tool] 填写表单时出错:', error);
      throw new Error(`填写表单时出错: ${error.message}`);
    }
  });

  mcpServer.onRequest('clickSubmitReview', async (params) => {
    try {
      // 查找评价表单并提交
      const reviewForm = document.querySelector('.review-form');
      if (reviewForm) {
        // 首先检查是否有明确的提交按钮
        const submitButtons = reviewForm.querySelectorAll('button[type="submit"], button.submit-button');
        if (submitButtons.length > 0) {
          // 模拟完整的点击序列
          const button = submitButtons[0];
          const mouseDownEvent = new MouseEvent('mousedown', { bubbles: true });
          const mouseUpEvent = new MouseEvent('mouseup', { bubbles: true });
          const clickEvent = new MouseEvent('click', { bubbles: true });

          button.dispatchEvent(mouseDownEvent);
          button.dispatchEvent(mouseUpEvent);
          button.dispatchEvent(clickEvent);

          console.log(`[MCP Tool] 点击了评价表单提交按钮`);
          return {success: true, message: "评价表单已提交。"};
        } else {
          // 如果没有明确的提交按钮，调用表单提交
          const event = new Event('submit', {bubbles: true, cancelable: true});
          reviewForm.dispatchEvent(event);
          console.log(`[MCP Tool] 通过submit提交了评价表单`);
          return {success: true, message: "评价表单已提交。"};
        }
      } else {
        throw new Error("未找到评价表单。");
      }
    } catch (error) {
      console.error('[MCP Tool] 提交表单时出错:', error);
      throw new Error(`提交表单时出错: ${error.message}`);
    }
  });

  mcpServer.onRequest('clearReviewForm', async (params) => {
    try {
      // 清除姓名字段
      const nameInput = document.querySelector('#name');
      if (nameInput) {
        setReactInputValue(nameInput, '');
        console.log(`[MCP Tool] 姓名字段已清除`);
      }

      // 清除评分（设置为0星）
      const starElements = document.querySelectorAll('.star');
      if (starElements.length >= 5) {
        // 点击第一颗星星重置评分
        const firstStar = starElements[0];
        // 模拟点击第一颗星星左侧一点来重置
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

        // 替代方法 - 点击评分容器外的星星
        const ratingContainer = document.querySelector('.stars-rating');
        if (ratingContainer) {
          ratingContainer.click();
        }

        console.log(`[MCP Tool] 评分已重置`);
      }

      // 清除评价字段
      const reviewTextarea = document.querySelector('#review');
      if (reviewTextarea) {
        setReactInputValue(reviewTextarea, '');
        console.log(`[MCP Tool] 评价字段已清除`);
      }

      // 隐藏成功消息（如果存在）
      const successMessage = document.querySelector('.success-message');
      if (successMessage) {
        successMessage.style.display = 'none';
        console.log(`[MCP Tool] 成功消息已隐藏`);
      }

      console.log(`[MCP Tool] 评价表单已清除`);
      return {
        success: true,
        message: "评价表单已清除。"
      };
    } catch (error) {
      console.error('[MCP Tool] 清除表单时出错:', error);
      throw new Error(`清除表单时出错: ${error.message}`);
    }
  });

  console.log('[MCP Tools] 处理程序已注册。');
}