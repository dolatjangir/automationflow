export const BASE_URL = "https://apiwbh.ibigdata.in/api";
export const API_URL = "https://apiwbh.ibigdata.in";


export const API_ROUTES = {
  CUSTOMER: {
    DASHBOARD_STATS_COUNT: `${BASE_URL}/customer/dashboard/stats-count`,
    LEADSOURCE_STATS: `${BASE_URL}/customer/dashboard/lead-source-stats`,
    LEADTEMPERATURE_STATS: `${BASE_URL}/customer/dashboard/lead-temperature-stats`,
    VISITER_CHART_STATS: `${BASE_URL}/customer/dashboard/visiter-chart-stats`,
    FOLLOWUP_CHART_STATS: `${BASE_URL}/customer/dashboard/followup-chart-stats`,
    LOCATION_STATS: `${BASE_URL}/customer/dashboard/customer-location-stats`,
    RADAR_CHART_STATS: `${BASE_URL}/customer/dashboard/radar-chart-stats`,
    GET_ALL: `${BASE_URL}/customer`,
    GET_CUSTOMER_FIELDS_VALUES: `${BASE_URL}/customer/get-customer-fields-values`,
    GET_ALL_TOTAL: `${BASE_URL}/customer/all`,
    GET_CUSTOMER_COUNT: `${BASE_URL}/customer/count`,
    GET_FAVOURITES_CUSTOMER: `${BASE_URL}/customer/favouriteS/all`,
    GET_TODAY_ALL: `${BASE_URL}/customer/today`,
    GET_BY_ID: (id: string) => `${BASE_URL}/customer/${id}`,
    GET_BY_PARAMS: (params: string) => `${BASE_URL}/customer?${params}`,
    CHECKDUPLICATES: `${BASE_URL}/customer/check-duplicates`,
    ADD: `${BASE_URL}/customer`,
    UPDATE: (id: string) => `${BASE_URL}/customer/${id}`,
    DELETE: (id: string) => `${BASE_URL}/customer/${id}`,
    DELETEALL: `${BASE_URL}/customer`,
    CUSTOMERIMPORT: `${BASE_URL}/customer/import`,
    CUSTOMEREXCELHEADERS: `${BASE_URL}/customer/import/headers`,
    ASSIGNCUSTOMER: `${BASE_URL}/customer/assign`,
    QUALIFYCUSTOMER: `${BASE_URL}/customer/qualification-agent`,
    DATAMINING: `${BASE_URL}/customer/data-mining`,
    RECOMENDCUSTOMER: `${BASE_URL}/customer/recommended-customers`,
    AGENTCALLING: `${BASE_URL}/customer/agent-call`,
    GETCALLLOGS: `${BASE_URL}/customer/getcalllogs`,
    GETCALLREPORT: `${BASE_URL}/customer/get-call-report`,
    DELETECALLLOG: (id: string) => `${BASE_URL}/customer/delete-calllog/${id}`,

    GETCLOSEDDEAL: `${BASE_URL}/customer/closed-deals`,
    GET_CLOSEDDEAL_BY_PARAMS: (params: string) => `${BASE_URL}/customer/closed-deals?${params}`,
    CLOSEDEAL: (id: string) => `${BASE_URL}/customer/close-deal/${id}`,
    REOPENDEAL: (id: string) => `${BASE_URL}/customer/reopen-deal/${id}`,

    GETARCHIEVEDCUSTOMER: `${BASE_URL}/customer/archived`,
    GET_ARCHIEVEDCUSTOMER_BY_PARAMS: (params: string) => `${BASE_URL}/customer/archived?${params}`,
    ARCHIEVECUSTOMER: `${BASE_URL}/customer/archive`,
    UNARCHIEVECUSTOMER: `${BASE_URL}/customer/unarchive`,

    ADDSHORTLIST: `${BASE_URL}/customer/shortlist`,
    GETSHORTLIST: (id: string) => `${BASE_URL}/customer/shortlist/${id}`,
    REMOVESHORTLIST: `${BASE_URL}/customer/shortlist`,
    UPDATESHORTLIST: `${BASE_URL}/customer/shortlist`,
  },
JOURNEY: {
    // Journeys
    GET_ALL: `${BASE_URL}/journey`,
    ADD: `${BASE_URL}/journey`,
    ANALYTICS: `${BASE_URL}/journey/analytics`,

    GET_BY_ID: (id: string) => `${BASE_URL}/journey/${id}`,
    UPDATE: (id: string) => `${BASE_URL}/journey/${id}`,
    UPDATE_STATUS: (id: string) => `${BASE_URL}/journey/${id}/status`,
    DELETE: (id: string) => `${BASE_URL}/journey/${id}`,

    // Test executions
    CREATE_TEST: (id: string) => `${BASE_URL}/journey/${id}/test`,
    RUN_TEST: (id: string, executionId: string) =>
      `${BASE_URL}/journey/${id}/test/${executionId}/run`,

    // Execution history
    GET_EXECUTIONS: (id: string) => `${BASE_URL}/journey/${id}/executions`,

    // Enrollments
    ENROLL: (id: string) => `${BASE_URL}/journey/${id}/enroll`,
    GET_ENROLLMENTS: (id: string) => `${BASE_URL}/journey/${id}/enrollments`,
    GET_ENROLLMENTS_BY_PARAMS: (id: string, params: string) =>
      `${BASE_URL}/journey/${id}/enrollments?${params}`,
    GET_ENROLLMENT_BY_ID: (id: string, enrollmentId: string) =>
      `${BASE_URL}/journey/${id}/enrollments/${enrollmentId}`,
    CANCEL_ENROLLMENT: (id: string, enrollmentId: string) =>
      `${BASE_URL}/journey/${id}/enrollments/${enrollmentId}`,
  },
  ADMIN: {
    // Public Routes
    SIGNUP: `${BASE_URL}/admin/signup`,
    LOGIN: `${BASE_URL}/admin/login`,
    LOGOUT: `${BASE_URL}/admin/logout`,
    AI: {
      SAVE_API_KEY: `${BASE_URL}/admin/ai/save-api-key`,
      GET_ALL: `${BASE_URL}/admin/ai/get-all`,
      UPDATE_API_KEY: (id: string) => `${BASE_URL}/admin/ai/update-api-key/${id}`,
      DELETE_API_KEY: (id: string) => `${BASE_URL}/admin/ai/delete-api-key/${id}`
    },

    // Protected Routes
    CHECK: `${BASE_URL}/admin/check`,

    // 👤 Admin Management
    CREATE: `${BASE_URL}/admin/create`,
    GET_ALL: `${BASE_URL}/admin/all`,
    GET_BY_ID: (id: String) => `${BASE_URL}/admin/${id}`,
    UPDATE_DETAILS: (id: String) => `${BASE_URL}/admin/${id}/details`,
    UPDATE_PASSWORD: (id: String) => `${BASE_URL}/admin/${id}/password`,
    DEVLOGIN: `${BASE_URL}/admin/mode/dev/login`,
    DELETE: (id: String) => `${BASE_URL}/admin/${id}`,
    MY_ACTIVE_AGENTS: `${BASE_URL}/admin/my-active-agents`,

    GENERATE_CRM_API_KEY: `${BASE_URL}/admin/generate-crm-api-key`,
    DELETE_CRM_API_KEY: (keyId: string) => `${BASE_URL}/admin/crm-api-key/${keyId}`,
    GET_CRM_API_KEYS: `${BASE_URL}/admin/crm-api-keys`
  },
  

}

