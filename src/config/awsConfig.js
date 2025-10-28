// AWS Configuration for Quiz Generator
// Replace these values with your actual AWS credentials after setup

const awsConfig = {
  // Cognito Configuration
  Auth: {
    userPoolId: 'YOUR_USER_POOL_ID', // e.g., us-east-1_xxxxxx
    userPoolWebClientId: 'YOUR_APP_CLIENT_ID', // e.g., xxxxxxxxxxxx
    region: 'us-east-1', // Your AWS region
  },
  
  // API Endpoints
  endpoints: {
    generateQuiz: 'YOUR_LAMBDA_FUNCTION_URL_FOR_GENERATE_QUIZ',
    submitQuiz: 'YOUR_LAMBDA_FUNCTION_URL_FOR_SUBMIT_QUIZ',
  }
};

export default awsConfig;

/* 
 * STEP-BY-STEP SETUP:
 * 
 * 1. Complete AWS Setup (see AWS-STEPS.md)
 * 2. Get credentials from AWS Console:
 *    - Cognito User Pool ID
 *    - Cognito App Client ID
 *    - Lambda Function URLs
 * 3. Replace placeholders above with actual values
 * 4. Import this config in your components
 */

