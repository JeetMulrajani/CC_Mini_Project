# AWS Academy - Complete Setup Guide for Quiz Generator

## 🎯 What You're Building

According to your architecture diagram, you need:
1. **AWS Cognito** - Authentication
2. **AWS Amplify/S3** - Host frontend 
3. **AWS Lambda** - Backend logic (auto-grading, result processing)
4. **DynamoDB** - Store quiz data, users, responses
5. **AWS SNS** - Send notifications/results to users

---

## 📋 STEP 1: Access AWS Console via AWS Academy

### 1.1 Get Started
1. Go to: https://www.awsacademy.instructure.com/
2. Login with your AWS Academy credentials
3. Find your course/sandbox environment
4. Click **"AWS Details"** or **"Module Labs"**
5. Look for **"Learner Lab"** - Start it if required

### 1.2 Get Your Credentials
- **Account ID**: Copy this number
- **AWS Console Link**: Click to open AWS Console
- **Region**: Usually `us-east-1` or similar

⚠️ **Important**: Some AWS Academy accounts are time-limited (4-10 hours per session)

---

## 🚀 STEP 2: Host Your React App (Amplify)

### Option A: Deploy via Amplify (Recommended)

#### 2.1 Build Your App
```bash
cd c:\Users\LENOVO\Documents\cc
npm run build
```

#### 2.2 Create GitHub Repository
1. Go to github.com
2. Create new repository: `quiz-generator`
3. Copy repository URL

#### 2.3 Push Code to GitHub
```bash
git init
git add .
git commit -m "First commit"
git remote add origin https://github.com/YOUR-USERNAME/quiz-generator.git
git branch -M main
git push -u origin main
```

#### 2.4 Deploy with AWS Amplify
1. In AWS Console, search **"Amplify"**
2. Click **"New app"** → **"Host web app"**
3. Choose **"GitHub"** → Click **"Connect to GitHub"**
4. Authorize AWS to access GitHub
5. Select repository: `quiz-generator`
6. Branch: `main`
7. Build settings (auto-detected - verify):
   ```yaml
   version: 1
   frontend:
     phases:
       preBuild:
         commands:
           - npm install
       build:
         commands:
           - npm run build
     artifacts:
       baseDirectory: build
       files:
         - '**/*'
   ```
8. Click **"Save and deploy"**
9. Wait 5-10 minutes for deployment
10. Your app URL: `https://xxxx.amplifyapp.com`

✅ **Save this URL** - You'll need it!

---

## 🔐 STEP 3: Set Up Cognito Authentication

### 3.1 Create User Pool
1. In AWS Console, search **"Cognito"**
2. Click **"Manage User Pools"**
3. Click **"Create a user pool"**

### 3.2 Configure User Pool (Step 1)
- **Pool name**: `quiz-generator-users`
- Click **"Review defaults"** (for simplicity)
- Then click **"Edit"** on each section

### 3.3 Security & User Attributes (Step 2)
1. **Password policy**: Minimum 8 characters
2. **User attributes**: 
   - ✅ **Email** (required)
   - ✅ **Username** (required)
   - ❌ Uncheck **phone_number**

### 3.4 Create App Client (Step 3)
1. Click **"App integration"** tab
2. Scroll to **App clients**
3. Click **"Add an app client"**
4. **Name**: `quiz-webapp`
5. ⚠️ **IMPORTANT**: Uncheck **"Generate client secret"**
6. **Auth flows**:
   - ✅ ALLOW_USER_PASSWORD_AUTH
   - ✅ ALLOW_REFRESH_TOKEN_AUTH
7. Click **"Save changes"**

### 3.5 Get Your Credentials
1. Note your **User Pool ID** (e.g., `us-east-1_xxxxxxxx`)
2. Note your **App Client ID** (e.g., `xxxxxxxxxxxxxxxxxxxxxxxxxx`)
3. **Save these values** - you'll need them!

✅ **Write them here**:
```
User Pool ID: us-east-1_xxxx
App Client ID: xxxx
```

---

## 💾 STEP 4: Create DynamoDB Tables

### 4.1 Go to DynamoDB
1. In AWS Console, search **"DynamoDB"**
2. Click **"Create table"**

### 4.2 Create Users Table
- **Table name**: `QuizUsers`
- **Partition key**: `userId` (String)
- **Table settings**: Use default settings
- Click **"Create table"**

