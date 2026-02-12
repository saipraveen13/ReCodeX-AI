from pydantic import BaseModel, Field
from typing import List, Optional, Union
from enum import Enum
from datetime import datetime


class Severity(str, Enum):
    """Issue severity levels"""
    CRITICAL = "Critical"
    HIGH = "High"
    MEDIUM = "Medium"
    LOW = "Low"


class HistoryType(str, Enum):
    """Type of history entry"""
    ANALYZE = "analyze"
    REWRITE = "rewrite"


class CodeAnalysisRequest(BaseModel):
    """Request model for code analysis"""
    code: str = Field(..., description="Source code to analyze")
    language: str = Field(..., description="Programming language (e.g., python, javascript, java)")


class CodeRewriteRequest(BaseModel):
    """Request model for code rewriting"""
    code: str = Field(..., description="Source code to rewrite")
    language: str = Field(..., description="Programming language")


class Issue(BaseModel):
    """Individual code issue"""
    severity: Severity
    category: str = Field(..., description="Issue category (e.g., Bug, Security, Performance)")
    line: Optional[int] = Field(None, description="Line number where issue occurs")
    description: str = Field(..., description="Detailed description of the issue")
    suggestion: str = Field(..., description="How to fix the issue")


class ComplexityMetadata(BaseModel):
    """Big-O complexity metrics"""
    time: str = Field(..., description="Time complexity (e.g., O(n))")
    space: str = Field(..., description="Space complexity (e.g., O(1))")


class AnalysisResponse(BaseModel):
    """Response model for code analysis"""
    success: bool
    issues: List[Issue]
    summary: str = Field(..., description="Overall analysis summary")
    complexity: Optional[ComplexityMetadata] = Field(None, description="Code complexity metrics")
    total_issues: int
    critical_count: int
    high_count: int
    medium_count: int
    low_count: int


class RewriteResponse(BaseModel):
    """Response model for code rewriting"""
    success: bool
    original_code: str
    rewritten_code: str
    original_complexity: Optional[ComplexityMetadata] = None
    rewritten_complexity: Optional[ComplexityMetadata] = None
    improvements: List[str] = Field(..., description="List of improvements made")
    explanation: str = Field(..., description="Overall explanation of changes")


class ChatMessage(BaseModel):
    """Individual chat message"""
    role: str = Field(..., description="Role: user or assistant")
    content: str = Field(..., description="Message content")


class ChatRequest(BaseModel):
    """Request model for interactive chat"""
    messages: List[ChatMessage] = Field(..., description="Chat history and new message")
    code: str = Field(..., description="The code context")
    language: str = Field(..., description="Programming language")


class ChatResponse(BaseModel):
    """Response model for interactive chat"""
    success: bool
    reply: str = Field(..., description="AI assistant's reply")
    new_code: Optional[str] = Field(None, description="Optionally updated code snippet")


class HistoryEntry(BaseModel):
    """Saved analysis or rewrite history entry"""
    id: Optional[str] = Field(None, alias="_id")
    user_email: str
    type: HistoryType
    language: str
    original_code: str
    timestamp: datetime = Field(default_factory=datetime.utcnow)
    
    # Store either analysis or rewrite result
    result: Union[AnalysisResponse, RewriteResponse]


class HistoryListResponse(BaseModel):
    """Response model for history list"""
    success: bool
    count: int
    history: List[HistoryEntry]


class CodeRunRequest(BaseModel):
    """Request model for code execution"""
    code: str = Field(..., description="Source code to execute")
    language: str = Field(..., description="Programming language")


class CodeRunResponse(BaseModel):
    """Response model for code execution"""
    success: bool
    output: str = Field(..., description="Standard output")
    error: Optional[str] = Field(None, description="Standard error or execution error")
    execution_time: float = Field(..., description="Execution time in seconds")
