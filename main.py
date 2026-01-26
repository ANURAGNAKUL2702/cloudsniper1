#!/usr/bin/env python3
"""
Core Agent Logic - main.py
A minimal agent loop that processes user requests and generates structured plans
"""

import json
import os
import sys
from typing import Dict, Any, Optional
import openai
from pathlib import Path

# Configuration
OPENAI_API_KEY = os.getenv('OPENAI_API_KEY')
if not OPENAI_API_KEY:
    print("Error: OPENAI_API_KEY environment variable not set")
    sys.exit(1)

openai.api_key = OPENAI_API_KEY

class CoreAgent:
    def __init__(self):
        self.system_prompt = self.load_prompt('system_prompt.txt')
        self.planner_prompt = self.load_prompt('planner_prompt.txt')
    
    def load_prompt(self, filename: str) -> str:
        """Load prompt from file, with fallback defaults"""
        prompt_path = Path(filename)
        
        if prompt_path.exists():
            return prompt_path.read_text(encoding='utf-8').strip()
        
        # Fallback prompts if files don't exist
        if filename == 'system_prompt.txt':
            return """You are an intelligent AI agent that helps users break down complex tasks into structured, actionable plans.

Your role:
- Analyze user requests carefully
- Break down complex tasks into logical steps
- Provide clear, actionable instructions
- Ensure plans are practical and achievable
- Format responses as valid JSON

Always respond with structured JSON containing:
- "task_analysis": Brief analysis of the user's request
- "plan": Array of step objects with "step_number", "action", "description", "estimated_time"
- "requirements": Array of any prerequisites or dependencies
- "success_criteria": How to measure completion"""
        
        elif filename == 'planner_prompt.txt':
            return """Based on the user's request, create a detailed execution plan.

Format your response as valid JSON with this structure:
{
    "task_analysis": "Brief analysis of what the user wants to accomplish",
    "plan": [
        {
            "step_number": 1,
            "action": "Action name",
            "description": "Detailed description of this step",
            "estimated_time": "Time estimate (e.g., '5 minutes', '2 hours')"
        }
    ],
    "requirements": ["Any prerequisites", "Dependencies", "Tools needed"],
    "success_criteria": ["How to know the task is complete", "Expected outcomes"]
}

Ensure the JSON is valid and well-formatted."""
        
        return ""
    
    def send_to_llm(self, user_request: str) -> str:
        """Send request to OpenAI API and get response"""
        try:
            messages = [
                {"role": "system", "content": self.system_prompt},
                {"role": "user", "content": f"{self.planner_prompt}\n\nUser Request: {user_request}"}
            ]
            
            response = openai.ChatCompletion.create(
                model="gpt-4",
                messages=messages,
                temperature=0.7,
                max_tokens=2000
            )
            
            return response.choices[0].message.content.strip()
        
        except Exception as e:
            raise Exception(f"LLM API Error: {str(e)}")
    
    def validate_json_response(self, response: str) -> Optional[Dict[Any, Any]]:
        """Validate that the response is valid JSON"""
        try:
            # Try to find JSON in the response (in case there's extra text)
            start_idx = response.find('{')
            end_idx = response.rfind('}')
            
            if start_idx == -1 or end_idx == -1:
                raise ValueError("No JSON object found in response")
            
            json_str = response[start_idx:end_idx + 1]
            parsed_json = json.loads(json_str)
            
            # Validate required fields
            required_fields = ['task_analysis', 'plan', 'requirements', 'success_criteria']
            for field in required_fields:
                if field not in parsed_json:
                    raise ValueError(f"Missing required field: {field}")
            
            # Validate plan structure
            if not isinstance(parsed_json['plan'], list) or len(parsed_json['plan']) == 0:
                raise ValueError("Plan must be a non-empty list")
            
            for i, step in enumerate(parsed_json['plan']):
                step_fields = ['step_number', 'action', 'description', 'estimated_time']
                for field in step_fields:
                    if field not in step:
                        raise ValueError(f"Step {i+1} missing required field: {field}")
            
            return parsed_json
        
        except json.JSONDecodeError as e:
            print(f"JSON Decode Error: {str(e)}")
            return None
        except ValueError as e:
            print(f"Validation Error: {str(e)}")
            return None
    
    def print_structured_plan(self, plan_data: Dict[Any, Any]):
        """Print the structured plan in a readable format"""
        print("\n" + "="*60)
        print("🤖 AGENT GENERATED PLAN")
        print("="*60)
        
        print(f"\n📋 Task Analysis:")
        print(f"   {plan_data['task_analysis']}")
        
        print(f"\n📝 Execution Plan:")
        for step in plan_data['plan']:
            print(f"   Step {step['step_number']}: {step['action']}")
            print(f"   Description: {step['description']}")
            print(f"   Estimated Time: {step['estimated_time']}")
            print()
        
        print(f"🔧 Requirements:")
        for req in plan_data['requirements']:
            print(f"   • {req}")
        
        print(f"\n✅ Success Criteria:")
        for criteria in plan_data['success_criteria']:
            print(f"   • {criteria}")
        
        print("\n" + "="*60)
    
    def run_agent_loop(self):
        """Main agent loop - process user request"""
        print("🤖 Core Agent Initialized")
        print("Enter your request (or 'quit' to exit):")
        
        while True:
            try:
                # Get user input
                user_request = input("\n> ").strip()
                
                if user_request.lower() in ['quit', 'exit', 'q']:
                    print("👋 Agent shutting down...")
                    break
                
                if not user_request:
                    print("Please enter a valid request.")
                    continue
                
                print("🔄 Processing request...")
                
                # Send to LLM
                llm_response = self.send_to_llm(user_request)
                
                # Validate JSON
                plan_data = self.validate_json_response(llm_response)
                
                if plan_data:
                    # Print structured plan
                    self.print_structured_plan(plan_data)
                else:
                    print("❌ Failed to generate valid plan. Raw response:")
                    print(llm_response)
            
            except KeyboardInterrupt:
                print("\n👋 Agent interrupted by user")
                break
            except Exception as e:
                print(f"❌ Agent Error: {str(e)}")


def main():
    """Entry point for the core agent"""
    print("Starting Core Agent...")
    
    agent = CoreAgent()
    agent.run_agent_loop()


if __name__ == "__main__":
    main()