# Core Agent System

A minimal AI agent that processes user requests and generates structured execution plans.

## Features

- **Interactive Terminal Interface**: Accept user requests via command line
- **LLM Integration**: Uses OpenAI GPT-4 for intelligent planning
- **Structured Output**: Validates and formats responses as JSON
- **Error Handling**: Robust error handling for API failures and invalid responses
- **Modular Design**: Separate prompt files for easy customization

## Files

- `main.py` - Core agent logic and execution loop
- `system_prompt.txt` - System prompt defining agent behavior
- `planner_prompt.txt` - Specific prompt for plan generation
- `requirements.txt` - Python dependencies

## Setup

1. Install dependencies:
```bash
pip install -r requirements.txt
```

2. Set your OpenAI API key:
```bash
export OPENAI_API_KEY="your-api-key-here"
```

3. Run the agent:
```bash
python main.py
```

## Usage

1. Start the agent with `python main.py`
2. Enter your request when prompted
3. The agent will generate a structured plan with:
   - Task analysis
   - Step-by-step execution plan
   - Requirements and dependencies
   - Success criteria
4. Type 'quit' to exit

## Example

```
> I want to build a personal portfolio website

🤖 AGENT GENERATED PLAN
============================================================

📋 Task Analysis:
   User wants to create a personal portfolio website to showcase their work and skills

📝 Execution Plan:
   Step 1: Planning and Design
   Description: Define website goals, target audience, and create wireframes
   Estimated Time: 2-3 hours

   Step 2: Choose Technology Stack
   Description: Select framework (React, Vue, etc.) and hosting platform
   Estimated Time: 1 hour

   ...
```