### 4.3 Create Quizzes Table
- **Table name**: `Quizzes`
- **Partition key**: `quizId` (String)
- **Sort key**: `topic` (String)
- Click **"Create table"**

### 4.4 Create UserResponses Table
- **Table name**: `UserResponses`
- **Partition key**: `responseId` (String)
- **Sort key**: `userId` (String)
- Click **"Create table"**

✅ **Three tables created**!

---

## ⚡ STEP 5: Create Lambda Functions

### 5.1 Create First Function: Generate Quiz

1. **Go to Lambda Console**
   - Search **"Lambda"** in AWS Console
   - Click **"Create function"**

2. **Configure Function**:
   - Function name: `generateQuizQuestions`
   - Runtime: **Python 3.11**
   - Architecture: **x86_64**
   - Click **"Create function"**

3. **Add Code**:
   - Scroll to **"Code"** section
   - Delete default code
   - Paste this code:
   
```python
import json
import boto3
import uuid
from datetime import datetime

dynamodb = boto3.resource('dynamodb')
quizzes_table = dynamodb.Table('Quizzes')

def lambda_handler(event, context):
    try:
        # Parse request body
        body = json.loads(event['body']) if isinstance(event.get('body'), str) else event.get('body', {})
        topic = body.get('topic', '')
        num_questions = int(body.get('numQuestions', 5))
        difficulty = body.get('difficulty', 'medium')
        user_id = body.get('userId', 'unknown')
        
        # Generate quiz ID
        quiz_id = str(uuid.uuid4())
        
        # Generate questions (simplified - you can enhance this)
        questions = []
        topics_db = {
            'javascript': [
                {
                    'questionId': '1',
                    'question': 'What is the correct way to declare a variable in JavaScript?',
                    'options': ['var name = "John"', 'variable name = "John"', 'v name = "John"', 'declare name = "John"'],
                    'correctAnswer': 0
                },
                {
                    'questionId': '2',
                    'question': 'Which method is used to add an element to the end of an array?',
                    'options': ['push()', 'add()', 'append()', 'insert()'],
                    'correctAnswer': 0
                }
            ],
            'react': [
                {
                    'questionId': '1',
                    'question': 'What is React?',
                    'options': ['A database', 'A JavaScript library for building user interfaces', 'A server-side framework', 'A programming language'],
                    'correctAnswer': 1
                }
            ],
            'python': [
                {
                    'questionId': '1',
                    'question': 'What is the correct way to create a list in Python?',
                    'options': ['list = []', 'list = {}', 'list = ()', 'list = <>'],
                    'correctAnswer': 0
                }
            ]
        }
        
        topic_lower = topic.lower()
        if topic_lower in topics_db:
            questions = topics_db[topic_lower][:num_questions]
        else:
            # Generic questions
            for i in range(num_questions):
                questions.append({
                    'questionId': str(i + 1),
                    'question': f'Question {i + 1} about {topic}?',
                    'options': [f'Option A for {topic}', f'Option B for {topic}', f'Option C for {topic}', f'Option D for {topic}'],
                    'correctAnswer': i % 4
                })
        
        # Save to DynamoDB
        quiz_data = {
            'quizId': quiz_id,
            'topic': topic,
            'userId': user_id,
            'questions': questions,
            'totalQuestions': num_questions,
            'difficulty': difficulty,
            'createdAt': datetime.utcnow().isoformat(),
            'status': 'active'
        }
        
        quizzes_table.put_item(Item=quiz_data)
        
        return {
            'statusCode': 200,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Headers': 'Content-Type',
                'Access-Control-Allow-Methods': 'OPTIONS,POST,GET'
            },
            'body': json.dumps(quiz_data)
        }
    except Exception as e:
        return {
            'statusCode': 500,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps({'error': str(e)})
        }
```

4. **Click "Deploy"**

5. **Configure Permissions**:
   - Click **"Configuration"** tab
   - Click **"Permissions"**
   - Click the **execution role** name
   - Click **"Add permissions"** → **"Attach policies"**
   - Search: `AmazonDynamoDBFullAccess`
   - Check it → Click **"Attach policy"**

