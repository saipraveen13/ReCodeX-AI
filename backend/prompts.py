"""
Engineered prompts for optimal LLM performance in code analysis and rewriting
"""
from typing import List


def get_analysis_prompt(code: str, language: str) -> str:
    """
    Generate a structured prompt for code analysis
    
    Args:
        code: Source code to analyze
        language: Programming language
        
    Returns:
        Formatted prompt for LLM
    """
    return f"""You are an expert code reviewer specializing in {language}. Analyze the following code and identify ALL issues including bugs, security vulnerabilities, performance problems, and best practice violations.

**CODE TO ANALYZE:**
```{language}
{code}
```

**INSTRUCTIONS:**
1. Scan the code thoroughly for:
   - Bugs and logical errors
   - Security vulnerabilities (SQL injection, XSS, authentication issues, etc.)
   - Performance bottlenecks
   - Code quality issues (naming, structure, readability)
   - Best practice violations
   - Missing error handling
   - Resource leaks

2. For EACH issue found, provide:
   - Severity: Critical, High, Medium, or Low
   - Category: Bug, Security, Performance, Best Practice, etc.
   - Line number (if applicable)
   - Clear description of the problem
   - Specific suggestion to fix it

3. Provide an overall summary of code quality

**OUTPUT FORMAT (JSON):**
{{
  "issues": [
    {{
      "severity": "Critical|High|Medium|Low",
      "category": "Bug|Security|Performance|Best Practice|Code Quality",
      "line": <line_number_or_null>,
      "description": "Clear description of the issue",
      "suggestion": "Specific fix recommendation"
    }}
  ],
  "summary": "Overall analysis summary with key findings",
  "complexity": {{
    "time": "O(n)",
    "space": "O(1)"
  }}
}}

Be thorough and precise. Focus on actionable feedback. Ensure the response is valid JSON. Escape all newlines as \\n within JSON strings."""


def get_rewrite_prompt(code: str, language: str) -> str:
    """
    Generate a structured prompt for code rewriting
    
    Args:
        code: Source code to rewrite
        language: Programming language
        
    Returns:
        Formatted prompt for LLM
    """
    return f"""You are an expert {language} developer. Rewrite the following code to be clean, optimized, secure, and production-ready while maintaining its original functionality.
    
Analyze the complexity of BOTH the original and your rewritten version.

**ORIGINAL CODE:**
```{language}
{code}
```

**REQUIREMENTS:**
1. **Educational Clarity**: Use clean, readable code that a student can easily understand. Avoid overly complex shortcuts or high-level abstractions unless necessary.
2. **Formatting**: Maintain strict consistent indentation (4 spaces). Add empty lines (Gaps) between logical blocks, such as before and after for/while loops, if/else statements, and function definitions.
3. Fix all bugs and security vulnerabilities
4. Optimize for performance, but keep code readable
5. Follow {language} best practices and conventions
6. Add proper error handling
7. Add clear, concise comments for complex logic
8. Ensure proper resource management

**OUTPUT FORMAT (JSON):**
{{
  "rewritten_code": "The complete rewritten code",
  "original_complexity": {{
    "time": "O(n)",
    "space": "O(1)"
  }},
  "rewritten_complexity": {{
    "time": "O(log n)",
    "space": "O(1)"
  }},
  "improvements": [
    "List of specific improvements made"
  ],
  "explanation": "Overall explanation"
}}

Provide ONLY the JSON response. Ensure the rewritten code is complete and functional with proper spacing and indentation. **CRITICAL:** The "rewritten_code" field must be a valid JSON string with all newlines escaped as \\n. Ensure all vertical gaps (blank lines) are preserved in the JSON string."""


def get_chat_prompt(code: str, language: str, history: List[dict]) -> List[dict]:
    """
    Generate messages for a chat completion session
    """
    messages = [
        {
            "role": "system",
            "content": f"You are ReCodeX AI, an elite software engineering assistant. You are helping a student or developer with their {language} code. You provide precise, educational, and easy-to-understand advice. If you suggest code changes, provide the complete updated code block with perfect indentation and clear vertical spacing between logical sections."
        },
        {
            "role": "user",
            "content": f"Here is the code I'm working with:\n```{language}\n{code}\n```"
        }
    ]
    
    # Add history
    for msg in history:
        messages.append(msg)
        
    return messages
