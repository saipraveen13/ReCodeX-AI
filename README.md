# ReCodeX AI - Code Review & Rewrite Agent

An AI-powered code analysis and optimization platform using **Groq's Llama 3.3 70B** model, **FastAPI** backend, and modern web frontend.

![ReCodeX AI](https://img.shields.io/badge/AI-Powered-blue) ![FastAPI](https://img.shields.io/badge/FastAPI-0.109.0-green) ![Groq](https://img.shields.io/badge/Groq-Llama%203.3%2070B-purple)

## 🚀 Features

- **Real-time Code Analysis**: Detect bugs, security vulnerabilities, performance issues, and best practice violations
- **Severity Classification**: Issues categorized as Critical, High, Medium, or Low
- **Automated Code Rewriting**: AI-driven refactoring for clean, optimized, production-ready code
- **Multi-language Support**: Python, JavaScript, Java, C++, Go, Rust, TypeScript, PHP, Ruby, C#
- **Side-by-side Comparison**: Visual comparison of original vs. optimized code
- **Syntax Highlighting**: Powered by Highlight.js
- **Markdown Rendering**: Rich formatting with Marked.js
- **Export Functionality**: Download analysis results and optimized code

## 📋 Use Cases

### 1. Automated Code Review for Development Teams
- Integrate into CI/CD pipelines for automated code quality checks
- Reduce manual peer review time
- Maintain consistent coding standards across teams
- Accelerate release cycles

### 2. Intelligent Learning Tool for Programming Education
- Help students learn best practices through AI feedback
- Provide detailed explanations for code improvements
- Automate grading and personalized feedback
- Track student progress effectively

### 3. Quality Assurance for Enterprise Software
- Continuous repository scanning for quality and security
- Enforce organizational coding policies
- Reduce post-deployment bugs
- Improve long-term maintainability

## 🛠️ Technology Stack

**Backend:**
- FastAPI - High-performance Python web framework
- Groq SDK - Ultra-fast LLM inference
- Llama 3.3 70B - State-of-the-art language model
- Pydantic - Data validation

**Frontend:**
- HTML5 - Semantic markup
- Tailwind CSS - Modern utility-first styling
- JavaScript - Interactive functionality
- Marked.js - Markdown rendering
- Highlight.js - Syntax highlighting

## 📦 Installation

### Prerequisites
- Python 3.8 or higher
- Groq API key ([Get one here](https://console.groq.com/keys))

### Backend Setup

1. **Navigate to backend directory:**
```bash
cd backend
```

2. **Create virtual environment:**
```bash
python -m venv venv
```

3. **Activate virtual environment:**
- Windows:
  ```bash
  venv\Scripts\activate
  ```
- macOS/Linux:
  ```bash
  source venv/bin/activate
  ```

4. **Install dependencies:**
```bash
pip install -r requirements.txt
```

5. **Configure environment variables:**
```bash
# Copy the example file
copy .env.example .env

# Edit .env and add your Groq API key
GROQ_API_KEY=your_actual_api_key_here
```

6. **Run the backend server:**
```bash
uvicorn main:app --reload
```

The API will be available at `http://localhost:8000`

### Frontend Setup

1. **Navigate to frontend directory:**
```bash
cd frontend
```

2. **Open `index.html` in your browser:**
- Simply double-click `index.html`, or
- Use a local server (recommended):
  ```bash
  # Using Python
  python -m http.server 3000
  
  # Then visit http://localhost:3000
  ```

## 🎯 Usage

1. **Start the backend server** (see Backend Setup above)

2. **Open the frontend** in your browser

3. **Enter your code** in the code input area

4. **Select the programming language** from the dropdown

5. **Click "Analyze Code"** to get detailed feedback on:
   - Bugs and logical errors
   - Security vulnerabilities
   - Performance bottlenecks
   - Best practice violations

6. **Click "Rewrite Code"** to get:
   - Optimized, production-ready code
   - List of improvements made
   - Detailed explanation of changes

## 📡 API Endpoints

### `POST /api/analyze`
Analyze code for issues and best practice violations.

**Request:**
```json
{
  "code": "def example():\n    print('Hello')",
  "language": "python"
}
```

**Response:**
```json
{
  "success": true,
  "issues": [
    {
      "severity": "Low",
      "category": "Best Practice",
      "line": 1,
      "description": "Function missing docstring",
      "suggestion": "Add a docstring to describe the function's purpose"
    }
  ],
  "summary": "Code analysis complete. Found 1 issue.",
  "total_issues": 1,
  "critical_count": 0,
  "high_count": 0,
  "medium_count": 0,
  "low_count": 1
}
```

### `POST /api/rewrite`
Rewrite and optimize code.

**Request:**
```json
{
  "code": "def example():\n    print('Hello')",
  "language": "python"
}
```

**Response:**
```json
{
  "success": true,
  "original_code": "def example():\n    print('Hello')",
  "rewritten_code": "def example():\n    \"\"\"Print a greeting message.\"\"\"\n    print('Hello')",
  "improvements": [
    "Added docstring for better documentation",
    "Improved code readability"
  ],
  "explanation": "Enhanced the function with proper documentation..."
}
```

## 🚀 Deployment

### Backend Deployment (Render, Railway, etc.)

1. **Create a `Procfile`:**
```
web: uvicorn main:app --host 0.0.0.0 --port $PORT
```

2. **Set environment variables** on your hosting platform:
```
GROQ_API_KEY=your_api_key_here
```

3. **Deploy** using your platform's deployment process

### Frontend Deployment (Vercel, Netlify, etc.)

1. **Update API_BASE_URL** in `app.js` to your backend URL

2. **Deploy** the frontend folder to your hosting platform

## 🔒 Security Notes

- Never commit your `.env` file or expose your Groq API key
- Use environment variables for sensitive configuration
- In production, configure CORS to allow only specific origins
- Implement rate limiting for API endpoints

## 📝 License

This project is open source and available under the MIT License.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📧 Support

For issues or questions, please open an issue on GitHub.

---

**Built with ❤️ using Groq's Llama 3.3 70B**
