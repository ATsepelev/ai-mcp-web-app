// Example MCP Resources - English version

/**
 * Static Resources - Data that doesn't change frequently
 */

// Product catalog resource
const getProductCatalog = async () => {
  return {
    products: [
      {
        id: 1,
        name: "Smart Watch",
        category: "Electronics",
        price: 299.99,
        inStock: true,
        rating: 4.5
      },
      {
        id: 2,
        name: "Wireless Headphones",
        category: "Electronics",
        price: 199.99,
        inStock: true,
        rating: 4.8
      },
      {
        id: 3,
        name: "Laptop Stand",
        category: "Accessories",
        price: 49.99,
        inStock: false,
        rating: 4.2
      },
      {
        id: 4,
        name: "USB-C Hub",
        category: "Accessories",
        price: 79.99,
        inStock: true,
        rating: 4.6
      }
    ],
    lastUpdated: new Date().toISOString()
  };
};

// Configuration settings resource
const getConfiguration = async () => {
  return {
    appName: "Smart Web App",
    version: "1.0.0",
    features: {
      mcpEnabled: true,
      toolsEnabled: true,
      resourcesEnabled: true,
      darkMode: true
    },
    limits: {
      maxToolCalls: 100,
      maxResourceReads: 50,
      rateLimit: "1000/hour"
    },
    endpoints: {
      api: "https://api.example.com",
      websocket: "wss://ws.example.com",
      cdn: "https://cdn.example.com"
    }
  };
};

// FAQ/Help content resource
const getFAQContent = async () => {
  return {
    faqs: [
      {
        question: "What is MCP?",
        answer: "MCP (Model Context Protocol) is a protocol for communication between AI models and tools/resources."
      },
      {
        question: "What are MCP Resources?",
        answer: "Resources are data endpoints that can be read by the AI, like configuration files, catalogs, or dynamic data."
      },
      {
        question: "How do Resources differ from Tools?",
        answer: "Tools perform actions, while Resources provide data. Tools can modify state, Resources are read-only."
      },
      {
        question: "Can Resources be dynamic?",
        answer: "Yes! Resources can return real-time data that changes based on application state."
      }
    ],
    helpLinks: [
      { title: "MCP Specification", url: "https://spec.modelcontextprotocol.io" },
      { title: "Getting Started", url: "https://docs.example.com/getting-started" },
      { title: "API Reference", url: "https://docs.example.com/api" }
    ]
  };
};

/**
 * Dynamic Resources - Data that changes based on application state
 */

// Current form state resource
const getFormState = async () => {
  // In a real app, this would read actual form state
  const nameInput = document.querySelector('#name');
  const reviewTextarea = document.querySelector('#review');
  const stars = document.querySelectorAll('.star.filled');

  return {
    formId: "review-form",
    fields: {
      name: nameInput ? nameInput.value : "",
      rating: stars ? stars.length : 0,
      review: reviewTextarea ? reviewTextarea.value : ""
    },
    validation: {
      isValid: nameInput && nameInput.value.trim() !== "" && stars && stars.length > 0,
      errors: []
    },
    timestamp: new Date().toISOString()
  };
};

// User session data resource
const getSessionData = async () => {
  return {
    sessionId: "session_" + Date.now(),
    user: {
      isAuthenticated: false,
      role: "guest"
    },
    activity: {
      pageViews: 1,
      toolCallsCount: 0,
      resourceReadsCount: 0,
      sessionStart: new Date().toISOString()
    },
    preferences: {
      language: "en",
      theme: "light",
      notifications: true
    }
  };
};

// Real-time statistics resource
const getStatistics = async () => {
  const now = new Date();
  return {
    timestamp: now.toISOString(),
    uptime: process && process.uptime ? Math.floor(process.uptime()) : 0,
    performance: {
      memoryUsage: performance.memory ? {
        used: Math.round(performance.memory.usedJSHeapSize / 1024 / 1024) + "MB",
        total: Math.round(performance.memory.totalJSHeapSize / 1024 / 1024) + "MB",
        limit: Math.round(performance.memory.jsHeapSizeLimit / 1024 / 1024) + "MB"
      } : null,
      timing: performance.timing ? {
        loadTime: performance.timing.loadEventEnd - performance.timing.navigationStart,
        domReady: performance.timing.domContentLoadedEventEnd - performance.timing.navigationStart
      } : null
    },
    counters: {
      tools: document.querySelectorAll('.mcp-tool').length || 0,
      resources: document.querySelectorAll('.mcp-resource').length || 0,
      components: document.querySelectorAll('[data-component]').length || 0
    }
  };
};

