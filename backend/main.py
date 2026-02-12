import os
import json
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from groq import Groq
from dotenv import load_dotenv
from typing import List, Optional, Union
from fastapi.security import HTTPAuthorizationCredentials
from models import (
    CodeAnalysisRequest,
    CodeRewriteRequest,
    AnalysisResponse,
    RewriteResponse,
    Issue,
    Severity,
    HistoryEntry,
    HistoryType,
    HistoryListResponse,
    ComplexityMetadata,
    ChatRequest,
    ChatResponse,
    CodeRunRequest,
    CodeRunResponse
)
from prompts import get_analysis_prompt, get_rewrite_prompt, get_chat_prompt
import subprocess
import time
import tempfile
from database import connect_to_mongo, close_mongo_connection, get_database
from auth_routes import router as auth_router
from auth import get_current_user_email, security, decode_access_token
from fastapi import Depends
from datetime import datetime

# Load environment variables
load_dotenv()

# Initialize FastAPI app
app = FastAPI(
    title="AI Code Review & Rewrite Agent",
    description="Real-time code analysis and optimization powered by Groq's Llama 3.3 70B",
    version="1.0.0"
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, specify exact origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize Groq client
groq_api_key = os.getenv("GROQ_API_KEY")
if not groq_api_key:
    raise ValueError("GROQ_API_KEY environment variable not set")

groq_client = Groq(api_key=groq_api_key)

# Model configuration
MODEL_NAME = "llama-3.3-70b-versatile"

# Include authentication routes
app.include_router(auth_router)


@app.on_event("startup")
async def startup_event():
    """Connect to MongoDB on startup"""
    await connect_to_mongo()


@app.on_event("shutdown")
async def shutdown_event():
    """Close MongoDB connection on shutdown"""
    await close_mongo_connection()



@app.get("/api/history", response_model=HistoryListResponse)
async def get_history(email: str = Depends(get_current_user_email)):
    """
    Get code analysis and rewrite history for the current user
    """
    db = get_database()
    history_collection = db.history
    
    cursor = history_collection.find({"user_email": email}).sort("timestamp", -1).limit(50)
    history_data = await cursor.to_list(length=50)
    
    # Process Mongo _id to string for JSON serialization
    for entry in history_data:
        entry["_id"] = str(entry["_id"])
        
    return HistoryListResponse(
        success=True,
        count=len(history_data),
        history=history_data
    )


@app.delete("/api/history")
async def delete_history(email: str = Depends(get_current_user_email)):
    """
    Delete all code analysis and rewrite history for the current user
    """
    db = get_database()
    history_collection = db.history
    
    result = await history_collection.delete_many({"user_email": email})
    
    return {
        "success": True,
        "message": f"Deleted {result.deleted_count} history entries",
        "deleted_count": result.deleted_count
    }


async def save_to_history(
    email: str,
    entry_type: HistoryType,
    language: str,
    original_code: str,
    result: Union[AnalysisResponse, RewriteResponse]
):
    """Save an entry to user history"""
    try:
        db = get_database()
        history_collection = db.history
        
        entry = HistoryEntry(
            user_email=email,
            type=entry_type,
            language=language,
            original_code=original_code,
            result=result
        )
        
        # Convert to dict for Mongo
        entry_dict = entry.dict(by_alias=True)
        # Remove None id if preset
        if "id" in entry_dict and entry_dict["id"] is None:
            del entry_dict["id"]
        if "_id" in entry_dict and entry_dict["_id"] is None:
            del entry_dict["_id"]
            
        await history_collection.insert_one(entry_dict)
    except Exception as e:
        print(f"Failed to save history: {e}")


@app.post("/api/analyze", response_model=AnalysisResponse)
async def analyze_code(
    request: CodeAnalysisRequest,
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(security)
):
    """
    Analyze code for bugs, security issues, performance problems, and best practice violations
    """
    # Extract email from token if provided
    user_email = None
    if credentials:
        try:
            payload = decode_access_token(credentials.credentials)
            user_email = payload.get("sub")
        except:
            pass

    try:
        # Generate analysis prompt
        prompt = get_analysis_prompt(request.code, request.language)
        
        # Call Groq API
        chat_completion = groq_client.chat.completions.create(
            messages=[
                {
                    "role": "system",
                    "content": "You are an expert code reviewer. Always respond with valid JSON only."
                },
                {
                    "role": "user",
                    "content": prompt
                }
            ],
            model=MODEL_NAME,
            temperature=0.3,
            max_tokens=4096,
        )
        
        # Parse response
        response_text = chat_completion.choices[0].message.content
        
        # Extract JSON from response (handle markdown code blocks)
        if "```json" in response_text:
            response_text = response_text.split("```json")[1].split("```")[0].strip()
        elif "```" in response_text:
            response_text = response_text.split("```")[1].split("```")[0].strip()
        
        analysis_data = json.loads(response_text, strict=False)
        
        # Parse issues
        issues = []
        severity_counts = {"Critical": 0, "High": 0, "Medium": 0, "Low": 0}
        
        for issue_data in analysis_data.get("issues", []):
            severity = issue_data.get("severity", "Low")
            if severity in severity_counts:
                severity_counts[severity] += 1
            
            issue = Issue(
                severity=Severity(severity),
                category=issue_data.get("category", "General"),
                line=issue_data.get("line"),
                description=issue_data.get("description", ""),
                suggestion=issue_data.get("suggestion", "")
            )
            issues.append(issue)
        
        analysis_response = AnalysisResponse(
            success=True,
            issues=issues,
            summary=analysis_data.get("summary", "Analysis complete"),
            complexity=ComplexityMetadata(**analysis_data.get("complexity")) if analysis_data.get("complexity") else None,
            total_issues=len(issues),
            critical_count=severity_counts["Critical"],
            high_count=severity_counts["High"],
            medium_count=severity_counts["Medium"],
            low_count=severity_counts["Low"]
        )

        # Save to history if user is authenticated
        if user_email:
            await save_to_history(
                email=user_email,
                entry_type=HistoryType.ANALYZE,
                language=request.language,
                original_code=request.code,
                result=analysis_response
            )
        
        return analysis_response
        
    except json.JSONDecodeError as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to parse AI response: {str(e)}"
        )
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Analysis failed: {str(e)}"
        )


