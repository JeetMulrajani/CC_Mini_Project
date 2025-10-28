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
            return {
                'statusCode': 404,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*',
                    'Access-Control-Allow-Headers': 'Content-Type',
                    'Access-Control-Allow-Methods': 'OPTIONS,POST,GET'
                },
                'body': json.dumps({'error': 'Quiz not found'})
            }
        
        quiz = quiz_response['Item']
        questions = quiz['questions']
        
        # Calculate score
        correct = 0
        total = len(questions)
        
        for question in questions:
            q_id = question['questionId']
            user_answer = responses.get(q_id)
            if user_answer is not None:
                try:
                    if int(user_answer) == question['correctAnswer']:
                        correct += 1
                except (ValueError, TypeError):
                    pass  # Skip invalid answers
        
        score = (correct / total) * 100 if total > 0 else 0
        
        # Save response to database
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
        
        # Return results
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
                'incorrect': total - correct,
                'topic': topic
            })
        }
    except Exception as e:
        return {
            'statusCode': 500,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Headers': 'Content-Type',
                'Access-Control-Allow-Methods': 'OPTIONS,POST,GET'
            },
            'body': json.dumps({'error': str(e)})
        }

