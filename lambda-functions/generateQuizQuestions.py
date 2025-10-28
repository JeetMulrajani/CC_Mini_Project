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
        
        # Generate questions based on topic
        questions = generate_questions_for_topic(topic, num_questions)
        
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

def generate_questions_for_topic(topic, num_questions):
    """Generate quiz questions based on topic"""
    
    # Pre-built questions for specific topics
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
            },
            {
                'questionId': '3',
                'question': 'What does JSON stand for?',
                'options': ['JavaScript Object Notation', 'Java Standard Object Notation', 'JavaScript Oriented Notation', 'Java Script Object Network'],
                'correctAnswer': 0
            },
            {
                'questionId': '4',
                'question': 'Which operator is used for strict equality in JavaScript?',
                'options': ['==', '===', '=', '!='],
                'correctAnswer': 1
            },
            {
                'questionId': '5',
                'question': 'What is the result of typeof null in JavaScript?',
                'options': ['null', 'undefined', 'object', 'string'],
                'correctAnswer': 2
            }
        ],
        'react': [
            {
                'questionId': '1',
                'question': 'What is React?',
                'options': ['A database', 'A JavaScript library for building user interfaces', 'A server-side framework', 'A programming language'],
                'correctAnswer': 1
            },
            {
                'questionId': '2',
                'question': 'What is JSX?',
                'options': ['A JavaScript extension', 'A syntax extension for JavaScript', 'A CSS framework', 'A database query language'],
                'correctAnswer': 1
            },
            {
                'questionId': '3',
                'question': 'What is the purpose of useState in React?',
                'options': ['To create global state', 'To manage component state', 'To fetch data', 'To handle events'],
                'correctAnswer': 1
            },
            {
                'questionId': '4',
                'question': 'What is the virtual DOM?',
                'options': ['A real DOM element', 'A JavaScript representation of the DOM', 'A CSS framework', 'A database'],
                'correctAnswer': 1
            },
            {
                'questionId': '5',
                'question': 'What is the correct way to pass data to a child component?',
                'options': ['Through global variables', 'Through props', 'Through CSS', 'Through localStorage'],
                'correctAnswer': 1
            }
        ],
        'python': [
            {
                'questionId': '1',
                'question': 'What is the correct way to create a list in Python?',
                'options': ['list = []', 'list = {}', 'list = ()', 'list = <>'],
                'correctAnswer': 0
            },
            {
                'questionId': '2',
                'question': 'Which keyword is used to define a function in Python?',
                'options': ['function', 'def', 'func', 'define'],
                'correctAnswer': 1
            },
            {
                'questionId': '3',
                'question': 'What is the result of 3 ** 2 in Python?',
                'options': ['6', '9', '5', '1'],
                'correctAnswer': 1
            },
            {
                'questionId': '4',
                'question': 'Which method is used to add an item to a list?',
                'options': ['add()', 'insert()', 'append()', 'Both append() and insert()'],
                'correctAnswer': 3
            },
            {
                'questionId': '5',
                'question': 'What is PEP 8?',
                'options': ['A Python library', 'A Python Enhancement Proposal for code style', 'A Python framework', 'A Python database'],
                'correctAnswer': 1
            }
        ]
    }
    
    # Check if we have pre-built questions for this topic
    topic_lower = topic.lower()
    if topic_lower in topics_db:
        available_questions = topics_db[topic_lower]
        # Return requested number of questions
        return available_questions[:num_questions]
    else:
        # Generate generic questions for unknown topics
        questions = []
        for i in range(num_questions):
            questions.append({
                'questionId': str(i + 1),
                'question': f'What is the most important aspect of {topic}? (Question {i + 1})',
                'options': [
                    f'Theory of {topic}',
                    f'Practice in {topic}',
                    f'Both theory and practice of {topic}',
                    f'Memorization of {topic}'
                ],
                'correctAnswer': i % 4
            })
        return questions

