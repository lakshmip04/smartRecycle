// Oracle Cloud Infrastructure Configuration
export const OCI_CONFIG = {
  region: process.env.REACT_APP_OCI_REGION || 'us-ashburn-1',
  compartmentId: process.env.REACT_APP_OCI_COMPARTMENT_ID,
  tenancyId: process.env.REACT_APP_OCI_TENANCY_ID,
  
  // API Gateway Configuration
  apiGateway: {
    baseUrl: process.env.REACT_APP_API_BASE_URL,
    version: process.env.REACT_APP_API_VERSION || 'v1',
  },

  // Autonomous Database Configuration
  database: {
    connectionString: process.env.REACT_APP_DB_CONNECTION_STRING,
    serviceName: process.env.REACT_APP_DB_SERVICE_NAME,
  },

  // Object Storage Configuration
  objectStorage: {
    namespace: process.env.REACT_APP_OBJECT_STORAGE_NAMESPACE,
    bucket: process.env.REACT_APP_OBJECT_STORAGE_BUCKET || 'smartrecycle-materials',
  },

  // Oracle Functions Configuration
  functions: {
    endpoint: process.env.REACT_APP_FUNCTIONS_ENDPOINT,
  },

  // AI Services Configuration
  aiServices: {
    vision: process.env.REACT_APP_VISION_SERVICE_ENDPOINT,
    aiService: process.env.REACT_APP_AI_SERVICE_ENDPOINT,
  },
};

// API Endpoints for Oracle Cloud Backend
export const OCI_API_ENDPOINTS = {
  // Authentication endpoints
  auth: {
    login: `/api/${OCI_CONFIG.apiGateway.version}/auth/login`,
    register: `/api/${OCI_CONFIG.apiGateway.version}/auth/register`,
    logout: `/api/${OCI_CONFIG.apiGateway.version}/auth/logout`,
    refresh: `/api/${OCI_CONFIG.apiGateway.version}/auth/refresh`,
  },

  // User management endpoints
  users: {
    profile: `/api/${OCI_CONFIG.apiGateway.version}/users/profile`,
    update: `/api/${OCI_CONFIG.apiGateway.version}/users/profile`,
    list: `/api/${OCI_CONFIG.apiGateway.version}/users`,
    approve: `/api/${OCI_CONFIG.apiGateway.version}/users/approve`,
    delete: `/api/${OCI_CONFIG.apiGateway.version}/users`,
  },

  // Materials management endpoints
  materials: {
    list: `/api/${OCI_CONFIG.apiGateway.version}/materials`,
    create: `/api/${OCI_CONFIG.apiGateway.version}/materials`,
    update: `/api/${OCI_CONFIG.apiGateway.version}/materials`,
    delete: `/api/${OCI_CONFIG.apiGateway.version}/materials`,
    claim: `/api/${OCI_CONFIG.apiGateway.version}/materials/claim`,
    upload: `/api/${OCI_CONFIG.apiGateway.version}/materials/upload`,
  },

  // Collections management endpoints
  collections: {
    list: `/api/${OCI_CONFIG.apiGateway.version}/collections`,
    create: `/api/${OCI_CONFIG.apiGateway.version}/collections`,
    update: `/api/${OCI_CONFIG.apiGateway.version}/collections`,
    markCollected: `/api/${OCI_CONFIG.apiGateway.version}/collections/collected`,
  },

  // Collectors management endpoints
  collectors: {
    list: `/api/${OCI_CONFIG.apiGateway.version}/collectors`,
    approve: `/api/${OCI_CONFIG.apiGateway.version}/collectors/approve`,
    delete: `/api/${OCI_CONFIG.apiGateway.version}/collectors`,
    stats: `/api/${OCI_CONFIG.apiGateway.version}/collectors/stats`,
  },

  // AI Classification endpoints
  ai: {
    classify: `/api/${OCI_CONFIG.apiGateway.version}/ai/classify`,
    stats: `/api/${OCI_CONFIG.apiGateway.version}/ai/stats`,
  },

  // Analytics endpoints
  analytics: {
    dashboard: `/api/${OCI_CONFIG.apiGateway.version}/analytics/dashboard`,
    reports: `/api/${OCI_CONFIG.apiGateway.version}/analytics/reports`,
  },
};

export default OCI_CONFIG; 