import {
  FaUsers,
  FaBriefcase,
  FaChartBar,
  FaShieldAlt,
  FaRocket,
  FaChartLine,
  FaTrophy,
  FaLightbulb,
  FaEnvelopeOpenText,
  FaBrain,
  FaUserCheck,
  FaRobot,
  FaBolt,
  FaFunnelDollar,
} from "react-icons/fa";
import type { IconType } from "react-icons";

export interface LoginFeature {
  icon: IconType;
  title: string;
  description: string;
}

export interface LoginStat {
  icon: IconType;
  value: string;
  label: string;
}

export interface LoginPageContent {
  illustration: string;
  heading: {
    lineOne: string;
    lineTwo: string;
    highlight: string; // rendered in primary color right after lineTwo
  };
  description: string;
  features: LoginFeature[];
  highlightCard: {
    icon: IconType;
    title: string;
    description: string;
    stats: LoginStat[];
  };
  form: {
    title: string;
    subtitle: string;
    emailLabel: string;
    emailPlaceholder: string;
    passwordLabel: string;
    passwordPlaceholder: string;
    rememberLabel: string;
    forgotLabel: string;
    forgotHref: string;
    submitLabel: string;
    submitLoadingLabel: string;
    dividerLabel: string;
    registerPrompt: string;
    registerLabel: string;
    registerHref: string;
    securityNote: string;
    brandName: string;
    copyrightSuffix: string;
  };
}

export const loginPageContent: LoginPageContent = {
  illustration: "/bglogo.png",

  heading: {
    lineOne: "Smart Solutions.",
    lineTwo: "Stronger ",
    highlight: "Businesses.",
  },

  description:
    "This platform helps you manage clients, projects, and tasks in one place. Streamline your workflow, boost team collaboration, and deliver better results every time.",

  features: [
    {
      icon: FaUsers,
      title: "Client Management",
      description:
        "Organize client information and communication in a centralized system.",
    },
    {
      icon: FaBriefcase,
      title: "Project Tracking",
      description:
        "Plan, assign, and track projects to ensure timely delivery.",
    },
    {
      icon: FaChartBar,
      title: "Business Insights",
      description:
        "Get real-time reports and analytics to make smarter decisions.",
    },
    {
      icon: FaShieldAlt,
      title: "Secure & Reliable",
      description:
        "Your data is safe with role-based access and industry-standard security.",
    },
  ],

  highlightCard: {
    icon: FaRocket,
    title: "Empowering Your Success",
    description:
      "We're here to help you build better relationships, work smarter, and grow your business.",
    stats: [
      { icon: FaUsers, value: "10K+", label: "Happy Clients" },
      { icon: FaChartLine, value: "25K+", label: "Projects Managed" },
      { icon: FaTrophy, value: "98%", label: "Client Satisfaction" },
    ],
  },

  form: {
    title: "Admin Login",
    subtitle: "Welcome back! Please login to continue.",
    emailLabel: "Email Address",
    emailPlaceholder: "admin@example.com",
    passwordLabel: "Password",
    passwordPlaceholder: "••••••••••",
    rememberLabel: "Remember me",
    forgotLabel: "Forgot Password?",
    forgotHref: "/forgot-password",
    submitLabel: "Login",
    submitLoadingLabel: "Logging in...",
    dividerLabel: "or",
    registerPrompt: "Don't have an Account?",
    registerLabel: "Register",
    registerHref: "/register",
    securityNote: "Your data is protected with enterprise-grade security.",
    brandName: "Consultancy CRM",
    copyrightSuffix: "All rights reserved.",
  },
};

/**
 * CONSULTATION VARIANT
 * Same structure as loginPageContent — swap it in wherever you want the
 * consultation story instead of the generic CRM one.
 */
export const consultPageContent: LoginPageContent = {
  illustration: "/bglogo.png",

  heading: {
    lineOne: "AI Agents That",
    lineTwo: "Close More ",
    highlight: "Leads.",
  },

  description:
    "Consultancy CRM runs a team of AI agents alongside yours. They find the right prospects, score them, reach out, and tell you exactly who to call next — so your team spends its time closing, not sorting.",

  features: [
    {
      icon: FaLightbulb,
      title: "Consultation Recommendation Agent",
      description:
        "Matches every lead with the right service and consultant based on their profile and intent.",
    },
    {
      icon: FaEnvelopeOpenText,
      title: "Email Campaign Agent",
      description:
        "Writes, personalizes, and sends follow-up sequences, then adapts them to how each lead responds.",
    },
    {
      icon: FaBrain,
      title: "Lead Insight Agent",
      description:
        "Surfaces buying signals, engagement patterns, and pipeline risks from your lead data in real time.",
    },
    {
      icon: FaUserCheck,
      title: "Lead Qualification Agent",
      description:
        "Scores and sorts incoming leads automatically so your team only works the ones worth working.",
    },
  ],

  highlightCard: {
    icon: FaRobot,
    title: "Your AI Sales Team",
    description:
      "Four agents working around the clock to generate, qualify, and nurture every lead in your pipeline.",
    stats: [
      { icon: FaFunnelDollar, value: "3x", label: "More Qualified Leads" },
      { icon: FaBolt, value: "24/7", label: "Agents Working" },
      { icon: FaChartLine, value: "60%", label: "Less Manual Work" },
    ],
  },

  form: {
    title: "Admin Login",
    subtitle: "Welcome back! Please login to continue.",
    emailLabel: "Email Address",
    emailPlaceholder: "admin@example.com",
    passwordLabel: "Password",
    passwordPlaceholder: "••••••••••",
    rememberLabel: "Remember me",
    forgotLabel: "Forgot Password?",
    forgotHref: "/forgot-password",
    submitLabel: "Login",
    submitLoadingLabel: "Logging in...",
    dividerLabel: "or",
    registerPrompt: "Don't have an Account?",
    registerLabel: "Register",
    registerHref: "/register",
    securityNote: "Your data is protected with enterprise-grade security.",
    brandName: "Consultancy CRM",
    copyrightSuffix: "All rights reserved.",
  },
};





/**
 * ── SINGLE SWITCH POINT ──
 * Change the import above to pick which content set both auth pages use:
 *   consultPageContent | aiAgentsPageContent | loginPageContent
 * Nothing else needs to be touched — the login page and the register page
 * both read from here.
 */


const activeContent = loginPageContent;


export const loginLeftPanel = {
  heading: activeContent.heading,
  description: activeContent.description,
  features: activeContent.features,
  highlightCard: activeContent.highlightCard,
  illustration: activeContent.illustration,
};

export const loginFormContent = activeContent.form;

export default loginFormContent;