// Page content snapshot resource
const getPageSnapshot = async () => {
  const form = document.querySelector('.review-form');
  const successMsg = document.querySelector('.success-message');
  
  return {
    url: window.location.href,
    title: document.title,
    form: {
      exists: !!form,
      visible: form ? form.style.display !== 'none' : false,
      fields: {
        name: form && document.querySelector('#name') ? document.querySelector('#name').value : "",
        rating: form && document.querySelectorAll('.star.filled') ? document.querySelectorAll('.star.filled').length : 0,
        review: form && document.querySelector('#review') ? document.querySelector('#review').value : ""
      }
    },
    messages: {
      success: successMsg ? {
        visible: successMsg.style.display !== 'none',
        text: successMsg.textContent
      } : null
    },
    viewport: {
      width: window.innerWidth,
      height: window.innerHeight,
      scrollY: window.scrollY
    },
    timestamp: new Date().toISOString()
  };
};

/**
 * Export resources in the format expected by MCP server
 */
export const EXAMPLE_RESOURCES = [
  // Static resources - compliant with MCP Spec 2025-06-18
  {
    uri: "resource://example/product-catalog",
    name: "product-catalog",
    title: "Product Catalog",  // Spec 2025-06-18: human-readable title for display
    description: "List of available products with prices and availability",
    mimeType: "application/json",
    handler: getProductCatalog,
    annotations: {
      audience: ["user", "assistant"],
      priority: 0.8,
      cachePolicy: "static",  // Custom field: how to cache
      lastModified: "2025-01-15T10:00:00Z"  // Spec 2025-06-18: ISO 8601 timestamp
    }
  },
  {
    uri: "resource://example/configuration",
    name: "configuration",
    title: "App Configuration",
    description: "Application configuration settings and limits",
    mimeType: "application/json",
    handler: getConfiguration,
    annotations: {
      audience: ["user", "assistant"],
      priority: 0.9,
      cachePolicy: "static",
      lastModified: "2025-01-15T10:00:00Z"
    }
  },
  {
    uri: "resource://example/faq",
    name: "faq",
    title: "FAQ Content",
    description: "Frequently asked questions and help content",
    mimeType: "application/json",
    handler: getFAQContent,
    annotations: {
      audience: ["user", "assistant"],
      priority: 0.7,
      cachePolicy: "static",
      lastModified: "2025-01-15T10:00:00Z"
    }
  },
  
  // Dynamic resources - compliant with MCP Spec 2025-06-18
  {
    uri: "resource://example/form-state",
    name: "form-state",
    title: "Current Form State",
    description: "Real-time state of the review form including field values and validation",
    mimeType: "application/json",
    handler: getFormState,
    annotations: {
      audience: ["assistant"],
      priority: 0.9,
      cachePolicy: "dynamic",
      lastModified: new Date().toISOString()  // Dynamic: always current timestamp
    }
  },
  {
    uri: "resource://example/session",
    name: "session",
    title: "User Session Data",
    description: "Current user session information and activity statistics",
    mimeType: "application/json",
    handler: getSessionData,
    annotations: {
      audience: ["assistant"],
      priority: 0.5,
      cachePolicy: "dynamic",
      lastModified: new Date().toISOString()
    }
  },
  {
    uri: "resource://example/statistics",
    name: "statistics",
    title: "Real-time Statistics",
    description: "Application performance metrics and real-time counters",
    mimeType: "application/json",
    handler: getStatistics,
    annotations: {
      audience: ["assistant"],
      priority: 0.3,
      cachePolicy: "dynamic",
      lastModified: new Date().toISOString()
    }
  },
  {
    uri: "resource://example/page-snapshot",
    name: "page-snapshot",
    title: "Page Content Snapshot",
    description: "Current state snapshot of the page including DOM elements and form data",
    mimeType: "application/json",
    handler: getPageSnapshot,
    annotations: {
      audience: ["assistant"],
      priority: 0.6,
      cachePolicy: "dynamic",
      lastModified: new Date().toISOString()
    }
  }
];

