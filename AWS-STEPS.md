# AWS Academy - Step-by-Step Checklist

## Prerequisites ✅
- [ ] Access to AWS Academy Portal
- [ ] Learner Lab started (if required by your institution)
- [ ] Frontend code ready (your React app)

---

## STEP 1: Access AWS Console

### 1.1 Login to AWS Academy
- [ ] Go to: https://awsacademy.instructure.com/
- [ ] Login with your credentials
- [ ] Click **"AWS Details"** to view account info

### 1.2 Access AWS Console
- [ ] Copy the **Console Login Link**
- [ ] Copy the **Account ID**
- [ ] Click the login link
- [ ] You should now see AWS Management Console

**Region**: Make sure you select a supported region (e.g., us-east-1 or us-west-2)

---

## STEP 2: Host Your React Frontend

### Option A: AWS Amplify (Recommended) ⭐

#### 2.1 Prepare Your Code
- [ ] Run `npm run build` locally (tests that code works)
- [ ] Push code to GitHub repository
- [ ] Copy repository URL

#### 2.2 Deploy with Amplify
- [ ] In AWS Console, search for **"Amplify"**
- [ ] Click **"New app"** → **"Host web app"**
- [ ] Choose **"GitHub"**
- [ ] Click **"Connect to GitHub"** and authorize
- [ ] Select your repository and branch
- [ ] Review build settings:
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
- [ ] Click **"Save and deploy"**
- [ ] Wait for deployment to complete
- [ ] Copy your app URL (e.g., https://xxx.amplifyapp.com)

### Option B: Manual Upload (If no GitHub)

- [ ] Build your app: `npm run build`
- [ ] Zip the build folder
- [ ] Go to AWS Amplify → New App
- [ ] Choose **"Deploy without Git provider"**
- [ ] Upload the zip file
- [ ] Wait for deployment

**✅ Checkpoint 1**: Frontend should be accessible at the provided URL

---

## STEP 3: Set Up Authentication (Cognito)

### 3.1 Create User Pool
- [ ] Go to AWS Console → Search **"Cognito"**
- [ ] Click **"Manage User Pools"**
- [ ] Click **"Create a user pool"**
- [ ] Configure:
  - **Name**: `quiz-generator-users`
  - **Step 2**: Keep defaults for security
  - **Step 3**: Select **Email** and **Username** attributes
  - **Step 4**: Set password policy (min 8 chars)
  - **Step 5**: Skip MFA for now
  - **Step 6**: Use email for messages
  - **Step 7**: Skip tags
- [ ] Click **"Create pool"**

### 3.2 Create App Client
- [ ] Click on your user pool
- [ ] Go to **App integration** tab
- [ ] Scroll to **App clients**
- [ ] Click **"Create app client"**
- [ ] Name: `quiz-generator-webapp`
- [ ] **Uncheck** "Generate client secret"
- [ ] Click **"Create app client"**

### 3.3 Save Credentials
- [ ] Copy **User Pool ID**: `us-east-1_xxxxxxxx`
- [ ] Copy **App Client ID**: `xxxxxxxxxxxxxxxx`
- [ ] Write these down - you'll need them!

**✅ Checkpoint 2**: Cognito configured, credentials saved

---

## STEP 4: Create Database Tables (DynamoDB)

### 4.1 Create First Table
- [ ] Go to **DynamoDB** in AWS Console
- [ ] Click **"Create table"**
- [ ] **Table name**: `QuizUsers`
- [ ] **Partition key**: `userId` (String)
- [ ] Click **"Create table"**

### 4.2 Create Second Table
- [ ] Click **"Create table"** again
- [ ] **Table name**: `Quizzes`
- [ ] **Partition key**: `quizId` (String)
- [ ] **Sort key**: `topic` (String)
- [ ] Click **"Create table"**

### 4.3 Create Third Table
- [ ] Click **"Create table"** again
- [ ] **Table name**: `UserResponses`
- [ ] **Partition key**: `responseId` (String)
- [ ] **Sort key**: `userId` (String)
- [ ] Click **"Create table"**

**✅ Checkpoint 3**: Three tables created and ready

---

## STEP 5: Create Lambda Functions

### 5.1 Create First Function: Generate Quiz
- [ ] Go to **Lambda** in AWS Console
- [ ] Click **"Create function"**
- [ ] Choose **"Author from scratch"**
- [ ] Configure:
  - Function name: `generateQuizQuestions`
  - Runtime: **Python 3.11**
  - Architecture: x86_64
- [ ] Click **"Create function"**

### 5.2 Add Code to First Function
- [ ] Scroll to **Code** section
- [ ] Replace default code with Lambda code (see deployment-guide.md)
- [ ] Click **"Deploy"**

### 5.3 Configure Permissions for First Function
- [ ] Click **Configuration** tab
- [ ] Click **Permissions** → Role name
- [ ] Click **"Add permissions"** → **"Attach policies"**
- [ ] Search: `AmazonDynamoDBFullAccess` → Attach
- [ ] Return to Lambda function

### 5.4 Enable Function URL for First Function
- [ ] Go to **Configuration** → **Function URL**
- [ ] Click **"Create function URL"**
- [ ] Auth type: **NONE**
- [ ] Enable **CORS**
- [ ] Click **"Save"**
- [ ] Copy the Function URL

### 5.5 Repeat for Second Function
- [ ] Create function: `submitQuizResponse`
- [ ] Use Python 3.11
- [ ] Add code from deployment-guide.md
- [ ] Configure permissions (DynamoDB + SNS)
- [ ] Enable Function URL
- [ ] Copy the Function URL

**✅ Checkpoint 4**: Two Lambda functions created with URLs

---

## STEP 6: Configure Frontend for AWS

### 6.1 Install Dependencies
```bash
npm install aws-amplify @aws-amplify/ui-react
```

### 6.2 Create Configuration File
- [ ] Create `src/config/awsConfig.js`
- [ ] Add code from deployment-guide.md
- [ ] **Replace placeholders** with your actual values:
  - User Pool ID from Cognito
  - App Client ID from Cognito
  - Lambda Function URLs

### 6.3 Update Components
- [ ] Update `Login.js` with Cognito integration
- [ ] Update `TopicInput.js` to call Lambda
- [ ] Update `Quiz.js` to submit to Lambda

**✅ Checkpoint 5**: Frontend configured to use AWS services

---

## STEP 7: Test Complete Flow

### 7.1 Test Authentication
- [ ] Open your Amplify app URL
- [ ] Try to login
- [ ] Check CloudWatch logs if errors

### 7.2 Test Quiz Generation
- [ ] Enter a topic
- [ ] Generate a quiz
- [ ] Check DynamoDB table to see if data saved

### 7.3 Test Quiz Submission
- [ ] Take the quiz
- [ ] Submit answers
- [ ] Verify results appear correctly

---

## STEP 8: Monitor and Debug

### 8.1 Check Logs
- [ ] Go to **CloudWatch** → **Log groups**
- [ ] Select Lambda function log group
- [ ] Review logs for errors

### 8.2 Check DynamoDB
- [ ] Go to **DynamoDB** → **Tables**
- [ ] Click on a table → **"Explore table items"**
- [ ] Verify data is being saved

### 8.3 Check Usage
- [ ] Go to **Cost Explorer**
- [ ] Monitor AWS Academy credits usage

---

## Important Reminders ⚠️

- [ ] **Credentials**: Keep Cognito credentials secure
- [ ] **Region**: Make sure all services are in same region
- [ ] **CORS**: Always enable CORS for Lambda Function URLs
- [ ] **Time Limit**: Learner Lab may have time restrictions
- [ ] **Costs**: Monitor usage to stay within credits
- [ ] **Security**: Don't expose credentials in frontend code

---

## Quick Reference

### Your AWS Resources
- **App URL**: `https://____.amplifyapp.com`
- **User Pool ID**: `us-east-1_________`
- **App Client ID**: `________`
- **Lambda URL (Generate)**: `https://_____`
- **Lambda URL (Submit)**: `https://_____`

### Common Issues

**CORS Error**: Enable CORS in Function URL settings

**Authentication Error**: Check User Pool ID and App Client ID

**Database Error**: Check table names and Lambda permissions

**Timeout**: Increase Lambda timeout in Configuration → General

---

## Next Steps After Basic Setup

1. Add SNS for email notifications
2. Implement user profiles in DynamoDB
3. Add quiz history and analytics
4. Implement user leaderboards
5. Add social sharing features

---

**Status**: Follow this checklist step-by-step. Check off each item as you complete it!

