# Quiz Generator - AWS Backend Integration Guide

## Prerequisites

### AWS Academy Setup
1. **Access AWS Academy**: https://awsacademy.instructure.com/
2. **Get Credentials**: Click "AWS Details" → Copy Account ID and Console Login Link
3. **Start Learner Lab**: If your institution uses Learner Lab, start it first
4. **Access Console**: Use the provided login link to access AWS Console

### Required AWS Services
- AWS Amplify or S3 + CloudFront (Hosting)
- AWS Cognito (Authentication)
- AWS Lambda (Backend Logic)
- Amazon DynamoDB (Data Storage)
- Amazon SNS (Notifications)

---

## Step 1: Host Frontend with AWS Amplify

### Method 1: Connect GitHub Repository (Recommended)

1. **Build Your React App Locally**:
   ```bash
   npm run build
   ```

2. **Push to GitHub**:
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin <your-github-repo-url>
   git push -u origin main
   ```

3. **Deploy with AWS Amplify**:
   - Login to AWS Console
   - Go to **AWS Amplify** service
   - Click **"New App"** → **"Host web app"**
   - Select **GitHub** as source
   - Authorize and choose your repository
   - Configure build settings (auto-detected):
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
       cache:
         paths:
           - node_modules/**/*
     ```
   - Review and **Deploy**
   - Amplify will provide you with a URL: `https://xxx.amplifyapp.com`

### Method 2: Manual Deploy (Direct Upload)

1. **Build your app**:
   ```bash
   npm run build
   ```

2. **Zip the build folder**:
   ```bash
   cd build
   zip -r ../quiz-generator.zip .
   ```

3. **Upload to AWS Amplify**:
   - Go to AWS Amplify
   - Click **"New App"** → **"Deploy without Git provider"**
   - Upload `quiz-generator.zip`
   - Wait for deployment

---

## Step 2: Set Up AWS Cognito for Authentication

### Create User Pool

1. **Go to AWS Cognito**:
   - In AWS Console, search for **Cognito**
   - Click **"Manage User Pools"**
   - Click **"Create a user pool"**

2. **Configure User Pool**:
   - **Name**: `quiz-generator-users`
   - **Step 2 - Security**: Keep defaults
   - **Step 3 - Attributes**:
     - Email addresses (required)
     - Username (required)
     - Uncheck phone number
   - **Step 4 - Policies**:
     - Minimum password length: 8
     - Select password requirements
   - **Step 5 - MFA**: Optional (can skip for now)
   - **Step 6 - Message delivery**: Use email
   - **Step 7 - Tags**: Optional
   - **Review** and **Create pool**

3. **Configure App Integration**:
   - Click on your user pool
   - Go to **App integration** tab
   - Click **"Create app client"**
   - Name: `quiz-generator-webapp`
   - Uncheck **"Generate client secret"**
   - Click **Create**

4. **Save Credentials**:
   - Copy the **User Pool ID**
   - Copy the **App Client ID**
   - Keep these for frontend integration

---

## Step 3: Create DynamoDB Tables

### Create Users Table

1. **Go to DynamoDB Console**
2. **Click "Create table"**

**Table 1: QuizUsers**
- **Table name**: `QuizUsers`
- **Partition key**: `userId` (String)
- Click **Create table**

**Table 2: Quizzes**
- **Table name**: `Quizzes`
- **Partition key**: `quizId` (String)
- **Sort key**: `topic` (String)
- Click **Create table**

**Table 3: UserResponses**
- **Table name**: `UserResponses`
- **Partition key**: `responseId` (String)
- **Sort key**: `userId` (String)
- Click **Create table**

---

## Step 4: Create Lambda Functions

### Function 1: Generate Quiz Questions

1. **Go to AWS Lambda Console**
2. **Click "Create function"**
3. **Configure**:
   - Function name: `generateQuizQuestions`
   - Runtime: Python 3.11
   - Architecture: x86_64
   - Click **Create function**