6. **Create Function URL**:
   - Return to Lambda function
   - Click **"Configuration"** tab
   - Click **"Function URL"** in left menu
   - Click **"Create function URL"**
   - Auth type: **NONE**
   - Enable CORS: **Yes** ✅
   - Click **"Save"**
   - **Copy the Function URL** - You'll need this!

✅ **Save this URL**: `https://xxxxxxxxxx.lambda-url.us-east-1.on.aws/`

---

### 5.2 Create Second Function: Submit Quiz

1. **Create Function**:
   - Name: `submitQuizResponse`
   - Runtime: Python 3.11
   - Architecture: x86_64
   - Click **"Create function"**

2. **Add Code**:
```python
import json
import boto3
import uuid
from datetime import datetime

dynamodb = boto3.resource('dynamodb')
responses_table = dynamodb.Table('UserResponses')
quizzes_table = dynamodb.Table('Quizzes')

def lambda_handler(event, context):
    try:
        # Parse request body
        body = json.loads(event['body']) if isinstance(event.get('body'), str) else event.get('body', {})
        user_id = body.get('userId', 'unknown')
        quiz_id = body.get('quizId', '')
        topic = body.get('topic', '')
        responses = body.get('responses', {})  # {questionId: selectedOption}
        
        # Get quiz to check correct answers
        quiz_response = quizzes_table.get_item(
            Key={'quizId': quiz_id, 'topic': topic}
        )
        
        if 'Item' not in quiz_response:
            raise Exception('Quiz not found')
        
        quiz = quiz_response['Item']
        questions = quiz['questions']
        
        # Calculate score
        correct = 0
        total = len(questions)
        
        for question in questions:
            q_id = question['questionId']
            if q_id in responses and int(responses[q_id]) == question['correctAnswer']:
                correct += 1
        
        score = (correct / total) * 100 if total > 0 else 0
        
        # Save response
        response_id = str(uuid.uuid4())
        response_data = {
            'responseId': response_id,
            'userId': user_id,
            'quizId': quiz_id,
            'topic': topic,
            'responses': responses,
            'score': score,
            'correct': correct,
            'total': total,
            'submittedAt': datetime.utcnow().isoformat()
        }
        
        responses_table.put_item(Item=response_data)
        
        return {
            'statusCode': 200,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Headers': 'Content-Type',
                'Access-Control-Allow-Methods': 'OPTIONS,POST,GET'
            },
            'body': json.dumps({
                'score': correct,
                'total': total,
                'percentage': round(score, 2),
                'responseId': response_id,
                'correct': correct,
                'incorrect': total - correct
            })
        }
    except Exception as e:
        return {
            'statusCode': 500,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps({'error': str(e)})
        }
```

3. **Deploy** the code
4. **Configure Permissions** (same as above - DynamoDB)
5. **Create Function URL** (same as above - CORS enabled)
6. **Copy the Function URL**

✅ **Save both Lambda URLs**!

---

## 🔗 STEP 6: Update Frontend Configuration

### 6.1 Update awsConfig.js
Edit `src/config/awsConfig.js` with your actual values:

```javascript
const awsConfig = {
  Auth: {
    userPoolId: 'us-east-1_YOUR_POOL_ID', // From Cognito
    userPoolWebClientId: 'YOUR_APP_CLIENT_ID', // From Cognito
    region: 'us-east-1', // Your AWS region
  },
  
  endpoints: {
    generateQuiz: 'https://xxxx.lambda-url.us-east-1.on.aws/', // Lambda URL 1
    submitQuiz: 'https://yyyy.lambda-url.us-east-1.on.aws/',     // Lambda URL 2
  }
};

export default awsConfig;
```

### 6.2 Test Your Setup
1. Open your Amplify URL
2. Try to login
3. Generate a quiz
4. Take the quiz
5. Check if results work

---

## 📊 Summary of What You Created

✅ **AWS Amplify** - Hosting frontend at `https://xxx.amplifyapp.com`  
✅ **AWS Cognito** - User Pool for authentication  
✅ **DynamoDB** - 3 tables for data storage  
✅ **Lambda** - 2 functions for backend logic  
✅ **Function URLs** - Direct HTTP endpoints  

---

## 🎯 Next: Connect Frontend to Backend

Now update your React components to call these Lambda URLs! 

Would you like me to help you update the React components to integrate with AWS?