@app.post("/api/rewrite", response_model=RewriteResponse)
async def rewrite_code(
    request: CodeRewriteRequest,
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(security)
):
    """
    Rewrite and optimize code following best practices
    """
    # Extract email from token if provided
    user_email = None
    if credentials:
        try:
            payload = decode_access_token(credentials.credentials)
            user_email = payload.get("sub")
        except:
            pass
    try:
        # Generate rewrite prompt
        prompt = get_rewrite_prompt(request.code, request.language)
        
        # Call Groq API
        chat_completion = groq_client.chat.completions.create(
            messages=[
                {
                    "role": "system",
                    "content": "You are an expert software engineer. Always respond with valid JSON only."
                },
                {
                    "role": "user",
                    "content": prompt
                }
            ],
            model=MODEL_NAME,
            temperature=0.4,
            max_tokens=8192,
        )
        
        # Parse response
        response_text = chat_completion.choices[0].message.content
        
        # Extract JSON from response
        if "```json" in response_text:
            response_text = response_text.split("```json")[1].split("```")[0].strip()
        elif "```" in response_text:
            response_text = response_text.split("```")[1].split("```")[0].strip()
        
        rewrite_data = json.loads(response_text, strict=False)
        
        rewrite_response = RewriteResponse(
            success=True,
            original_code=request.code,
            rewritten_code=rewrite_data.get("rewritten_code", ""),
            original_complexity=ComplexityMetadata(**rewrite_data.get("original_complexity")) if rewrite_data.get("original_complexity") else None,
            rewritten_complexity=ComplexityMetadata(**rewrite_data.get("rewritten_complexity")) if rewrite_data.get("rewritten_complexity") else None,
            improvements=rewrite_data.get("improvements", []),
            explanation=rewrite_data.get("explanation", "Code has been optimized")
        )

        # Save to history if user is authenticated
        if user_email:
            await save_to_history(
                email=user_email,
                entry_type=HistoryType.REWRITE,
                language=request.language,
                original_code=request.code,
                result=rewrite_response
            )
            
        return rewrite_response
        
    except json.JSONDecodeError as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to parse AI response: {str(e)}"
        )
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Rewrite failed: {str(e)}"
        )


@app.post("/api/run", response_model=CodeRunResponse)
async def run_code(request: CodeRunRequest):
    """
    Execute code and return the output
    """
    lang = request.language.lower()
    code = request.code
    
    # Supported languages and their commands
    commands = {
        "python": ["python", "-c"],
        "javascript": ["node", "-e"]
    }
    
    if lang not in commands:
        return CodeRunResponse(
            success=False,
            output="",
            error=f"Execution for {lang} is not yet supported. Only Python and JavaScript are available.",
            execution_time=0.0
        )
    
    start_time = time.time()
    try:
        # For more complex scripts, writing to a temp file is better, 
        # but for student "compile" testing, -c or -e works for basic snippets.
        # We'll use a temp file to avoid shell escaping issues and handle larger blocks.
        with tempfile.NamedTemporaryFile(mode='w', suffix=f".{ 'py' if lang == 'python' else 'js' }", delete=False) as f:
            f.write(code)
            temp_path = f.name
            
        cmd = ["python" if lang == "python" else "node", temp_path]
        
        process = subprocess.run(
            cmd,
            capture_output=True,
            text=True,
            timeout=5 # 5 second timeout for safety
        )
        
        execution_time = time.time() - start_time
        
        # Cleanup temp file
        if os.path.exists(temp_path):
            os.remove(temp_path)
            
        return CodeRunResponse(
            success=process.returncode == 0,
            output=process.stdout,
            error=process.stderr if process.returncode != 0 else None,
            execution_time=round(execution_time, 3)
        )
        
    except subprocess.TimeoutExpired:
        execution_time = time.time() - start_time
        return CodeRunResponse(
            success=False,
            output="",
            error="Execution timed out (5s limit). Please check for infinite loops!",
            execution_time=round(execution_time, 3)
        )
    except Exception as e:
        execution_time = time.time() - start_time
        return CodeRunResponse(
            success=False,
            output="",
            error=f"Execution error: {str(e)}",
            execution_time=round(execution_time, 3)
        )
async def chat_with_ai(
    request: ChatRequest,
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(security)
):
    """
    Interactive chat session about the code
    """
    try:
        # Prepare history for prompt
        history = [{"role": m.role, "content": m.content} for m in request.messages]
        messages = get_chat_prompt(request.code, request.language, history)
        
        # Call Groq API
        chat_completion = groq_client.chat.completions.create(
            messages=messages,
            model=MODEL_NAME,
            temperature=0.5,
            max_tokens=4096,
        )
        
        reply = chat_completion.choices[0].message.content
        
        # Optionally extract code if the AI provided one
        new_code = None
        if "```" in reply:
            try:
                # Basic code extraction logic
                parts = reply.split("```")
                for i in range(1, len(parts), 2):
                    content = parts[i].strip()
                    # Skip if it's just the language name
                    if "\n" in content:
                        new_code = content.split("\n", 1)[1].strip()
                        break
            except:
                pass

        return ChatResponse(
            success=True,
            reply=reply,
            new_code=new_code
        )
        
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Chat failed: {str(e)}"
        )


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