4. **Replace code with**:
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
           body = json.loads(event['body'])
           topic = body['topic']
           num_questions = int(body['numQuestions'])
           difficulty = body['difficulty']
           user_id = body['userId']
           
           # Generate quiz ID
           quiz_id = str(uuid.uuid4())
           
           # Sample questions based on topic
           questions = get_questions_for_topic(topic, num_questions)
           
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
                   'Access-Control-Allow-Origin': '*'
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

   def get_questions_for_topic(topic, num):
       # Pre-built questions for specific topics
       # This matches your frontend logic
       questions = [
           {
               'questionId': str(i),
               'question': f'Question {i+1} about {topic}?',
               'options': ['Option A', 'Option B', 'Option C', 'Option D'],
               'correctAnswer': 0
           }
           for i in range(num)
       ]
       return questions
   ```

### Function 2: Submit Quiz and Calculate Results

1. **Create Function**: `submitQuizResponse`
2. **Runtime**: Python 3.11
3. **Code**:
   ```python
   import json
   import boto3
   import uuid
   from datetime import datetime

   dynamodb = boto3.resource('dynamodb')
   responses_table = dynamodb.Table('UserResponses')
   quizzes_table = dynamodb.Table('Quizzes')
   sns = boto3.client('sns')

   def lambda_handler(event, context):
       try:
           body = json.loads(event['body'])
           user_id = body['userId']
           quiz_id = body['quizId']
           responses = body['responses']  # {questionId: selectedOption}
           
           # Get quiz to check correct answers
           quiz_response = quizzes_table.get_item(
               Key={'quizId': quiz_id, 'topic': body['topic']}
           )
           quiz = quiz_response['Item']
           
           # Calculate score
           correct = 0
           total = len(quiz['questions'])
           
           for question in quiz['questions']:
               q_id = question['questionId']
               if q_id in responses and responses[q_id] == question['correctAnswer']:
                   correct += 1
           
           score = (correct / total) * 100
           
           # Save response
           response_id = str(uuid.uuid4())
           response_data = {
               'responseId': response_id,
               'userId': user_id,
               'quizId': quiz_id,
               'topic': quiz['topic'],
               'responses': responses,
               'score': score,
               'correct': correct,
               'total': total,
               'submittedAt': datetime.utcnow().isoformat()
           }
           
           responses_table.put_item(Item=response_data)
           
           # Send notification (optional)
           send_notification(user_id, score, total)
           
           return {
               'statusCode': 200,
               'headers': {
                   'Content-Type': 'application/json',
                   'Access-Control-Allow-Origin': '*'
               },
               'body': json.dumps({
                   'score': correct,
                   'total': total,
                   'percentage': score,
                   'responseId': response_id
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

   def send_notification(user_id, score, total):
       # Optional: Send SNS notification
       try:
           message = f'Quiz complete! Score: {score}/{total}'
           sns.publish(
               TopicArn='your-topic-arn',
               Message=message
           )
       except:
           pass
   ```

### Configure Lambda Permissions

1. **For each Lambda function**:
   - Go to **Configuration** → **Permissions**
   - Click on **Execution role**
   - Click **"Add permissions"** → **"Attach policies"**
   - Attach:
     - `AmazonDynamoDBFullAccess`
     - `AmazonSNSFullAccess`

### Configure CORS for Lambda

1. **For each function**:
   - Go to **Configuration** → **Function URL**
   - Click **Create function URL**
   - Auth type: **NONE** (or AWS_IAM if using Cognito)
   - Enable CORS
   - Copy the Function URL

---

## Step 5: Configure API Gateway (Alternative to Function URLs)

### Create REST API

1. **Go to API Gateway Console**
2. **Create REST API**:
   - Name: `quiz-generator-api`
   - Description: "API for Quiz Generator"
   - Endpoint Type: Regional
   - Click **Create API**

3. **Create Resources and Methods**:
   - **POST /generate-quiz** → Points to `generateQuizQuestions` Lambda
   - **POST /submit-quiz** → Points to `submitQuizResponse` Lambda

4. **Enable CORS**:
   - Select each method
   - Click **Actions** → **Enable CORS**
   - Configure CORS settings
   - Deploy API

5. **Deploy API**:
   - Click **Actions** → **Deploy API**
   - Stage: `prod`
   - Click **Deploy**
   - Copy the **API endpoint URL**

---

## Step 6: Update Frontend to Connect with AWS

### Install AWS SDK

```bash
npm install aws-amplify @aws-amplify/ui-react
```

### Update Frontend Configuration

Create `src/config/awsConfig.js`:

```javascript
import Amplify, { Auth } from 'aws-amplify';

Amplify.configure({
  Auth: {
    userPoolId: 'YOUR_USER_POOL_ID', // From Cognito
    userPoolWebClientId: 'YOUR_APP_CLIENT_ID', // From Cognito
    region: 'us-east-1' // Change to your region
  },
  API: {
    endpoints: [
      {
        name: 'quizApi',
        endpoint: 'YOUR_API_GATEWAY_URL', // From API Gateway
        region: 'us-east-1'
      }
    ]
  }
});

export default Amplify;
```

---

## Step 7: Update Components

### Update Login Component

```javascript
// src/components/Login.js
import { Auth } from 'aws-amplify';

const handleSubmit = async (e) => {
  e.preventDefault();
  try {
    await Auth.signUp({
      username: formData.username,
      password: 'TempPassword123!',
      attributes: {
        email: formData.email
      }
    });
    
    // User created, now sign in
    await Auth.signIn(formData.username, 'TempPassword123!');
    
    const user = await Auth.currentAuthenticatedUser();
    onLogin(user.attributes);
    navigate('/topic');
  } catch (error) {
    setError(error.message);
  }
};
```

### Update TopicInput to Use Lambda

```javascript
// src/components/TopicInput.js
import { API } from 'aws-amplify';

const generateQuiz = async (topic, numQuestions, difficulty, userId) => {
  try {
    const result = await API.post('quizApi', '/generate-quiz', {
      body: {
        topic,
        numQuestions,
        difficulty,
        userId
      }
    });
    return result;
  } catch (error) {
    console.error('Error generating quiz:', error);
    throw error;
  }
};
```

---

## Step 8: Update Quiz Component for Results

```javascript
// src/components/Quiz.js
import { API } from 'aws-amplify';

const handleSubmitQuiz = async () => {
  try {
    const result = await API.post('quizApi', '/submit-quiz', {
      body: {
        userId: user.userId,
        quizId: quizData.quizId,
        topic: quizData.topic,
        responses: selectedAnswers
      }
    });
    
    // Show results with data from result
    setShowResults(true);
  } catch (error) {
    console.error('Error submitting quiz:', error);
  }
};
```

---

## Summary

Your architecture now includes:

✅ **Hosting**: AWS Amplify (or S3 + CloudFront)  
✅ **Authentication**: AWS Cognito  
✅ **Storage**: Amazon DynamoDB  
✅ **Compute**: AWS Lambda  
✅ **Notifications**: Amazon SNS  
✅ **API**: API Gateway  

### Next Steps:

1. **Complete AWS Setup** following this guide
2. **Update frontend configuration** with your AWS credentials
3. **Test the complete flow**: Login → Generate Quiz → Take Quiz → Submit & Get Results
4. **Monitor** using CloudWatch and DynamoDB Console

### Important Notes:

- **AWS Academy credits** are limited - monitor usage
- **Replace placeholders** (YOUR_POOL_ID, etc.) with actual values
- **Test each service** individually before full integration
- **Enable CORS** properly to avoid cross-origin issues
- **Secure Lambda functions** with proper IAM roles

---

## Troubleshooting

### CORS Errors
- Ensure CORS is enabled on API Gateway
- Check Lambda function returns proper CORS headers

### Cognito Errors
- Verify User Pool ID and App Client ID are correct
- Check user pool is in correct region

### DynamoDB Errors
- Ensure table names match
- Check IAM permissions for Lambda

### Lambda Timeout
- Increase timeout in Lambda configuration
- Check CloudWatch logs for errors

