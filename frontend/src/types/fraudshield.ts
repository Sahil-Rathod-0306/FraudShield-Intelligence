// =====================================================
// COMMON TYPES
// =====================================================

export type RiskLevel =
  | "LOW"
  | "MEDIUM"
  | "HIGH"
  | "CRITICAL";


export type CaseStatus =
  | "OPEN"
  | "INVESTIGATING"
  | "ESCALATED"
  | "CONFIRMED_FRAUD"
  | "FALSE_POSITIVE"
  | "CLOSED";


export type TransactionType =
  | "PAYMENT"
  | "TRANSFER"
  | "WITHDRAWAL"
  | "DEPOSIT";


export type TransactionStatus =
  | "PENDING"
  | "APPROVED"
  | "DECLINED"
  | "FLAGGED";


export type MLPrediction =
  | "FRAUD"
  | "LEGITIMATE"
  | "UNAVAILABLE";


// =====================================================
// TRANSACTION LOCATION
// =====================================================

export interface TransactionLocation {
  city?: string;

  state?: string;

  country?: string;
}


// =====================================================
// TRANSACTION
// =====================================================

export interface Transaction {
  _id: string;

  transactionId: string;

  customerId: string;

  amount: number;

  currency: string;

  merchant?: string;

  deviceId?: string;

  ipAddress?: string;

  location?:
    TransactionLocation;

  transactionType:
    TransactionType;

  status:
    TransactionStatus;

  transactionTime: string;

  createdAt?: string;

  updatedAt?: string;
}


// =====================================================
// BEHAVIOR SIGNALS
// =====================================================

export interface BehaviorSignals {
  historyCount?: number;

  averageAmount?: number;

  amountRatio?: number;

  isNewDevice?: boolean;

  isNewLocation?: boolean;

  unusualHour?: boolean;

  recent10MinCount?: number;
}


// =====================================================
// RISK ASSESSMENT
// =====================================================

export interface RiskAssessment {
  _id?: string;

  transactionId?:
    | string
    | Transaction;

  ruleRisk: number;

  behaviorRisk: number;

  mlRisk: number;

  graphRisk?: number;

  finalRisk: number;

  riskLevel:
    RiskLevel;

  reasons?: string[];

  behaviorReasons?: string[];

  behaviorSignals?:
    BehaviorSignals;

  mlPrediction?:
    MLPrediction;

  mlProbability?: number;

  modelVersion?: string;

  createdAt?: string;

  updatedAt?: string;
}


// =====================================================
// ML EVIDENCE ITEM
// =====================================================

export interface MLEvidenceItem {
  feature: string;

  value?: number;

  contribution: number;
}


// =====================================================
// OPTIONAL ALIAS
// =====================================================
// This keeps compatibility if another file imports MLEvidence.

export type MLEvidence =
  MLEvidenceItem;


// =====================================================
// FRAUD EVIDENCE
// =====================================================

export interface FraudEvidence {
  _id?: string;

  transactionId?:
    | string
    | Transaction;

  ruleEvidence?: string[];

  behaviorEvidence?: string[];

  mlEvidence?:
    MLEvidenceItem[];

  mlPrediction?:
    MLPrediction;

  mlProbability?: number;

  ruleRisk?: number;

  behaviorRisk?: number;

  mlRisk?: number;

  finalRisk?: number;

  riskLevel?:
    RiskLevel;

  createdAt?: string;

  updatedAt?: string;
}


// =====================================================
// FRAUD CASE
// =====================================================

export interface FraudCase {
  _id: string;

  caseId: string;

  customerId: string;


  // Can be MongoDB ID or populated Transaction
  transactionId:
    | string
    | Transaction;


  // Can be MongoDB ID or populated RiskAssessment
  riskAssessmentId:
    | string
    | RiskAssessment;


  riskScore: number;

  severity:
    RiskLevel;

  status:
    CaseStatus;

  title?: string;

  description?: string;

  evidence?: string[];

  assignedTo:
    | string
    | null;

  resolution:
    | string
    | null;

  createdAt: string;

  updatedAt?: string;
}


// =====================================================
// PAGINATION
// =====================================================

export interface Pagination {
  page?: number;

  limit?: number;

  total?: number;

  totalPages?: number;
}


// =====================================================
// GET FRAUD CASES RESPONSE
// =====================================================

export interface FraudCasesResponse {
  success: boolean;

  message?: string;

  data:
    | FraudCase[]
    | {
        cases?: FraudCase[];

        fraudCases?: FraudCase[];

        pagination?: {
          page: number;

          limit: number;

          total: number;

          totalPages: number;

          hasNextPage?: boolean;

          hasPreviousPage?: boolean;
        };
      };
}


// =====================================================
// SINGLE CASE DETAIL RESPONSE
// =====================================================

export interface CaseDetailResponse {
  success: boolean;

  message?: string;

  data: {

    // Backend may use either property
    case?: FraudCase;

    fraudCase?: FraudCase;


    // Separate populated transaction
    transaction?: Transaction;


    // Separate populated risk assessment
    riskAssessment?:
      RiskAssessment;


    // Backend may use either property
    evidence?:
      FraudEvidence;

    fraudEvidence?:
      FraudEvidence;
  };
}


