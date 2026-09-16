"""
Pydantic data validation schemas for Real-Time Fraud Scoring API.
"""

from pydantic import BaseModel, Field
from typing import List, Dict, Optional, Any


class TransactionPayload(BaseModel):
    """
    Input schema for a single financial transaction.
    """
    Time: float = Field(..., description="Seconds elapsed since the reference start time", json_schema_extra={"example": 406.0})
    Amount: float = Field(..., description="Transaction monetary amount in USD", json_schema_extra={"example": 149.62})
    V1: float = Field(..., json_schema_extra={"example": -1.359807})
    V2: float = Field(..., json_schema_extra={"example": -0.072781})
    V3: float = Field(..., json_schema_extra={"example": 2.536347})
    V4: float = Field(..., json_schema_extra={"example": 1.378155})
    V5: float = Field(..., json_schema_extra={"example": -0.338321})
    V6: float = Field(..., json_schema_extra={"example": 0.462388})
    V7: float = Field(..., json_schema_extra={"example": 0.239599})
    V8: float = Field(..., json_schema_extra={"example": 0.098698})
    V9: float = Field(..., json_schema_extra={"example": 0.363787})
    V10: float = Field(..., json_schema_extra={"example": 0.090794})
    V11: float = Field(..., json_schema_extra={"example": -0.551600})
    V12: float = Field(..., json_schema_extra={"example": -0.617801})
    V13: float = Field(..., json_schema_extra={"example": -0.991390})
    V14: float = Field(..., json_schema_extra={"example": -0.311169})
    V15: float = Field(..., json_schema_extra={"example": 1.468177})
    V16: float = Field(..., json_schema_extra={"example": -0.470401})
    V17: float = Field(..., json_schema_extra={"example": 0.207971})
    V18: float = Field(..., json_schema_extra={"example": 0.025791})
    V19: float = Field(..., json_schema_extra={"example": 0.403993})
    V20: float = Field(..., json_schema_extra={"example": 0.251412})
    V21: float = Field(..., json_schema_extra={"example": -0.018307})
    V22: float = Field(..., json_schema_extra={"example": 0.277838})
    V23: float = Field(..., json_schema_extra={"example": -0.110474})
    V24: float = Field(..., json_schema_extra={"example": 0.066928})
    V25: float = Field(..., json_schema_extra={"example": 0.128539})
    V26: float = Field(..., json_schema_extra={"example": -0.189115})
    V27: float = Field(..., json_schema_extra={"example": 0.133558})
    V28: float = Field(..., json_schema_extra={"example": -0.021053})


class FraudPredictionResponse(BaseModel):
    """
    Output schema containing risk score, decision flag, risk band, and latency.
    """
    transaction_id: Optional[str] = Field(None, json_schema_extra={"example": "tx_981249"})
    fraud_probability: float = Field(..., description="Calibrated probability of fraud [0.0, 1.0]", json_schema_extra={"example": 0.9142})
    is_fraud: bool = Field(..., description="Binary decision based on cost-optimal threshold", json_schema_extra={"example": True})
    risk_level: str = Field(..., description="Risk tier: LOW, MEDIUM, or CRITICAL", json_schema_extra={"example": "CRITICAL"})
    model_version: str = Field(..., json_schema_extra={"example": "1.0.0"})
    inference_latency_ms: float = Field(..., json_schema_extra={"example": 1.24})


class BatchTransactionPayload(BaseModel):
    """
    Input schema for batch inference.
    """
    transactions: List[TransactionPayload]


class BatchFraudPredictionResponse(BaseModel):
    """
    Output schema for batch transaction scoring.
    """
    total_processed: int
    frauds_detected: int
    predictions: List[FraudPredictionResponse]
    total_batch_latency_ms: float