// =====================================================
// AI INVESTIGATION STATUS
// =====================================================

export type AIInvestigationStatus =
  | "PENDING"
  | "PROCESSING"
  | "COMPLETED"
  | "FAILED";


// =====================================================
// AI INVESTIGATION
// =====================================================

export interface AIInvestigation {
  _id?: string;

  investigationId?: string;

  caseId:
    | string
    | FraudCase;

  transactionId?:
    | string
    | Transaction;

  customerId?: string;

  modelName?: string;

  model?: string;

  report: string;

  status?:
    AIInvestigationStatus;

  createdAt?: string;

  updatedAt?: string;
}


// =====================================================
// RUN AI INVESTIGATION RESPONSE
// =====================================================

export interface AIInvestigationResponse {
  success: boolean;

  message?: string;

  data: {
    investigationId: string;

    caseId: string;

    model: string;

    report: string;
  };
}


// =====================================================
// GET CASE INVESTIGATIONS RESPONSE
// =====================================================

export interface CaseInvestigationsResponse {
  success: boolean;

  message?: string;

  data: {
    investigations:
      AIInvestigation[];
  };
}


// =====================================================
// OLLAMA / AI HEALTH RESPONSE
// =====================================================

export interface AIHealthResponse {
  success: boolean;

  provider:
    "OLLAMA";

  model: string;

  status:
    | "healthy"
    | "offline";

  message?: string;
}


// =====================================================
// GENERIC SUCCESS RESPONSE
// =====================================================

export interface ApiSuccessResponse<T> {
  success: true;

  message?: string;

  data: T;
}



export interface TransactionsResponse {
  success: boolean;

  message: string;

  data: {
    transactions: Transaction[];

    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  };
}
export interface TransactionCaseSummary {
  _id: string;

  caseId: string;

  riskScore: number;

  severity:
    | "LOW"
    | "MEDIUM"
    | "HIGH"
    | "CRITICAL";

  status:
    | "OPEN"
    | "INVESTIGATING"
    | "ESCALATED"
    | "CONFIRMED_FRAUD"
    | "FALSE_POSITIVE"
    | "CLOSED";

  title?: string;

  createdAt?: string;
}


export interface TransactionDetailResponse {
  success: boolean;

  message: string;

  data: {
    transaction: Transaction;

    riskAssessment:
      RiskAssessment | null;

    fraudCase:
      TransactionCaseSummary | null;
  };
}


export interface DashboardMetrics {
  totalTransactions: number;

  flaggedTransactions: number;

  flaggedRate: number;

  totalCases: number;

  activeCases: number;

  criticalCases: number;

  confirmedFraudCases: number;

  confirmedFraudRate: number;

  averageRisk: number;
}


export interface RiskDistribution {
  LOW: number;

  MEDIUM: number;

  HIGH: number;

  CRITICAL: number;
}


export interface TransactionStatusDistribution {
  PENDING: number;

  APPROVED: number;

  DECLINED: number;

  FLAGGED: number;
}


export interface TransactionTrendItem {
  date: string;

  count: number;
}


export interface RiskTrendItem {
  date: string;

  LOW: number;

  MEDIUM: number;

  HIGH: number;

  CRITICAL: number;
}


export interface DashboardRecentCase {
  _id: string;

  caseId: string;

  customerId: string;

  riskScore: number;

  severity:
    | "LOW"
    | "MEDIUM"
    | "HIGH"
    | "CRITICAL";

  status: string;

  title?: string;

  createdAt: string;
}


export interface DashboardRecentTransaction extends Transaction {
  riskLevel?: RiskLevel;

  finalRisk?: number;
}


export interface DashboardOverviewResponse {
  success: boolean;

  message: string;

  data: {
    metrics:
      DashboardMetrics;

    riskDistribution:
      RiskDistribution;

    transactionStatus:
      TransactionStatusDistribution;

    transactionTrend:
      TransactionTrendItem[];

    riskTrend:
      RiskTrendItem[];

    recentCases:
      DashboardRecentCase[];

    recentFlaggedTransactions:
      DashboardRecentTransaction[];
  };
}

export interface DashboardOverviewResponse {
  success: boolean;

  message: string;

  data: {

    metrics:
      DashboardMetrics;

    riskDistribution:
      RiskDistribution;

    transactionStatus:
      TransactionStatusDistribution;

    transactionTrend:
      TransactionTrendItem[];

    riskTrend:
      RiskTrendItem[];

    recentCases:
      DashboardRecentCase[];

    recentFlaggedTransactions:
      DashboardRecentTransaction[];
  };
}

export type UserRole =
  | "ADMIN"
  | "ANALYST"
  | "INVESTIGATOR";


export interface AuthUser {
  id: string;

  name: string;

  email: string;

  role: UserRole;

  status?: string;

  authProvider?: string;

  isEmailVerified?: boolean;

  lastLoginAt?: string;
}


export interface LoginResponse {
  success: boolean;

  message: string;

  data: {
    token: string;

    user: AuthUser;
  };
}


export interface CurrentUserResponse {
  success: boolean;

  message: string;

  data: {
    user: AuthUser;
  };
}